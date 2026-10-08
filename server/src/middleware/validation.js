import { errorResponse } from '../utils/response.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    // Replace with validated/sanitized data
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.').replace(/^(body|query|params)\./, ''),
        message: err.message
      }));
      return errorResponse(res, 'Validation error', 422, formattedErrors);
    }
    return errorResponse(res, error.message || 'Invalid request payload', 400);
  }
};
