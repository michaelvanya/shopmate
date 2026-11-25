import { HttpError } from '../utils/http.js';
import { env } from '../config/env.js';
export const notFound = (_req, _res, next) => next(new HttpError(404, 'Route not found'));
export function errorHandler(err, _req, res, _next) {
  let { status = 500, message, details, code } = err;
  if (err.name === 'SequelizeUniqueConstraintError') { status = 409; message = 'That value already exists'; details = err.errors?.map((e) => ({ field: e.path, message: 'Already in use' })); }
  else if (err.name === 'SequelizeValidationError') { status = 422; message = 'Validation failed'; details = err.errors?.map((e) => ({ field: e.path, message: e.message })); }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON'; }
  if (status >= 500) { console.error(err); if (env.isProd) message = 'Something went wrong'; }
  res.status(status).json({ error: message || 'Something went wrong', ...(code && { code }), ...(details && { details }) });
}
