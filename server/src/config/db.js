import { Sequelize } from 'sequelize';
import { env } from './env.js';

const e = process.env;
const common = {
  logging: e.DB_LOGGING === 'true' ? console.log : false,
  define: { underscored: true, timestamps: true }
};

let sequelize;

/**
 * Create a Sequelize instance for the default database.
 * In multi-tenant mode, this is the registry database.
 * In single-tenant mode, this is the identity database.
 */
function createDefaultConnection() {
  if (env.multiTenantEnabled) {
    // In multi-tenant mode, use the registry database URL
    const url = env.registryDatabaseUrl;
    if (!url) {
      throw new Error('REGISTRY_DATABASE_URL or DATABASE_URL must be set for multi-tenant mode');
    }
    return new Sequelize(url, {
      dialect: 'postgres',
      ...common,
      pool: { max: Number(e.DB_POOL_MAX) || 5, idle: 10000, acquire: 30000 },
      dialectOptions: e.DB_SSL === 'true'
        ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
        : {},
    });
  } else {
    // Single-tenant mode — Postgres only
    if (!e.DATABASE_URL) throw new Error('Set DATABASE_URL (Postgres) in .env');
    return new Sequelize(e.DATABASE_URL, {
      dialect: 'postgres',
      ...common,
      pool: { max: Number(e.DB_POOL_MAX) || 5, idle: 10000, acquire: 30000 },
      dialectOptions: e.DB_SSL === 'true'
        ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
        : {},
    });
  }
}

// Create the default connection
sequelize = createDefaultConnection();

/**
 * Create a new Sequelize instance for a tenant's database.
 * @param {string} databaseUrl - The database connection string for the tenant
 * @returns {Sequelize} A new Sequelize instance
 */
export function createTenantConnection(databaseUrl) {
  return new Sequelize(databaseUrl, {
    dialect: 'postgres',
    ...common,
    pool: {
      max: env.tenantMaxConnections,
      idle: env.tenantIdleTimeout,
      acquire: 30000,
    },
    dialectOptions: e.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
      : {},
  });
}

export { sequelize };
