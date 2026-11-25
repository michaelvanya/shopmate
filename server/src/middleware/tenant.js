import { Op } from 'sequelize';
import { getTenantModel } from '../config/registry.js';
import { getTenantPool } from '../config/tenantPool.js';
import { HttpError } from '../utils/http.js';
import { env } from '../config/env.js';

/**
 * Tenant identification middleware.
 * Extracts tenant ID from subdomain or X-Tenant-ID header.
 * Looks up tenant in registry, checks status, and attaches tenant info to request.
 */
export async function requireTenant(req, res, next) {
  // Skip if multi-tenant is not enabled
  if (!env.multiTenantEnabled) {
    next();
    return;
  }

  // Skip for public routes that don't need tenant context
  const publicPaths = ['/tenants/signup', '/health'];
  for (const p of publicPaths) {
    if (req.path.startsWith(p)) {
      next();
      return;
    }
  }

  let tenantId;

  // Try to extract tenant ID from X-Tenant-ID header
  const headerTenantId = req.get('X-Tenant-ID');
  if (headerTenantId) {
    tenantId = headerTenantId.trim().toLowerCase();
  }

  // Try to extract tenant ID from subdomain (web)
  if (!tenantId) {
    const host = req.get('host') || '';
    const parts = host.split('.');
    if (parts.length >= 2) {
      // Check if the first part looks like a subdomain (not "www" or IP address)
      const subdomain = parts[0];
      if (subdomain && subdomain !== 'www' && !subdomain.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        tenantId = subdomain.toLowerCase();
      }
    }
  }

  // Try to extract tenant ID from JWT token (fallback)
  if (!tenantId && req.user && req.user.tenantId) {
    tenantId = req.user.tenantId;
  }

  if (!tenantId) {
    throw new HttpError(400, 'Tenant ID is required. Provide X-Tenant-ID header or use a subdomain.');
  }

  // Look up tenant in registry
  const Tenant = getTenantModel();
  const tenant = await Tenant.findOne({
    where: {
      [Op.or]: [
        { subdomain: tenantId },
        { slug: tenantId },
      ],
    },
  });

  if (!tenant) {
    throw new HttpError(404, 'Tenant not found');
  }

  // Check tenant status
  if (tenant.status === 'suspended') {
    throw new HttpError(403, 'Your account has been suspended. Please contact support.');
  }

  if (tenant.status === 'pending') {
    throw new HttpError(403, 'Your account is still being set up. Please try again later.');
  }

  // Get or create Sequelize connection for this tenant
  const pool = getTenantPool();
  const sequelize = pool.get(tenant.id, tenant.databaseUrl);

  // Attach tenant info to request
  req.tenant = {
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    slug: tenant.slug,
  };
  req.sequelize = sequelize;
  req.tenantId = tenant.id;
  res.once('finish', () => pool.release(tenant.id));

  next();
}

/**
 * Optional tenant middleware - doesn't throw if tenant is not found.
 * Useful for routes that should work with or without tenant context.
 * Only resolves tenant if X-Tenant-ID header is explicitly provided.
 */
async function _optionalTenant(req, res, next) {
  // Skip if multi-tenant is not enabled
  if (!env.multiTenantEnabled) {
    next();
    return;
  }

  // Only try to resolve tenant if X-Tenant-ID header is explicitly provided
  const headerTenantId = req.get('X-Tenant-ID');
  if (!headerTenantId) {
    // No tenant header — continue without tenant context (uses default DB)
    next();
    return;
  }

  const tenantId = headerTenantId.trim().toLowerCase();
  if (!tenantId) {
    next();
    return;
  }

  // Look up tenant in registry
  const Tenant = getTenantModel();
  const tenant = await Tenant.findOne({
    where: {
      [Op.or]: [
        { subdomain: tenantId },
        { slug: tenantId },
      ],
    },
  });

  if (!tenant) {
    next();
    return;
  }

  // Check tenant status
  if (tenant.status === 'suspended') {
    next();
    return;
  }

  if (tenant.status === 'pending') {
    next();
    return;
  }

  // Get or create Sequelize connection for this tenant
  const pool = getTenantPool();
  const sequelize = pool.get(tenant.id, tenant.databaseUrl);

  // Attach tenant info to request
  req.tenant = {
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    slug: tenant.slug,
  };
  req.sequelize = sequelize;
  req.tenantId = tenant.id;
  res.once('finish', () => pool.release(tenant.id));

  next();
}

// Wrap async middleware so Express waits for it to complete
export function optionalTenant(req, _res, next) {
  _optionalTenant(req, _res, next).catch(next);
}
