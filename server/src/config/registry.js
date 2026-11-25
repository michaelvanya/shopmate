import { Sequelize, DataTypes as T } from 'sequelize';
import { env } from './env.js';

let registrySequelize;
let Tenant;

/**
 * Initialize the registry database connection.
 * The registry is a central Postgres database that stores tenant metadata
 * and encrypted tenant-specific encryption keys.
 */
export function initRegistry() {
  if (registrySequelize) return registrySequelize;

  const url = env.registryDatabaseUrl;
  if (!url) {
    throw new Error('REGISTRY_DATABASE_URL or DATABASE_URL must be set for multi-tenant mode');
  }

  registrySequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: env.DB_LOGGING === 'true' ? console.log : false,
    define: { underscored: true, timestamps: true },
    pool: { max: 5, idle: 10000, acquire: 30000 },
    dialectOptions: env.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
      : {},
  });

  // Define the Tenant model
  Tenant = registrySequelize.define('Tenant', {
    id: { type: T.UUID, defaultValue: T.UUIDV4, primaryKey: true },
    name: { type: T.STRING(120), allowNull: false },
    subdomain: { type: T.STRING(60), allowNull: false, unique: true },
    slug: { type: T.STRING(60), allowNull: false, unique: true },
    databaseName: { type: T.STRING(120), allowNull: false },
    databaseUrl: { type: T.TEXT, allowNull: false },
    encryptedKey: { type: T.TEXT, allowNull: false }, // Tenant encryption key, encrypted with master key
    status: {
      type: T.ENUM('active', 'suspended', 'pending'),
      allowNull: false,
      defaultValue: 'active',
    },
    createdAt: T.DATE,
    updatedAt: T.DATE,
  }, {
    tableName: 'tenants',
    indexes: [
      { fields: ['subdomain'] },
      { fields: ['slug'] },
      { fields: ['status'] },
    ],
  });

  return registrySequelize;
}

/**
 * Get the registry Sequelize instance.
 * Call initRegistry() first.
 */
export function getRegistry() {
  if (!registrySequelize) {
    throw new Error('Registry not initialized. Call initRegistry() first.');
  }
  return registrySequelize;
}

/**
 * Get the Tenant model.
 */
export function getTenantModel() {
  if (!Tenant) {
    throw new Error('Tenant model not initialized. Call initRegistry() first.');
  }
  return Tenant;
}

export { Tenant };
