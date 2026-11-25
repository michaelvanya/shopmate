import { Sequelize } from 'sequelize';
import { env } from './env.js';

/**
 * Connection pool manager for tenant-specific databases.
 * Maintains a Map of tenantId → Sequelize instance with idle connection cleanup.
 */
class TenantPool {
  constructor() {
    this.pool = new Map(); // tenantId → { sequelize, lastAccess, refCount }
    this.maxConnections = env.tenantMaxConnections;
    this.idleTimeout = env.tenantIdleTimeout;
    this.cleanupInterval = setInterval(() => this.cleanupIdleConnections(), 60000); // Run every minute
    this.cleanupInterval.unref(); // Don't keep process alive
  }

  /**
   * Get or create a Sequelize instance for the given tenant.
   * @param {string} tenantId - The tenant ID
   * @param {string} databaseUrl - The database connection string for the tenant
   * @returns {Sequelize} The Sequelize instance for the tenant
   */
  get(tenantId, databaseUrl) {
    const entry = this.pool.get(tenantId);
    if (entry) {
      entry.lastAccess = Date.now();
      entry.refCount++;
      return entry.sequelize;
    }

    // Create a new Sequelize instance for this tenant
    const sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: env.DB_LOGGING === 'true' ? console.log : false,
      define: { underscored: true, timestamps: true },
      pool: {
        max: this.maxConnections,
        idle: this.idleTimeout,
        acquire: 30000,
      },
      dialectOptions: env.DB_SSL === 'true'
        ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
        : {},
    });

    this.pool.set(tenantId, {
      sequelize,
      lastAccess: Date.now(),
      refCount: 1,
    });

    console.log(`[TenantPool] Created new connection pool for tenant ${tenantId}`);
    return sequelize;
  }

  /**
   * Release a reference to a tenant's Sequelize instance.
   * When refCount reaches 0, the connection becomes eligible for cleanup.
   * @param {string} tenantId - The tenant ID
   */
  release(tenantId) {
    const entry = this.pool.get(tenantId);
    if (entry) {
      entry.refCount--;
      if (entry.refCount <= 0) {
        entry.refCount = 0;
        // Mark for cleanup if idle
        if (Date.now() - entry.lastAccess > this.idleTimeout) {
          this.close(tenantId);
        }
      }
    }
  }

  /**
   * Close and remove a tenant's connection pool.
   * @param {string} tenantId - The tenant ID
   */
  async close(tenantId) {
    const entry = this.pool.get(tenantId);
    if (entry) {
      try {
        await entry.sequelize.close();
        console.log(`[TenantPool] Closed connection pool for tenant ${tenantId}`);
      } catch (err) {
        console.error(`[TenantPool] Error closing connection for tenant ${tenantId}:`, err.message);
      }
      this.pool.delete(tenantId);
    }
  }

  /**
   * Clean up idle connections that have been unused for longer than the timeout.
   */
  cleanupIdleConnections() {
    const now = Date.now();
    for (const [tenantId, entry] of this.pool.entries()) {
      if (entry.refCount === 0 && now - entry.lastAccess > this.idleTimeout) {
        this.close(tenantId).catch(err => {
          console.error(`[TenantPool] Error during cleanup for tenant ${tenantId}:`, err.message);
        });
      }
    }
  }

  /**
   * Close all connection pools. Call this on server shutdown.
   */
  async closeAll() {
    clearInterval(this.cleanupInterval);
    const promises = [];
    for (const tenantId of this.pool.keys()) {
      promises.push(this.close(tenantId));
    }
    await Promise.allSettled(promises);
    console.log(`[TenantPool] All connection pools closed`);
  }

  /**
   * Get the number of active tenant connections.
   * @returns {number} Number of active tenant connections
   */
  getActiveCount() {
    return this.pool.size;
  }
}

// Singleton instance
let tenantPool;

/**
 * Get the tenant pool singleton.
 * @returns {TenantPool} The tenant pool manager
 */
export function getTenantPool() {
  if (!tenantPool) {
    tenantPool = new TenantPool();
  }
  return tenantPool;
}

/**
 * Initialize the tenant pool (returns the singleton).
 * @returns {TenantPool} The tenant pool manager
 */
export function initTenantPool() {
  return getTenantPool();
}

export { TenantPool };
