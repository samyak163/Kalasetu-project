import { describe, it, expect } from 'vitest';
import { generateCsrfToken, verifyCsrf } from '../middleware/csrfMiddleware.js';

// Helper to create mock req/res/next
function mockReq(overrides = {}) {
  return {
    method: 'POST',
    path: '/test',
    headers: {},
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

describe('CSRF Middleware', () => {
  describe('generateCsrfToken', () => {
    it('should generate a non-empty token string', () => {
      const token = generateCsrfToken('user123');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    it('should generate different tokens for same user', () => {
      const token1 = generateCsrfToken('user123');
      const token2 = generateCsrfToken('user123');
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyCsrf', () => {
    it('should pass through GET requests without CSRF token', () => {
      const req = mockReq({ method: 'GET' });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });
      expect(nextCalled).toBe(true);
    });

    it('should pass through HEAD requests', () => {
      const req = mockReq({ method: 'HEAD' });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });
      expect(nextCalled).toBe(true);
    });

    it('should pass through OPTIONS requests', () => {
      const req = mockReq({ method: 'OPTIONS' });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });
      expect(nextCalled).toBe(true);
    });

    it('should skip CSRF for webhook routes', () => {
      const req = mockReq({ path: '/payments/webhook' });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });
      expect(nextCalled).toBe(true);
    });

    it('should skip CSRF for jobs routes', () => {
      const req = mockReq({ path: '/jobs/cleanup' });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });
      expect(nextCalled).toBe(true);
    });

    it('should skip CSRF for public auth routes', () => {
      const publicPaths = [
        '/auth/login',
        '/auth/register',
        '/users/login',
        '/users/register',
        '/admin/auth/login',
        '/contact',
      ];

      for (const path of publicPaths) {
        const req = mockReq({ path });
        const res = mockRes();
        let nextCalled = false;

        verifyCsrf(req, res, () => { nextCalled = true; });
        expect(nextCalled).toBe(true);
      }
    });

    it('should pass in development mode (NODE_ENV=test)', () => {
      // Our test setup sets NODE_ENV=test, which is != production
      const req = mockReq({ path: '/bookings', headers: {} });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });
      expect(nextCalled).toBe(true);
    });

    it('should reject POST without CSRF token in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const req = mockReq({ path: '/bookings', headers: {} });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('CSRF token missing');

      process.env.NODE_ENV = originalEnv;
    });

    it('should accept valid CSRF token in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const token = generateCsrfToken('user123');
      const req = mockReq({
        path: '/bookings',
        headers: { 'x-csrf-token': token },
      });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should reject invalid CSRF token in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const req = mockReq({
        path: '/bookings',
        headers: { 'x-csrf-token': 'invalid-garbage-token' },
      });
      const res = mockRes();
      let nextCalled = false;

      verifyCsrf(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Invalid or expired CSRF token');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
