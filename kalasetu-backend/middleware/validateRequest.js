import { ZodError } from 'zod';

// Generic Zod validation middleware for body, query, and params
export const validateRequest = ({ body, query, params } = {}) => {
  return (req, res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      return next(err);
    }
  };
};

export default validateRequest;
