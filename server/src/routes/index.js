import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { optionalTenant } from '../middleware/tenant.js';
import { verifyCsrf } from '../middleware/csrf.js';
import auth from './auth.js';
import users from './users.js';
import tenants from './tenants.js';

const api = Router();
api.use(optionalTenant);                   // resolve tenant context first (optional, doesn't fail if missing)
api.use('/auth', auth);                    // public (login etc.) — no CSRF, no auth required
api.use('/tenants', tenants);              // tenant management (signup is public)
api.use(verifyCsrf);                       // every POST/PATCH/DELETE needs a CSRF token
api.use(requireAuth);                      // everything below needs a signed-in user
api.use('/users', users);
export default api;
