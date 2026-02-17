import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import multer from 'multer';
import { errorHandler, notFound } from '../middleware/errorMiddleware.js';

// Mock req/res following existing test patterns (csrf.test.js)
function mockReq(overrides = {}) {
  return {
    method: 'POST',
    path: '/test',
    originalUrl: '/api/test',
    ...overrides,
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; },
  };
  return res;
}

const noop = () => {};

describe('Error Middleware', () => {
  // ── notFound Middleware ───────────────────────────────────────────

  describe('notFound', () => {
    it('should set 404 status and pass error to next', () => {
      const req = mockReq({ originalUrl: '/api/nonexistent' });
      const res = mockRes();
      let passedError = null;

      notFound(req, res, (err) => { passedError = err; });

      expect(res.statusCode).toBe(404);
      expect(passedError).toBeDefined();
      expect(passedError.message).toContain('/api/nonexistent');
    });
  });

  // ── Zod Validation Errors ────────────────────────────────────────

  describe('Zod validation errors', () => {
    it('should return 400 with formatted issue messages', () => {
      // Create a real Zod error by parsing invalid data
      const schema = z.object({
        email: z.string().email('Invalid email'),
        name: z.string().min(2, 'Name too short'),
      });

      let zodError;
      try {
        schema.parse({ email: 'not-email', name: 'a' });
      } catch (err) {
        zodError = err;
      }

      const res = mockRes();
      errorHandler(zodError, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email');
      expect(res.body.message).toContain('Name too short');
    });

    it('should join multiple issues with commas', () => {
      const schema = z.object({
        a: z.string().min(1, 'A required'),
        b: z.string().min(1, 'B required'),
      });

      let zodError;
      try {
        schema.parse({ a: '', b: '' });
      } catch (err) {
        zodError = err;
      }

      const res = mockRes();
      errorHandler(zodError, mockReq(), res, noop);

      expect(res.body.message).toBe('A required, B required');
    });
  });

  // ── Mongoose CastError (invalid ObjectId) ───────────────────────

  describe('Mongoose CastError', () => {
    it('should return 400 with field name and invalid value', () => {
      const err = new Error('Cast error');
      err.name = 'CastError';
      err.path = '_id';
      err.value = 'not-an-objectid';

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid _id');
      expect(res.body.message).toContain('not-an-objectid');
    });
  });

  // ── Mongoose Duplicate Key Error ─────────────────────────────────

  describe('Mongoose duplicate key error (code 11000)', () => {
    it('should return 409 with duplicate field name', () => {
      const err = new Error('Duplicate key');
      err.code = 11000;
      err.keyPattern = { email: 1 };

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duplicate value for email');
    });
  });

  // ── Mongoose ValidationError ─────────────────────────────────────

  describe('Mongoose ValidationError', () => {
    it('should return 400 with concatenated validation messages', () => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        email: { message: 'Email is required' },
        password: { message: 'Password is too short' },
      };

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email is required');
      expect(res.body.message).toContain('Password is too short');
    });
  });

  // ── JWT Errors ───────────────────────────────────────────────────

  describe('JWT JsonWebTokenError', () => {
    it('should return 401 with "Invalid token" message', () => {
      const err = new Error('jwt malformed');
      err.name = 'JsonWebTokenError';

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid token');
    });
  });

  describe('JWT TokenExpiredError', () => {
    it('should return 401 with "Token expired" message', () => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Token expired');
    });
  });

  // ── Multer File Upload Errors ────────────────────────────────────

  describe('Multer file size error', () => {
    it('should return 400 for LIMIT_FILE_SIZE', () => {
      const err = new multer.MulterError('LIMIT_FILE_SIZE');

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('too large');
    });

    it('should return 400 for LIMIT_UNEXPECTED_FILE', () => {
      const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE');

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid file type');
    });

    it('should return 400 for LIMIT_FILE_COUNT', () => {
      const err = new multer.MulterError('LIMIT_FILE_COUNT');

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Too many files');
    });

    it('should handle generic multer error codes', () => {
      const err = new multer.MulterError('LIMIT_PART_COUNT');
      err.message = 'Too many parts';

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Upload error');
    });
  });

  describe('Multer fileFilter error (plain Error)', () => {
    it('should return 400 for Invalid file type message', () => {
      const err = new Error('Invalid file type. Only JPEG and PNG are allowed.');

      const res = mockRes();
      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid file type');
    });
  });

  // ── Custom Error with statusCode ─────────────────────────────────

  describe('Custom error with statusCode', () => {
    it('should preserve statusCode set on res before errorHandler', () => {
      const err = new Error('Forbidden');
      const res = mockRes();
      res.statusCode = 403;

      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Forbidden');
    });

    it('should use 500 when res.statusCode is 200 (default)', () => {
      const err = new Error('Something broke');
      const res = mockRes();

      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(500);
    });
  });

  // ── Generic Errors ───────────────────────────────────────────────

  describe('Generic errors', () => {
    it('should return 500 with error message in non-production', () => {
      const err = new Error('Unexpected failure');
      const res = mockRes();

      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unexpected failure');
      expect(res.body.stack).toBeDefined();
    });

    it('should hide stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const err = new Error('Internal error');
      const res = mockRes();

      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Internal error');
      expect(res.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should default message to "Server Error" if error has no message', () => {
      const err = new Error();
      err.message = '';
      const res = mockRes();

      errorHandler(err, mockReq(), res, noop);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server Error');
    });
  });
});
