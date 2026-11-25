import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';
import { getTenantModel } from '../config/registry.js';
import { getTenantPool } from '../config/tenantPool.js';
import { generateTenantKey, encryptTenantKey } from '../services/encryption.js';
import { env } from '../config/env.js';
import { createTenantConnection } from '../config/db.js';
import { initModels } from '../models/index.js';
import { verifyCsrf } from '../middleware/csrf.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { passwordRule } from '../utils/password.js';
import { HttpError } from '../utils/http.js';
import { setAuthCookies } from '../utils/cookies.js';

const router = Router();
const signupLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  subdomain: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+$/).min(3).max(45).required(),
  adminName: Joi.string().trim().min(2).max(120).required(),
  adminEmail: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  adminPassword: passwordRule.required(),
});

async function provisionSchema(seq) {
  const models = initModels(seq);
  await seq.sync();
  return models;
}

async function adminDatabase() {
  const parts = new URL(env.registryDatabaseUrl);
  parts.pathname = '/postgres';
  return new Sequelize(parts.toString(), { dialect: 'postgres', logging: false });
}

async function createDatabase(databaseName) {
  if (!/^[a-zA-Z0-9_]+$/.test(databaseName) || databaseName.length > 63) throw new HttpError(422, 'Tenant database name is invalid');
  const parts = new URL(env.registryDatabaseUrl);
  const adminSeq = await adminDatabase();
  try {
    await adminSeq.query(`CREATE DATABASE "${databaseName}"`);
  } catch (error) {
    if (error.original?.code === '42P04' || error.parent?.code === '42P04') throw new HttpError(409, 'A tenant database with this name already exists');
    throw error;
  } finally {
    await adminSeq.close();
  }
  parts.pathname = `/${databaseName}`;
  return parts.toString();
}

async function dropDatabase(databaseName) {
  const adminSeq = await adminDatabase();
  try { await adminSeq.query(`DROP DATABASE IF EXISTS "${databaseName}"`); } finally { await adminSeq.close(); }
}

function requirePlatformAdmin(req, res, next) {
  if (req.tenant) throw new HttpError(403, 'Platform administrator access is required');
  return requireRole('admin')(req, res, next);
}

router.post('/signup', signupLimiter, verifyCsrf, validate(signupSchema), async (req, res) => {
  if (!env.multiTenantEnabled) throw new HttpError(503, 'Tenant registration is currently disabled');

  const { name, subdomain, adminName, adminEmail, adminPassword } = req.valid.body;
  const Tenant = getTenantModel();
  if (await Tenant.findOne({ where: { subdomain } })) throw new HttpError(409, 'This tenant name is already taken');
  if (adminPassword.toLowerCase().includes(adminEmail.split('@')[0])) throw new HttpError(422, 'Password must not contain your email name');

  const databaseName = `${env.tenantDbPrefix}${subdomain}`;
  const tenantKey = generateTenantKey();
  const databaseUrl = await createDatabase(databaseName);
  let tenant;
  let tenantSeq;
  try {
    tenant = await Tenant.create({
      name, subdomain, slug: subdomain, databaseName, databaseUrl,
      encryptedKey: encryptTenantKey(tenantKey), status: 'active',
    });
    tenantSeq = createTenantConnection(databaseUrl);
    await tenantSeq.authenticate();
    const { User } = await provisionSchema(tenantSeq);
    const user = await User.create({
      name: adminName, email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12), role: 'admin', isActive: true,
    });
    setAuthCookies(res, user);
    res.status(201).json({
      tenant: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (tenantSeq) await tenantSeq.close().catch(() => {});
    if (tenant) await tenant.destroy().catch(() => {});
    await dropDatabase(databaseName).catch((cleanupError) => console.error('Tenant provisioning cleanup failed:', cleanupError.message));
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, 'Failed to provision tenant');
  } finally {
    if (tenantSeq) await tenantSeq.close().catch(() => {});
  }
});

router.get('/', requireAuth, requirePlatformAdmin, async (_req, res) => {
  const Tenant = getTenantModel();
  const tenants = await Tenant.findAll({ attributes: ['id', 'name', 'subdomain', 'slug', 'status', 'createdAt'], order: [['createdAt', 'DESC']] });
  res.json({ tenants });
});

router.get('/:id', requireAuth, requirePlatformAdmin, async (req, res) => {
  const Tenant = getTenantModel();
  const tenant = await Tenant.findByPk(req.params.id, { attributes: ['id', 'name', 'subdomain', 'slug', 'databaseName', 'status', 'createdAt', 'updatedAt'] });
  if (!tenant) throw new HttpError(404, 'Tenant not found');
  res.json({ tenant });
});

router.patch('/:id', verifyCsrf, requireAuth, requirePlatformAdmin, validate(Joi.object({ status: Joi.string().valid('active', 'suspended').required() })), async (req, res) => {
  const Tenant = getTenantModel();
  const tenant = await Tenant.findByPk(req.params.id);
  if (!tenant) throw new HttpError(404, 'Tenant not found');
  await tenant.update({ status: req.valid.body.status });
  if (tenant.status === 'suspended') await getTenantPool().close(tenant.id);
  res.json({ tenant: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain, status: tenant.status } });
});

router.delete('/:id', verifyCsrf, requireAuth, requirePlatformAdmin, async (req, res) => {
  const Tenant = getTenantModel();
  const tenant = await Tenant.findByPk(req.params.id);
  if (!tenant) throw new HttpError(404, 'Tenant not found');
  await tenant.update({ status: 'suspended' });
  await getTenantPool().close(tenant.id);
  res.json({ message: 'Tenant suspended successfully', tenant: { id: tenant.id, name: tenant.name, status: tenant.status } });
});

export default router;
