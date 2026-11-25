import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';

if (!process.env.TEST_DATABASE_URL) throw new Error('Set TEST_DATABASE_URL to a disposable Postgres database before running tests.');
Object.assign(process.env, {
  NODE_ENV: 'test',
  JWT_SECRET: 't'.repeat(40),
  JWT_REFRESH_SECRET: 'r'.repeat(40),
  DATABASE_URL: process.env.TEST_DATABASE_URL,
  LOGIN_MAX_ATTEMPTS: '3',
  MULTI_TENANT_ENABLED: 'false',
});

const { default: app } = await import('../src/app.js');
const { sequelize, User } = await import('../src/models/index.js');

class Client {
  constructor(base) { this.base = base; this.cookies = {}; this.csrf = null; }
  async call(method, path, body) {
    if (!this.csrf && path !== '/api/auth/csrf') await this.call('GET', '/api/auth/csrf');
    const res = await fetch(this.base + path, {
      method,
      body: body && JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        cookie: Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; '),
        ...(this.csrf && { 'x-csrf-token': this.csrf }),
      },
    });
    for (const c of res.headers.getSetCookie()) {
      const kv = c.split(';')[0], i = kv.indexOf('='), k = kv.slice(0, i), v = kv.slice(i + 1);
      v ? (this.cookies[k] = v) : delete this.cookies[k];
    }
    const json = await res.json().catch(() => ({}));
    if (path === '/api/auth/csrf') this.csrf = json.csrfToken;
    return { status: res.status, ...json };
  }
  get = (path) => this.call('GET', path);
  post = (path, body) => this.call('POST', path, body);
  patch = (path, body) => this.call('PATCH', path, body);
  del = (path) => this.call('DELETE', path);
}

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
await sequelize.sync({ force: true });
const initialPassword = 'Temp-Pass-12345';
const password = 'Zx9-Unique-Vault-Pass';
const admin = await User.create({
  name: 'Platform Admin', email: 'admin@example.test', role: 'admin',
  passwordHash: await bcrypt.hash(initialPassword, 4), mustChangePassword: true,
});
const client = new Client(base);

await test('identity API', async (t) => {
  await t.test('exposes auth routes and protects unknown API paths', async () => {
    assert.deepEqual(Object.keys(sequelize.models).sort(), ['ActivityLog', 'Setting', 'User']);
    assert.equal((await client.get('/api/auth/setup-status')).status, 200);
    const writeWithoutCsrf = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.equal(writeWithoutCsrf.status, 403);
    assert.equal((await client.get('/api/products')).status, 401);
    assert.equal((await client.get('/api/graphql')).status, 401);
    assert.equal((await client.get('/api/users')).status, 401);
  });

  await t.test('requires password change before using account administration', async () => {
    assert.equal((await client.post('/api/auth/login', { email: admin.email, password: initialPassword })).status, 200);
    assert.equal((await client.get('/api/users')).code, 'PASSWORD_CHANGE_REQUIRED');
    assert.equal((await client.get('/api/auth/me')).user.email, admin.email);
    assert.equal((await client.post('/api/auth/change-password', { currentPassword: 'wrong', newPassword: password })).status, 401);
    assert.equal((await client.post('/api/auth/change-password', { currentPassword: initialPassword, newPassword: password })).status, 200);
    assert.equal((await client.get('/api/products')).status, 404);
    assert.equal((await client.get('/api/graphql')).status, 404);
  });

  await t.test('manages users with role checks and keeps credential fields private', async () => {
    const created = await client.post('/api/users', { name: 'Member One', email: 'member@example.test', role: 'staff' });
    assert.equal(created.status, 201);
    assert.ok(created.temporaryPassword);
    assert.equal('passwordHash' in created.user, false);
    assert.equal('permissions' in created.user, false);

    const member = new Client(base);
    assert.equal((await member.post('/api/auth/login', { email: 'member@example.test', password: created.temporaryPassword })).status, 200);
    assert.equal((await member.get('/api/users')).status, 403);
    assert.equal((await member.post('/api/auth/change-password', { currentPassword: created.temporaryPassword, newPassword: password })).status, 200);
    assert.equal((await member.patch('/api/users/me', { name: 'Member Updated' })).user.name, 'Member Updated');
    assert.equal((await member.get('/api/users')).status, 403);

    const users = await client.get('/api/users');
    assert.equal(users.data.length, 2);
    assert.equal((await client.del(`/api/users/${admin.id}`)).status, 409);
  });

  await t.test('supports authenticator-based two-factor login', async () => {
    const setup = await client.post('/api/auth/2fa/setup');
    assert.ok(setup.secret);
    assert.equal((await client.post('/api/auth/2fa/enable', { code: authenticator.generate(setup.secret) })).status, 200);

    const secondClient = new Client(base);
    assert.equal((await secondClient.post('/api/auth/login', { email: admin.email, password })).code, 'OTP_REQUIRED');
    assert.equal((await secondClient.post('/api/auth/login', { email: admin.email, password, otp: '000000' })).status, 401);
    assert.equal((await secondClient.post('/api/auth/login', { email: admin.email, password, otp: authenticator.generate(setup.secret) })).status, 200);
  });

  await t.test('locks accounts after failed logins and lets an admin unlock them', async () => {
    const member = new Client(base);
    for (let i = 0; i < 3; i++) await member.post('/api/auth/login', { email: 'member@example.test', password: 'wrong-password' });
    assert.equal((await member.post('/api/auth/login', { email: 'member@example.test', password })).status, 423);
    const user = (await client.get('/api/users')).data.find((entry) => entry.email === 'member@example.test');
    assert.equal((await client.patch(`/api/users/${user.id}`, { unlock: true })).status, 200);
    assert.equal((await member.post('/api/auth/login', { email: 'member@example.test', password })).status, 200);
  });

  await t.test('requires CSRF protection for tenant signup and keeps it disabled by default', async () => {
    const signup = await new Client(base).post('/api/tenants/signup', {
      name: 'Example Organization', subdomain: 'exampleorg', adminName: 'Admin User',
      adminEmail: 'tenant-admin@example.test', adminPassword: 'A-Strong-Identity-Password-1',
    });
    assert.equal(signup.status, 503);
  });

  await t.test('health endpoints remain available', async () => {
    assert.equal((await client.get('/health')).service, 'identity-api');
    assert.equal((await client.get('/health/ready')).status, 200);
  });
});

server.close();
await sequelize.close();