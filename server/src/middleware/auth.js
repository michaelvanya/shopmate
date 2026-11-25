import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getModels, User } from '../models/index.js';
import { HttpError, atLeast } from '../utils/http.js';
// While a temporary password is active, only these routes work.
const OPEN = new Set(['/api/auth/me', '/api/auth/change-password', '/api/auth/logout-all']);
export async function requireAuth(req, _res, next) {
  const bearer = req.get('authorization')?.startsWith('Bearer ') ? req.get('authorization').slice(7) : null;
  const token = req.cookies?.access_token || bearer;
  if (!token) throw new HttpError(401, 'Please sign in');
  let d; try { d = jwt.verify(token, env.jwtSecret); } catch { throw new HttpError(401, 'Session expired, please sign in again'); }
  
  const UserModel = env.multiTenantEnabled && req.sequelize ? getModels(req).User : User;
  const user = await UserModel.findByPk(d.id);
  if (!user || !user.isActive || user.tokenVersion !== d.tv) throw new HttpError(401, 'Session is no longer valid');
  if (user.mustChangePassword && !OPEN.has(req.originalUrl.split('?')[0])) throw new HttpError(403, 'You must change your temporary password first', undefined, 'PASSWORD_CHANGE_REQUIRED');
  req.user = user; next();
}
export const requireRole = (role) => (req, _res, next) => {
  if (!atLeast(req.user, role)) throw new HttpError(403, `This needs ${role} access`); next();
};
