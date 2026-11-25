import { DataTypes as T } from 'sequelize';
import { sequelize } from '../config/db.js';

const id = { type: T.UUID, defaultValue: T.UUIDV4, primaryKey: true };
const modelsCache = new Map();

export function initModels(seq) {
  if (modelsCache.has(seq)) return modelsCache.get(seq);

  const User = seq.define('User', {
    id, name: { type: T.STRING(120), allowNull: false },
    email: { type: T.STRING(255), allowNull: false, unique: true, validate: { isEmail: true }, set(v) { this.setDataValue('email', String(v).trim().toLowerCase()); } },
    phone: T.STRING(40), passwordHash: { type: T.STRING, allowNull: false },
    role: { type: T.STRING(20), allowNull: false, defaultValue: 'staff', validate: { isIn: [['admin', 'staff']] } },
    isActive: { type: T.BOOLEAN, defaultValue: true }, tokenVersion: { type: T.INTEGER, defaultValue: 0 }, lastLoginAt: T.DATE,
    failedAttempts: { type: T.INTEGER, defaultValue: 0 }, lockedUntil: T.DATE, mustChangePassword: { type: T.BOOLEAN, defaultValue: false },
    twoFactorEnabled: { type: T.BOOLEAN, defaultValue: false }, twoFactorSecret: T.STRING, passwordChangedAt: T.DATE,
  }, { tableName: 'users' });
  User.prototype.toJSON = function () {
    const v = { ...this.get() };
    for (const field of ['passwordHash', 'tokenVersion', 'twoFactorSecret', 'failedAttempts']) delete v[field];
    return v;
  };

  const Setting = seq.define('Setting', { key: { type: T.STRING(60), primaryKey: true }, value: T.TEXT }, { tableName: 'settings' });
  const ActivityLog = seq.define('ActivityLog', {
    id, action: { type: T.STRING(60), allowNull: false }, entity: T.STRING(40), entityId: T.STRING(60), details: T.JSON, ip: T.STRING(60), userId: T.UUID,
  }, { tableName: 'activity_log', updatedAt: false });
  User.hasMany(ActivityLog, { foreignKey: 'userId' });
  ActivityLog.belongsTo(User, { foreignKey: 'userId' });

  const result = { User, Setting, ActivityLog, sequelize: seq };
  modelsCache.set(seq, result);
  return result;
}

const defaultModels = initModels(sequelize);
export const User = defaultModels.User;
export const Setting = defaultModels.Setting;
export const ActivityLog = defaultModels.ActivityLog;

export function getModels(req) {
  return req?.sequelize ? initModels(req.sequelize) : defaultModels;
}

export { sequelize };
