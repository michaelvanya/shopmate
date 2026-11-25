import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { getModels } from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { requireRole } from '../middleware/auth.js';
import { HttpError, ROLES } from '../utils/http.js';
import { passwordRule, generatePassword } from '../utils/password.js';
import { logActivity } from '../utils/activity.js';

const r = Router();
const email = Joi.string().email({ tlds: { allow: false } });
const base = { name: Joi.string().trim().min(2).max(120), phone: Joi.string().allow('', null), role: Joi.string().valid(...ROLES), isActive: Joi.boolean() };
const lastAdminGuard = async (req, target, leaving) => {
  const { User: U } = getModels(req);
  if (target.role === 'admin' && leaving && (await U.count({ where: { role: 'admin', isActive: true } })) <= 1) throw new HttpError(409, 'There must always be at least one active admin');
};

r.patch('/me', validate(Joi.object({ name: base.name, phone: base.phone })), async (req, res) => { await req.user.update(req.valid.body); res.json({ user: req.user }); });

r.get('/', requireRole('admin'), async (req, res) => {
  const { User: U } = getModels(req);
  res.json({ data: await U.findAll({ order: [['createdAt', 'ASC']] }) });
});

r.post('/', requireRole('admin'), validate(Joi.object({ ...base, name: base.name.required(), email: email.required(), password: passwordRule, role: base.role.default('staff') })), async (req, res) => {
  const { User: U } = getModels(req);
  const { password, ...rest } = req.valid.body, temp = password || generatePassword();
  const user = await U.create({ ...rest, passwordHash: await bcrypt.hash(temp, 12), mustChangePassword: true });
  await logActivity(req, 'USER_CREATE', 'user', user.id, { role: user.role });
  res.status(201).json({ user, ...(!password && { temporaryPassword: temp }) });
});

r.patch('/:id', requireRole('admin'), validate(Joi.object({ ...base, resetPassword: Joi.boolean(), unlock: Joi.boolean() })), async (req, res) => {
  const { User: U } = getModels(req);
  const target = await U.unscoped().findByPk(req.params.id); if (!target) throw new HttpError(404, 'User not found');
  const { resetPassword, unlock, ...changes } = req.valid.body;
  if (target.id === req.user.id && (changes.isActive === false || (changes.role && changes.role !== 'admin'))) throw new HttpError(409, 'You cannot deactivate or demote yourself');
  await lastAdminGuard(req, target, changes.isActive === false || (changes.role && changes.role !== 'admin'));
  Object.assign(target, changes); let temporaryPassword;
  if (resetPassword) { temporaryPassword = generatePassword(); target.passwordHash = await bcrypt.hash(temporaryPassword, 12); target.mustChangePassword = true; target.twoFactorEnabled = false; target.twoFactorSecret = null; }
  if (unlock) Object.assign(target, { lockedUntil: null, failedAttempts: 0 });
  if (resetPassword || changes.isActive === false || changes.role) target.tokenVersion += 1;
  await target.save(); await logActivity(req, 'USER_UPDATE', 'user', target.id, { fields: Object.keys(req.valid.body) });
  res.json({ user: target, ...(temporaryPassword && { temporaryPassword }) });
});

r.delete('/:id', requireRole('admin'), async (req, res) => {
  const { User: U } = getModels(req);
  const target = await U.unscoped().findByPk(req.params.id); if (!target) throw new HttpError(404, 'User not found');
  if (target.id === req.user.id) throw new HttpError(409, 'You cannot deactivate yourself');
  await lastAdminGuard(req, target, true); target.isActive = false; target.tokenVersion += 1; await target.save();
  await logActivity(req, 'USER_DEACTIVATE', 'user', target.id); res.json({ ok: true });
});
export default r;
