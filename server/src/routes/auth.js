import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import crypto from 'node:crypto';
import { getModels, User as DefaultUser, Setting as DefaultSetting, sequelize as DefaultSequelize } from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { issueCsrf, verifyCsrf } from '../middleware/csrf.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import { passwordRule } from '../utils/password.js';
import { HttpError } from '../utils/http.js';
import { logActivity } from '../utils/activity.js';

const r = Router();
authenticator.options = { window: 1 }; // tolerate 30s clock drift
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts from this device. Try again in 15 minutes.' } });
const DUMMY = bcrypt.hashSync('not-a-real-password', 12); // keeps timing equal for unknown emails
const code6 = Joi.string().pattern(/^\d{6}$/).messages({ 'string.pattern.base': 'Code must be 6 digits' });

r.get('/csrf', issueCsrf);
r.use(verifyCsrf);

// ---- First-time setup: uses default models (no tenant context yet) ----
r.get('/setup-status', async (_req, res) => res.json({ needsSetup: (await DefaultUser.count()) === 0, needsKey: Boolean(env.setupKey) }));
const sameKey = (a = '', b = '') => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
r.post('/setup', limiter, validate(Joi.object({ name: Joi.string().trim().min(2).max(120).required(), email: Joi.string().email({ tlds: { allow: false } }).required(), phone: Joi.string().allow('', null), password: passwordRule.required(), setupKey: Joi.string().allow('') })), async (req, res) => {
  const done = () => new HttpError(403, 'Setup is already done. Please sign in.', undefined, 'SETUP_DONE');
  if ((await DefaultUser.count()) > 0) throw done();
  const { password, setupKey, ...rest } = req.valid.body;
  if (env.setupKey && !sameKey(setupKey || '', env.setupKey)) throw new HttpError(403, 'That setup key is wrong', undefined, 'SETUP_KEY_WRONG');
  if (password.toLowerCase().includes(rest.email.split('@')[0].toLowerCase())) throw new HttpError(422, 'Password must not contain your email name');
  const hash = await bcrypt.hash(password, 12);
  const user = await DefaultSequelize.transaction(async (t) => {
    try { await DefaultSetting.create({ key: 'setup_done', value: new Date().toISOString() }, { transaction: t }); } catch { throw done(); }
    return DefaultUser.create({ ...rest, role: 'admin', passwordHash: hash, mustChangePassword: false, lastLoginAt: new Date() }, { transaction: t });
  });
  req.user = user; await logActivity(req, 'SETUP_ADMIN', 'user', user.id);
  setAuthCookies(res, user); res.status(201).json({ user });
});

async function recordFailure(req, user, why) {
  user.failedAttempts += 1; req.user = user;
  if (user.failedAttempts >= env.maxAttempts) {
    user.lockedUntil = new Date(Date.now() + env.lockMinutes * 60000); user.failedAttempts = 0;
    await logActivity(req, 'ACCOUNT_LOCKED', 'user', user.id, { minutes: env.lockMinutes });
  }
  await user.save(); await logActivity(req, 'LOGIN_FAILED', 'user', user.id, { why });
}

// Login: in multi-tenant mode, the tenant middleware runs BEFORE auth,
// so req.sequelize is available and we use the tenant's User model.
// In single-tenant mode, the default User model is used.
r.post('/login', limiter, validate(Joi.object({ email: Joi.string().email({ tlds: { allow: false } }).required(), password: Joi.string().required(), otp: code6 })), async (req, res) => {
  const { email, password, otp } = req.valid.body;
  // In multi-tenant mode, use tenant-specific User model; otherwise use default
  const User = req?.sequelize ? getModels(req).User : DefaultUser;
  const user = await User.unscoped().findOne({ where: { email: email.toLowerCase() } });
  if (user?.lockedUntil && user.lockedUntil > new Date())
    throw new HttpError(423, `Account locked after too many failed attempts. Try again in ${Math.ceil((user.lockedUntil - Date.now()) / 60000)} minute(s).`, undefined, 'ACCOUNT_LOCKED');
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY);
  if (!user || !ok) {
    if (user) await recordFailure(req, user, 'bad password'); else await logActivity(req, 'LOGIN_FAILED', 'user', null, { email });
    throw new HttpError(401, 'Wrong email or password');
  }
  if (!user.isActive) throw new HttpError(403, 'This account has been deactivated');
  if (user.role === 'admin' && env.adminIps.length && !env.adminIps.includes(req.ip)) { req.user = user; await logActivity(req, 'ADMIN_LOGIN_BLOCKED_IP', 'user', user.id); throw new HttpError(403, 'Admin sign-in is not allowed from this network'); }
  if (user.twoFactorEnabled) {
    if (!otp) throw new HttpError(401, 'Enter the 6-digit code from your authenticator app', undefined, 'OTP_REQUIRED');
    if (!authenticator.check(otp, user.twoFactorSecret)) { await recordFailure(req, user, 'bad otp'); throw new HttpError(401, 'That code is not valid', undefined, 'OTP_INVALID'); }
  }
  Object.assign(user, { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() }); await user.save(); req.user = user;
  await logActivity(req, 'LOGIN', 'user', user.id); setAuthCookies(res, user);
  // Return tenant info if available in multi-tenant mode
  const response = { user };
  if (req.tenant) {
    response.tenant = { id: req.tenant.id, name: req.tenant.name, slug: req.tenant.slug };
  }
  res.json(response);
});

