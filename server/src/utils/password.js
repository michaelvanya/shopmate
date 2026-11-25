import crypto from 'node:crypto';
import Joi from 'joi';
export const passwordRule = Joi.string().min(10).max(100).pattern(/[a-z]/).pattern(/[A-Z]/).pattern(/\d/)
  .messages({ 'string.pattern.base': 'Password must include an upper-case letter, a lower-case letter and a number' });
const SETS = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@#$%*?'];
// Cryptographically random, always contains every character type.
export function generatePassword(len = 16) {
  const all = SETS.join(''), pick = (s) => s[crypto.randomInt(s.length)], c = SETS.map(pick);
  while (c.length < len) c.push(pick(all));
  for (let i = c.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [c[i], c[j]] = [c[j], c[i]]; }
  return c.join('');
}
