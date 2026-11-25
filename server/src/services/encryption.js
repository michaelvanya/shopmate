import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Derive the master encryption key from the environment variable.
 * Uses SHA-256 to ensure the key is exactly 32 bytes.
 * @returns {Buffer} The master encryption key
 */
function getMasterKey() {
  const key = env.masterEncryptionKey;
  if (!key) {
    throw new Error('MASTER_ENCRYPTION_KEY environment variable is not set');
  }
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt a plaintext value using AES-256-GCM with a tenant-specific key.
 * @param {string} plaintext - The plaintext to encrypt
 * @param {Buffer|string} tenantKey - The tenant-specific encryption key
 * @returns {string} The encrypted ciphertext as hex (iv:tag:ciphertext format)
 */
export function encrypt(plaintext, tenantKey) {
  if (!plaintext) return plaintext;
  
  const keyBuffer = Buffer.isBuffer(tenantKey) ? tenantKey : Buffer.from(tenantKey, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'binary');
  encrypted += cipher.final('binary');
  
  const tag = cipher.getAuthTag();
  // Format: iv:tag:ciphertext (all hex encoded)
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + Buffer.from(encrypted, 'binary').toString('hex');
}

/**
 * Decrypt a ciphertext value using AES-256-GCM with a tenant-specific key.
 * @param {string} ciphertext - The encrypted ciphertext (iv:tag:ciphertext format)
 * @param {Buffer|string} tenantKey - The tenant-specific encryption key
 * @returns {string} The decrypted plaintext
 */
export function decrypt(ciphertext, tenantKey) {
  if (!ciphertext) return ciphertext;
  
  // Check if the value looks encrypted (contains colons and hex characters)
  if (!ciphertext.includes(':')) {
    return ciphertext; // Not encrypted, return as-is
  }
  
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [ivHex, tagHex, encryptedHex] = parts;
  const keyBuffer = Buffer.isBuffer(tenantKey) ? tenantKey : Buffer.from(tenantKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'binary', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a new random encryption key for a tenant.
 * @returns {string} The new encryption key as hex string
 */
export function generateTenantKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt a tenant key using the master key for storage in the registry.
 * @param {string} tenantKey - The tenant-specific encryption key
 * @returns {string} The encrypted tenant key
 */
export function encryptTenantKey(tenantKey) {
  const masterKey = getMasterKey();
  return encrypt(tenantKey, masterKey);
}

/**
 * Decrypt a tenant key using the master key from the registry.
 * @param {string} encryptedTenantKey - The encrypted tenant key from the registry
 * @returns {string} The decrypted tenant key
 */
export function decryptTenantKey(encryptedTenantKey) {
  const masterKey = getMasterKey();
  return decrypt(encryptedTenantKey, masterKey);
}


