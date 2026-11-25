export class HttpError extends Error {
  constructor(status, message, details, code) { super(message); this.status = status; this.details = details; this.code = code; }
}
export const ROLES = ['admin', 'staff'];
const RANK = { staff: 1, admin: 2 };
export const atLeast = (user, role) => (RANK[user?.role] || 0) >= RANK[role];
