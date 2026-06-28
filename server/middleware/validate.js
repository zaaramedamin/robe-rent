const { ZodError } = require('zod');

/**
 * Build an Express middleware that validates the request against the
 * given Zod schemas. Each provided part (`body`, `params`, `query`) is
 * parsed; on success the parsed/coerced value replaces the original so
 * downstream handlers receive clean, trusted data. On failure a 400 with
 * a normalised error shape is returned:
 *
 *   { message: 'Validation failed.', errors: [{ field, message }] }
 *
 * Usage:
 *   router.post('/', validate({ body: reservationCreateSchema }), handler)
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      for (const key of ['body', 'params', 'query']) {
        if (schemas[key]) {
          req[key] = schemas[key].parse(req[key]);
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed.',
          errors: err.issues.map((issue) => ({
            field: issue.path.join('.') || '(root)',
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };
}

module.exports = validate;
