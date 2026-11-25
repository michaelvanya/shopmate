// API versioning middleware.
// Accepts requests at /api/* (unversioned, defaults to v1) and /api/v1/* (explicit).
// Sets req.apiVersion so route handlers can branch if needed in the future.
export function apiVersion(req, _res, next) {
  // If the path starts with /api/v1, strip the version prefix
  const v1Prefix = '/v1';
  if (req.path.startsWith(v1Prefix + '/') || req.path === v1Prefix) {
    req.apiVersion = '1';
    req.originalPath = req.path.slice(v1Prefix.length) || '/';
  } else {
    req.apiVersion = '1'; // default version
    req.originalPath = req.path;
  }
  next();
}
