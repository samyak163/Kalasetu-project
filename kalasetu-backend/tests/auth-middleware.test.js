import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';

// Import middleware (these read JWT_SECRET from process.env, which setup.js sets)
import { protect, protectAny } from '../middleware/authMiddleware.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';

function mockReq(overrides = {}) {
  return {
    cookies: {},
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

describe('Auth Middleware', () => {
  let testUser, testArtisan, userToken, artisanToken;

  beforeEach(async () => {
    // Create test user (password hashing handled by pre-save hook)
    testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });

    // Create test artisan (password must be pre-hashed since artisanModel has no hook)
    const bcrypt = await import('bcryptjs');
    const hashedPass = await bcrypt.hash('Password123', 10);
    testArtisan = await Artisan.create({
      fullName: 'Test Artisan',
      email: 'artisan@example.com',
      password: hashedPass,
    });

    userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    artisanToken = jwt.sign({ id: testArtisan._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('protect (artisan middleware)', () => {
    it('should reject request with no token', async () => {
      const req = mockReq();
      const res = mockRes();
      let error = null;

      await protect(req, res, (err) => { error = err; });

      // protect throws/sends 401 when no token
      expect(res.statusCode === 401 || error).toBeTruthy();
    });

    it('should authenticate artisan with valid token', async () => {
      const req = mockReq({ cookies: { ks_auth: artisanToken } });
      const res = mockRes();
      let nextCalled = false;

      await protect(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(testArtisan._id.toString());
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { id: testArtisan._id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );
      const req = mockReq({ cookies: { ks_auth: expiredToken } });
      const res = mockRes();
      let error = null;

      await protect(req, res, (err) => { error = err; });

      expect(res.statusCode === 401 || error).toBeTruthy();
    });
  });

  describe('userProtect (user middleware)', () => {
    it('should authenticate user with valid token', async () => {
      const req = mockReq({ cookies: { ks_auth: userToken } });
      const res = mockRes();
      let nextCalled = false;

      await userProtect(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(testUser._id.toString());
    });

    it('should reject request with no token', async () => {
      const req = mockReq();
      const res = mockRes();
      let error = null;

      await userProtect(req, res, (err) => { error = err; });

      expect(res.statusCode === 401 || error).toBeTruthy();
    });
  });

  describe('protectAny (dual auth middleware)', () => {
    it('should authenticate user', async () => {
      const req = mockReq({ cookies: { ks_auth: userToken } });
      const res = mockRes();
      let nextCalled = false;

      await protectAny(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(req.accountType).toBe('user');
      expect(req.user._id.toString()).toBe(testUser._id.toString());
    });

    it('should authenticate artisan', async () => {
      const req = mockReq({ cookies: { ks_auth: artisanToken } });
      const res = mockRes();
      let nextCalled = false;

      await protectAny(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(req.accountType).toBe('artisan');
      expect(req.user._id.toString()).toBe(testArtisan._id.toString());
    });

    it('should reject invalid token', async () => {
      const req = mockReq({ cookies: { ks_auth: 'invalid' } });
      const res = mockRes();
      let error = null;

      await protectAny(req, res, (err) => { error = err; });

      expect(res.statusCode === 401 || error).toBeTruthy();
    });

    it('should reject token for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const fakeToken = jwt.sign({ id: fakeId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = mockReq({ cookies: { ks_auth: fakeToken } });
      const res = mockRes();
      let error = null;

      await protectAny(req, res, (err) => { error = err; });

      expect(res.statusCode === 401 || error).toBeTruthy();
    });
  });
});
