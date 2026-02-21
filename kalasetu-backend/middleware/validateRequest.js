/**
 * @file validateRequest.js — Zod Request Validation Middleware
 *
 * Generic middleware factory that validates req.body, req.query, and/or req.params
 * against Zod schemas. Runs BEFORE the controller, rejecting invalid requests
 * with a 400 response containing field-level error messages.
 *
 * On successful validation, the parsed (and potentially transformed/coerced)
 * values REPLACE the original req.body/query/params — this means controllers
 * always receive clean, typed data.
 *
 * Error response format:
 *   { message: 'Validation failed', errors: [{ path: 'email', message: 'Invalid email' }] }
 *
 * @exports {Function} validateRequest — Middleware factory accepting Zod schemas
 *
 * @requires zod — ZodError detection for structured error responses
 *
 * @see controllers/* — Zod schemas are defined at the top of each controller or in shared schema files
 * @see errorMiddleware.js — Also handles ZodError (as a fallback if validation errors slip through)
 *
 * @example
 *   import { z } from 'zod';
 *   const createBookingSchema = z.object({ artisanId: z.string(), date: z.string().datetime() });
 *   router.post('/bookings', protectAny, validateRequest({ body: createBookingSchema }), createBooking);
 */

import { ZodError } from 'zod';

/**
 * Request validation middleware factory.
 * Pass Zod schemas for any combination of body, query, and params.
 * Each schema is optional — only provided schemas are validated.
 *
 * @param {Object} schemas
 * @param {import('zod').ZodSchema} [schemas.body]   — Schema for req.body
 * @param {import('zod').ZodSchema} [schemas.query]  — Schema for req.query
 * @param {import('zod').ZodSchema} [schemas.params] — Schema for req.params
 * @returns {Function} Express middleware
 */
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
