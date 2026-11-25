import { HttpError } from '../utils/http.js';
// Validated values land on req.valid.{body|query} (Express 5 makes req.query read-only).
export const validate = (schema, src = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[src], { abortEarly: false, stripUnknown: true, convert: true });
  if (error) throw new HttpError(422, 'Validation failed', error.details.map((d) => ({ field: d.path.join('.'), message: d.message.replace(/"/g, '') })));
  (req.valid ||= {})[src] = value; next();
};
