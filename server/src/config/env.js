import dotenv from 'dotenv';
dotenv.config();
const e = process.env;
const need = (k) => { if (!e[k]) throw new Error(`Missing env var ${k}. Copy .env.example to .env and fill it in.`); return e[k]; };
export const env = {
  isProd: e.NODE_ENV === 'production',
  port: Number(e.PORT) || 5000,
  origins: (e.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim()),
  jwtSecret: need('JWT_SECRET'),
  refreshSecret: need('JWT_REFRESH_SECRET'),
  cookieDomain: e.COOKIE_DOMAIN || undefined,
  dbSync: e.DB_SYNC === 'true',
  adminIps: (e.ADMIN_ALLOWED_IPS || '').split(',').map((s) => s.trim()).filter(Boolean),
  setupKey: e.SETUP_KEY || '', // optional: if set, first-time setup asks for it
  maxAttempts: Number(e.LOGIN_MAX_ATTEMPTS) || 5, lockMinutes: Number(e.LOGIN_LOCK_MINUTES) || 15,
  // Multi-tenant configuration
  registryDatabaseUrl: e.REGISTRY_DATABASE_URL || e.DATABASE_URL || '', // Central registry database connection string
  masterEncryptionKey: e.MASTER_ENCRYPTION_KEY || '', // Master key for encrypting tenant-specific keys
  tenantDbPrefix: e.TENANT_DB_PREFIX || 'identity_tenant_', // Prefix for tenant database names
  tenantMaxConnections: Number(e.TENANT_MAX_CONNECTIONS) || 10, // Max connections per tenant pool
  tenantIdleTimeout: Number(e.TENANT_IDLE_TIMEOUT) || 300000, // 5 minutes idle timeout for tenant connections
  multiTenantEnabled: e.MULTI_TENANT_ENABLED === 'true', // Flag to enable multi-tenant mode
};
if (env.isProd && (env.jwtSecret.length < 32 || env.refreshSecret.length < 32 || env.jwtSecret === env.refreshSecret))
  throw new Error('In production JWT_SECRET and JWT_REFRESH_SECRET must be different and at least 32 characters.');
