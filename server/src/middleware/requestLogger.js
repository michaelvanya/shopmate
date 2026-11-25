// Structured request/response logging for debugging.
// Logs method, path, status, duration, user, and query/body (redacted) to console as JSON.
// In production, this can be replaced with a proper logger (Winston/Pino).
import { env } from '../config/env.js';

const REDACT = new Set(['password', 'passwordHash', 'currentPassword', 'newPassword', 'token', 'refreshToken', 'twoFactorSecret']);

function scrub(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if ([...REDACT].some((r) => lower.includes(r))) out[k] = '***';
    else if (typeof v === 'object' && v !== null) out[k] = scrub(v);
    else out[k] = v;
  }
  return out;
}

export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;
  const userId = req.user?.id || null;
  const userName = req.user?.name || null;

  // Capture request body (already parsed by express.json)
  const body = req.body && Object.keys(req.body).length ? scrub(req.body) : undefined;
  const query = req.query && Object.keys(req.query).length ? scrub(req.query) : undefined;

  // Listen for response finish
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const log = {
      ts: new Date().toISOString(),
      method,
      path: originalUrl,
      status: res.statusCode,
      ms: Math.round(ms),
      userId,
      userName,
    };
    if (body) log.body = body;
    if (query) log.query = query;

    if (env.isProd) {
      // Production: structured JSON to stdout
      process.stdout.write(JSON.stringify(log) + '\n');
    } else {
      // Dev: human-readable
      const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      const reset = '\x1b[0m';
      console.log(`${color}${method} ${originalUrl} ${res.statusCode} ${Math.round(ms)}ms${reset}${userId ? ` (${userName})` : ''}`);
    }
  });

  next();
}
