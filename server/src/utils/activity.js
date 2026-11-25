import { getModels } from '../models/index.js';
export async function logActivity(req, action, entity, entityId, details) {
  try {
    const { ActivityLog } = getModels(req);
    await ActivityLog.create({ userId: req.user?.id || null, action, entity, entityId: entityId && String(entityId), details, ip: req.ip });
  }
  catch (e) { console.error('Activity log failed:', e.message); }
}
