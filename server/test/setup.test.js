// First-time setup: the admin account is created from the app, once only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
if (!process.env.TEST_DATABASE_URL) throw new Error('Set TEST_DATABASE_URL to a disposable Postgres database before running tests.');
Object.assign(process.env, { NODE_ENV: 'test', JWT_SECRET: 't'.repeat(40), JWT_REFRESH_SECRET: 'r'.repeat(40), DATABASE_URL: process.env.TEST_DATABASE_URL, SETUP_KEY: 'open-sesame-123', MULTI_TENANT_ENABLED: 'false' });
const { default: app } = await import('../src/app.js');
const { sequelize, Setting, User } = await import('../src/models/index.js');
class Client {
  constructor(base) { this.base = base; this.cookies = {}; this.csrf = null; }
  async call(method, path, body) {
    if (!this.csrf && path !== '/api/auth/csrf') await this.call('GET', '/api/auth/csrf');
    const res = await fetch(this.base + path, { method, body: body && JSON.stringify(body), headers: { 'content-type': 'application/json', cookie: Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; '), ...(this.csrf && { 'x-csrf-token': this.csrf }) } });
    for (const c of res.headers.getSetCookie()) { const kv = c.split(';')[0], i = kv.indexOf('='), k = kv.slice(0, i), v = kv.slice(i + 1); v ? (this.cookies[k] = v) : delete this.cookies[k]; }
    const json = await res.json().catch(() => ({})); if (path === '/api/auth/csrf') this.csrf = json.csrfToken; return { status: res.status, ...json };
  }
}
const server = http.createServer(app); await new Promise((r) => server.listen(0, '127.0.0.1', r)); const c = new Client(`http://127.0.0.1:${server.address().port}`);
await sequelize.sync({ force: true });
const form = { name: 'Michael Joyleo', email: 'owner@example.test', password: 'Strong-Pass-2026x', setupKey: 'open-sesame-123' };
await test('first-time setup', async (t) => {
  await t.test('a fresh database asks for setup', async () => { const s = await c.call('GET', '/api/auth/setup-status'); assert.equal(s.needsSetup, true); assert.equal(s.needsKey, true); });
  await t.test('wrong or missing setup key is refused', async () => {
    assert.equal((await c.call('POST', '/api/auth/setup', { ...form, setupKey: 'nope' })).code, 'SETUP_KEY_WRONG');
    assert.equal((await c.call('POST', '/api/auth/setup', { ...form, setupKey: '' })).status, 403);
  });
  await t.test('weak passwords and passwords containing the email name are refused', async () => {
    assert.equal((await c.call('POST', '/api/auth/setup', { ...form, password: 'weak' })).status, 422);
    assert.equal((await c.call('POST', '/api/auth/setup', { ...form, password: 'Owner-Pass-2026x' })).status, 422);
  });
  await t.test('the one-time guard blocks a second finisher even if no user exists yet', async () => {
    await Setting.create({ key: 'setup_done', value: 'x' }); assert.equal((await c.call('POST', '/api/auth/setup', form)).code, 'SETUP_DONE'); await Setting.destroy({ where: { key: 'setup_done' } });
  });
  await t.test('correct details create the admin and sign them in', async () => {
    const r = await c.call('POST', '/api/auth/setup', form); assert.equal(r.status, 201); assert.equal(r.user.role, 'admin'); assert.equal(r.user.mustChangePassword, false); assert.equal('permissions' in r.user, false);
    assert.equal((await c.call('GET', '/api/auth/me')).user.email, 'owner@example.test');
    assert.equal(await User.count(), 1);
  });
  await t.test('setup closes for good', async () => {
    assert.equal((await c.call('GET', '/api/auth/setup-status')).needsSetup, false);
    assert.equal((await new Client(c.base).call('POST', '/api/auth/setup', { ...form, email: 'other@example.test', name: 'Someone Else' })).code, 'SETUP_DONE');
    assert.equal(await User.count(), 1);
  });
});
server.close(); await sequelize.close();
