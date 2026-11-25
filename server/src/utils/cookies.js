import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
// Cross-site frontends (e.g. Netlify) need SameSite=None + Secure in production.
export const cookieOpts = { httpOnly: true, secure: env.isProd, sameSite: env.isProd ? 'none' : 'lax', domain: env.cookieDomain };
const payload = (u) => {
  const base = { id: u.id, tv: u.tokenVersion, role: u.role };
  // Include tenantId in JWT payload for multi-tenant mode
  if (env.multiTenantEnabled && u.tenantId) {
    base.tenantId = u.tenantId;
  }
  return base;
};
export const signAccess = (u) => jwt.sign(payload(u), env.jwtSecret, { expiresIn: '15m' });
export const signRefresh = (u) => jwt.sign(payload(u), env.refreshSecret, { expiresIn: '7d' });
export function setAuthCookies(res, user) {
  res.cookie('access_token', signAccess(user), { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', signRefresh(user), { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
}
export function clearAuthCookies(res) {
  res.clearCookie('access_token', cookieOpts);
  res.clearCookie('refresh_token', cookieOpts);
}
