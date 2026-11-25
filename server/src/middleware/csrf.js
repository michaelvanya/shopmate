import Csrf from 'csrf';
import { HttpError } from '../utils/http.js';
import { cookieOpts } from '../utils/cookies.js';
const tokens = new Csrf();
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
// Stateless: the secret lives in an httpOnly cookie, the matching token is sent in a header.
export function issueCsrf(req, res) {
  let secret = req.cookies?.csrf_secret;
  if (!secret) { secret = tokens.secretSync(); res.cookie('csrf_secret', secret, { ...cookieOpts, maxAge: 30 * 24 * 3600 * 1000 }); }
  res.json({ csrfToken: tokens.create(secret) });
}
export function verifyCsrf(req, _res, next) {
  if (SAFE.has(req.method) || req.get('authorization')?.startsWith('Bearer ')) return next();
  const t = req.get('x-csrf-token') || req.get('x-xsrf-token'); const s = req.cookies?.csrf_secret;
  if (!t || !s || !tokens.verify(s, t)) throw new HttpError(403, 'Invalid or missing CSRF token. Call GET /api/auth/csrf first.');
  next();
}
