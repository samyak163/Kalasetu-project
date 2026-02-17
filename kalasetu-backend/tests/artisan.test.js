import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Artisan from '../models/artisanModel.js';
import { getAllArtisans, getArtisanByPublicId, getArtisanById, getFeaturedArtisans } from '../controllers/artisanController.js';

function mockReq(overrides = {}) {
  return {
    cookies: {},
    headers: {},
    query: {},
    params: {},
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

// Sensitive fields that should never appear in public queries
const SENSITIVE_FIELDS = [
  'password',
  'bankDetails',
  'verificationDocuments',
  'resetPasswordToken',
  'resetPasswordExpires',
  'emailVerificationToken',
  'emailVerificationExpires',
  'emailVerificationCode',
  'phoneVerificationCode',
  'phoneVerificationExpires',
  'pendingEmail',
  'pendingPhoneNumber',
  'otpCode',
  'otpExpires',
  'otpAttempts',
  'loginAttempts',
  'lockUntil',
];

describe('Artisan Controller', () => {
  let artisans;

  beforeEach(async () => {
    const hashedPass = await bcrypt.hash('Password123', 10);

    // Create several artisans with varying ratings and active states
    artisans = await Artisan.insertMany([
      { fullName: 'Artisan One', email: 'a1@test.com', password: hashedPass, isActive: true, averageRating: 4.5, totalReviews: 10, craft: 'Pottery' },
      { fullName: 'Artisan Two', email: 'a2@test.com', password: hashedPass, isActive: true, averageRating: 3.0, totalReviews: 5, craft: 'Weaving' },
      { fullName: 'Artisan Three', email: 'a3@test.com', password: hashedPass, isActive: true, averageRating: 5.0, totalReviews: 20, craft: 'Woodwork' },
      { fullName: 'Inactive Artisan', email: 'inactive@test.com', password: hashedPass, isActive: false, averageRating: 4.0, totalReviews: 8, craft: 'Metalwork' },
      { fullName: 'Artisan Four', email: 'a4@test.com', password: hashedPass, isActive: true, averageRating: 2.5, totalReviews: 3, craft: 'Painting' },
    ]);
  });

  describe('getAllArtisans', () => {
    it('should return paginated results with default params', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await getAllArtisans(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.artisans).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(50);
    });

    it('should return only active artisans', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await getAllArtisans(req, res);

      // We created 4 active + 1 inactive
      expect(res.body.artisans).toHaveLength(4);
      expect(res.body.pagination.total).toBe(4);

      // Verify no inactive artisans appear
      const names = res.body.artisans.map(a => a.fullName);
      expect(names).not.toContain('Inactive Artisan');
    });

    it('should respect page and limit params', async () => {
      const req = mockReq({ query: { page: '1', limit: '2' } });
      const res = mockRes();

      await getAllArtisans(req, res);

      expect(res.body.artisans).toHaveLength(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.pages).toBe(2); // 4 active / 2 per page = 2 pages
    });

    it('should return page 2 correctly', async () => {
      const req = mockReq({ query: { page: '2', limit: '2' } });
      const res = mockRes();

      await getAllArtisans(req, res);

      expect(res.body.artisans).toHaveLength(2);
      expect(res.body.pagination.page).toBe(2);
    });

    it('should cap limit at 200', async () => {
      const req = mockReq({ query: { limit: '500' } });
      const res = mockRes();

      await getAllArtisans(req, res);

      expect(res.body.pagination.limit).toBe(200);
    });

    it('should sort by averageRating descending', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await getAllArtisans(req, res);

      const ratings = res.body.artisans.map(a => a.averageRating);
      for (let i = 1; i < ratings.length; i++) {
        expect(ratings[i]).toBeLessThanOrEqual(ratings[i - 1]);
      }
    });

    it('should handle invalid page gracefully (defaults to 1)', async () => {
      const req = mockReq({ query: { page: '-5' } });
      const res = mockRes();

      await getAllArtisans(req, res);

      expect(res.body.pagination.page).toBe(1);
    });
  });

  describe('getArtisanByPublicId', () => {
    it('should find artisan by publicId', async () => {
      const target = artisans[0];
      const req = mockReq({ params: { publicId: target.publicId } });
      const res = mockRes();

      await getArtisanByPublicId(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.fullName).toBe('Artisan One');
      expect(res.body.publicId).toBe(target.publicId);
    });

    it('should return 404 for non-existent publicId', async () => {
      const req = mockReq({ params: { publicId: 'ks_nonexist' } });
      const res = mockRes();

      await getArtisanByPublicId(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('getArtisanById', () => {
    it('should find artisan by MongoDB _id', async () => {
      const target = artisans[1];
      const req = mockReq({ params: { id: target._id.toString() } });
      const res = mockRes();

      await getArtisanById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.fullName).toBe('Artisan Two');
    });

    it('should return 404 for non-existent _id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: fakeId.toString() } });
      const res = mockRes();

      await getArtisanById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('getFeaturedArtisans', () => {
    it('should return active artisans sorted by rating', async () => {
      const req = mockReq();
      const res = mockRes();

      await getFeaturedArtisans(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.length).toBeLessThanOrEqual(8);

      // Should not include inactive artisans
      const names = res.body.data.map(a => a.fullName);
      expect(names).not.toContain('Inactive Artisan');
    });

    it('should return at most 8 artisans', async () => {
      // Create 10 more active artisans to exceed the limit
      const hashedPass = await bcrypt.hash('Password123', 10);
      const moreArtisans = [];
      for (let i = 0; i < 10; i++) {
        moreArtisans.push({
          fullName: `Featured ${i}`,
          email: `featured${i}@test.com`,
          password: hashedPass,
          isActive: true,
          averageRating: 4.0,
        });
      }
      await Artisan.insertMany(moreArtisans);

      const req = mockReq();
      const res = mockRes();

      await getFeaturedArtisans(req, res);

      expect(res.body.data.length).toBe(8);
    });

    it('should sort featured artisans by rating descending', async () => {
      const req = mockReq();
      const res = mockRes();

      await getFeaturedArtisans(req, res);

      const ratings = res.body.data.map(a => a.averageRating);
      for (let i = 1; i < ratings.length; i++) {
        expect(ratings[i]).toBeLessThanOrEqual(ratings[i - 1]);
      }
    });
  });

  describe('PUBLIC_FIELDS whitelist', () => {
    it('should NOT expose password in getAllArtisans results', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await getAllArtisans(req, res);

      for (const artisan of res.body.artisans) {
        expect(artisan.password).toBeUndefined();
      }
    });

    it('should NOT expose bankDetails in getAllArtisans results', async () => {
      // Create an artisan with bank details set
      const hashedPass = await bcrypt.hash('Password123', 10);
      await Artisan.create({
        fullName: 'Bank Artisan',
        email: 'bank-artisan@test.com',
        password: hashedPass,
        isActive: true,
        bankDetails: {
          accountHolderName: 'Secret Name',
          accountNumber: '1234567890',
          ifscCode: 'ABCD0001234',
          bankName: 'Secret Bank',
        },
      });

      const req = mockReq({ query: {} });
      const res = mockRes();

      await getAllArtisans(req, res);

      for (const artisan of res.body.artisans) {
        expect(artisan.bankDetails).toBeUndefined();
      }
    });

    it('should NOT expose verificationDocuments in getArtisanByPublicId results', async () => {
      const hashedPass = await bcrypt.hash('Password123', 10);
      const artisan = await Artisan.create({
        fullName: 'Docs Artisan',
        email: 'docs-artisan@test.com',
        password: hashedPass,
        isActive: true,
        verificationDocuments: {
          aadhar: { url: 'https://secret.com/doc.pdf', number: '123456789012' },
        },
      });

      const req = mockReq({ params: { publicId: artisan.publicId } });
      const res = mockRes();

      await getArtisanByPublicId(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.verificationDocuments).toBeUndefined();
    });

    it('should NOT expose sensitive auth fields in getArtisanById results', async () => {
      const target = artisans[0];
      const req = mockReq({ params: { id: target._id.toString() } });
      const res = mockRes();

      await getArtisanById(req, res);

      const artisanData = res.body;
      // password has select: false in schema, plus it is excluded from PUBLIC_FIELDS
      expect(artisanData.password).toBeUndefined();
      expect(artisanData.bankDetails).toBeUndefined();
      expect(artisanData.verificationDocuments).toBeUndefined();
      expect(artisanData.resetPasswordToken).toBeUndefined();
      expect(artisanData.otpCode).toBeUndefined();
      expect(artisanData.loginAttempts).toBeUndefined();
    });

    it('should include expected public fields in results', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await getAllArtisans(req, res);

      const first = res.body.artisans[0];
      // These fields are in PUBLIC_FIELDS and should be present
      expect(first.fullName).toBeDefined();
      expect(first.publicId).toBeDefined();
      expect(first.isActive).toBeDefined();
      expect(first.averageRating).toBeDefined();
    });
  });
});