// Refresh: in multi-tenant mode, use tenant-specific User model
r.post('/refresh', async (req, res) => {
  let d; try { d = jwt.verify(req.cookies?.refresh_token, env.refreshSecret); } catch { throw new HttpError(401, 'Please sign in again'); }
  // In multi-tenant mode, use tenant-specific User model; otherwise use default
  const User = req?.sequelize ? getModels(req).User : DefaultUser;
  const user = await User.findByPk(d.id);
  if (!user?.isActive || user.tokenVersion !== d.tv) throw new HttpError(401, 'Please sign in again');
  setAuthCookies(res, user);
  const response = { user };
  if (req.tenant) {
    response.tenant = { id: req.tenant.id, name: req.tenant.name, slug: req.tenant.slug };
  }
  res.json(response);
});

r.post('/logout', (_req, res) => { clearAuthCookies(res); res.json({ ok: true }); });

// Authenticated routes — use tenant-specific models
r.post('/logout-all', requireAuth, async (req, res) => { req.user.tokenVersion += 1; await req.user.save(); clearAuthCookies(res); await logActivity(req, 'LOGOUT_ALL', 'user', req.user.id); res.json({ ok: true }); });
r.get('/me', requireAuth, (req, res) => {
  const response = { user: req.user };
  if (req.tenant) {
    response.tenant = { id: req.tenant.id, name: req.tenant.name, slug: req.tenant.slug };
  }
  res.json(response);
});

r.post('/change-password', requireAuth, limiter, validate(Joi.object({ currentPassword: Joi.string().required(), newPassword: passwordRule.required() })), async (req, res) => {
  const { User: U } = getModels(req);
  const { currentPassword, newPassword } = req.valid.body, user = await U.unscoped().findByPk(req.user.id);
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) throw new HttpError(401, 'Current password is wrong');
  if (currentPassword === newPassword) throw new HttpError(422, 'Choose a different password from the current one');
  if (newPassword.toLowerCase().includes(user.email.split('@')[0])) throw new HttpError(422, 'Password must not contain your email name');
  Object.assign(user, { passwordHash: await bcrypt.hash(newPassword, 12), mustChangePassword: false, passwordChangedAt: new Date() });
  user.tokenVersion += 1; await user.save();
  await logActivity(req, 'PASSWORD_CHANGE', 'user', user.id); setAuthCookies(res, user); res.json({ ok: true, user });
});

r.post('/2fa/setup', requireAuth, async (req, res) => {
  if (req.user.twoFactorEnabled) throw new HttpError(409, 'Two-factor is already on');
  const secret = authenticator.generateSecret(); await req.user.update({ twoFactorSecret: secret });
  res.json({ secret, otpauthUrl: authenticator.keyuri(req.user.email, 'Identity Service', secret) });
});
r.post('/2fa/enable', requireAuth, validate(Joi.object({ code: code6.required() })), async (req, res) => {
  const { User: U } = getModels(req);
  const u = await U.unscoped().findByPk(req.user.id);
  if (!u.twoFactorSecret) throw new HttpError(409, 'Start setup first');
  if (!authenticator.check(req.valid.body.code, u.twoFactorSecret)) throw new HttpError(422, 'That code is not valid');
  await u.update({ twoFactorEnabled: true, tokenVersion: u.tokenVersion + 1 }); req.user = u;
  await logActivity(req, '2FA_ENABLED', 'user', u.id); setAuthCookies(res, u); res.json({ ok: true });
});
r.post('/2fa/disable', requireAuth, validate(Joi.object({ password: Joi.string().required(), code: code6.required() })), async (req, res) => {
  const { User: U } = getModels(req);
  const u = await U.unscoped().findByPk(req.user.id);
  if (!u.twoFactorEnabled) throw new HttpError(409, 'Two-factor is not on');
  if (!(await bcrypt.compare(req.valid.body.password, u.passwordHash)) || !authenticator.check(req.valid.body.code, u.twoFactorSecret)) throw new HttpError(401, 'Password or code is wrong');
  await u.update({ twoFactorEnabled: false, twoFactorSecret: null }); await logActivity(req, '2FA_DISABLED', 'user', u.id); res.json({ ok: true });
});
export default r;
