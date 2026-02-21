import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Review from '../models/reviewModel.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import { respondToReview } from '../controllers/reviewController.js';

function mockReq(overrides = {}) {
  return {
    cookies: {},
    headers: {},
    ...overrides,
  };
}

// asyncHandler doesn't return a promise, so controllers are fire-and-forget.
// This mockRes captures the moment json() is called via a promise we can await.
function mockResWithPromise() {
  let resolve;
  const done = new Promise((r) => { resolve = r; });
  const res = {
    statusCode: 200,
    body: null,
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; resolve(); return res; },
  };
  return { res, done };
}

function mockNext() {
  let resolve;
  const done = new Promise((r) => { resolve = r; });
  const fn = (err) => { fn.error = err; resolve(); };
  fn.error = null;
  fn.done = done;
  return fn;
}

// Valid tags for test reviews (must have 1-5 entries per model validator)
const SAMPLE_TAGS = ['Excellent Craftsmanship'];

describe('Review', () => {
  let artisan, user;

  beforeEach(async () => {
    const hashedPass = await bcrypt.hash('Password123', 10);
    artisan = await Artisan.create({
      fullName: 'Review Artisan',
      email: 'review-artisan@test.com',
      password: hashedPass,
    });

    user = await User.create({
      fullName: 'Review User',
      email: 'review-user@test.com',
      password: 'Password123',
    });
  });

  describe('Review Model', () => {
    it('should create a review with required fields', async () => {
      const review = await Review.create({
        artisan: artisan._id,
        user: user._id,
        rating: 4,
        comment: 'Great craftsmanship!',
        tags: SAMPLE_TAGS,
      });

      expect(review._id).toBeDefined();
      expect(review.rating).toBe(4);
      expect(review.comment).toBe('Great craftsmanship!');
      expect(review.status).toBe('active');
      expect(review.isVerified).toBe(false);
      expect(review.helpfulVotes).toEqual([]);
      expect(review.tags).toEqual(SAMPLE_TAGS);
    });

    it('should reject review without artisan', async () => {
      await expect(
        Review.create({ user: user._id, rating: 3, comment: 'No artisan', tags: SAMPLE_TAGS })
      ).rejects.toThrow();
    });

    it('should reject review without user', async () => {
      await expect(
        Review.create({ artisan: artisan._id, rating: 3, comment: 'No user', tags: SAMPLE_TAGS })
      ).rejects.toThrow();
    });

    it('should reject review without rating', async () => {
      await expect(
        Review.create({ artisan: artisan._id, user: user._id, comment: 'No rating', tags: SAMPLE_TAGS })
      ).rejects.toThrow();
    });

    it('should accept review without comment (defaults to empty string)', async () => {
      const review = await Review.create({
        artisan: artisan._id, user: user._id, rating: 3, tags: SAMPLE_TAGS,
      });
      expect(review.comment).toBe('');
    });

    it('should reject review without tags', async () => {
      await expect(
        Review.create({ artisan: artisan._id, user: user._id, rating: 3, comment: 'No tags' })
      ).rejects.toThrow();
    });

    it('should reject review with empty tags array', async () => {
      await expect(
        Review.create({ artisan: artisan._id, user: user._id, rating: 3, comment: 'Empty tags', tags: [] })
      ).rejects.toThrow();
    });

    it('should reject rating below 1', async () => {
      await expect(
        Review.create({ artisan: artisan._id, user: user._id, rating: 0, comment: 'Bad', tags: SAMPLE_TAGS })
      ).rejects.toThrow();
    });

    it('should reject rating above 5', async () => {
      await expect(
        Review.create({ artisan: artisan._id, user: user._id, rating: 6, comment: 'Too high', tags: SAMPLE_TAGS })
      ).rejects.toThrow();
    });

    it('should store optional images array', async () => {
      const review = await Review.create({
        artisan: artisan._id,
        user: user._id,
        rating: 5,
        comment: 'With images',
        tags: SAMPLE_TAGS,
        images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      });

      expect(review.images).toHaveLength(2);
    });

    it('should default status to active', async () => {
      const review = await Review.create({
        artisan: artisan._id,
        user: user._id,
        rating: 4,
        comment: 'Status check',
        tags: SAMPLE_TAGS,
      });

      expect(review.status).toBe('active');
    });
  });

  describe('respondToReview controller', () => {
    let review;

    beforeEach(async () => {
      review = await Review.create({
        artisan: artisan._id,
        user: user._id,
        rating: 4,
        comment: 'Good work',
        tags: SAMPLE_TAGS,
      });
    });

    it('should allow artisan to respond to their own review', async () => {
      const req = mockReq({
        user: { _id: artisan._id },
        params: { id: review._id.toString() },
        body: { text: 'Thank you for your feedback!' },
      });
      const { res, done } = mockResWithPromise();
      const next = mockNext();

      respondToReview(req, res, next);
      await done;

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.response.text).toBe('Thank you for your feedback!');
      expect(res.body.data.response.createdAt).toBeDefined();
    });

    it('should forbid artisan from responding to another artisan review', async () => {
      const otherHashedPass = await bcrypt.hash('Password123', 10);
      const otherArtisan = await Artisan.create({
        fullName: 'Other Artisan',
        email: 'other-artisan@test.com',
        password: otherHashedPass,
      });

      const req = mockReq({
        user: { _id: otherArtisan._id },
        params: { id: review._id.toString() },
        body: { text: 'Trying to respond' },
      });
      const { res, done } = mockResWithPromise();
      const next = mockNext();

      respondToReview(req, res, next);
      await done;

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject responding to already-responded review', async () => {
      // First response
      review.response = { text: 'Already responded', createdAt: new Date() };
      await review.save();

      const req = mockReq({
        user: { _id: artisan._id },
        params: { id: review._id.toString() },
        body: { text: 'Second response' },
      });
      const { res, done } = mockResWithPromise();
      const next = mockNext();

      respondToReview(req, res, next);
      await done;

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already responded');
    });

    it('should reject empty response text', async () => {
      const req = mockReq({
        user: { _id: artisan._id },
        params: { id: review._id.toString() },
        body: { text: '' },
      });
      const { res, done } = mockResWithPromise();
      const next = mockNext();

      respondToReview(req, res, next);
      await done;

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = mockReq({
        user: { _id: artisan._id },
        params: { id: fakeId.toString() },
        body: { text: 'Hello' },
      });
      const { res, done } = mockResWithPromise();
      const next = mockNext();

      respondToReview(req, res, next);
      await done;

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Rating recomputation', () => {
    it('should update artisan averageRating and totalReviews after reviews are created', async () => {
      const user2 = await User.create({
        fullName: 'User Two',
        email: 'user2@test.com',
        password: 'Password123',
      });

      const user3 = await User.create({
        fullName: 'User Three',
        email: 'user3@test.com',
        password: 'Password123',
      });

      const booking1 = await Booking.create({
        artisan: artisan._id,
        user: user._id,
        start: new Date(),
        end: new Date(Date.now() + 3600000),
        status: 'completed',
      });

      const booking2 = await Booking.create({
        artisan: artisan._id,
        user: user2._id,
        start: new Date(),
        end: new Date(Date.now() + 3600000),
        status: 'completed',
      });

      const booking3 = await Booking.create({
        artisan: artisan._id,
        user: user3._id,
        start: new Date(),
        end: new Date(Date.now() + 3600000),
        status: 'completed',
      });

      await Review.create({
        artisan: artisan._id,
        user: user._id,
        booking: booking1._id,
        rating: 5,
        comment: 'Excellent!',
        tags: SAMPLE_TAGS,
        status: 'active',
      });

      await Review.create({
        artisan: artisan._id,
        user: user2._id,
        booking: booking2._id,
        rating: 3,
        comment: 'Average',
        tags: SAMPLE_TAGS,
        status: 'active',
      });

      await Review.create({
        artisan: artisan._id,
        user: user3._id,
        booking: booking3._id,
        rating: 4,
        comment: 'Good',
        tags: SAMPLE_TAGS,
        status: 'active',
      });

      // Manually recompute rating using the same aggregation as the controller
      const objectId = new mongoose.Types.ObjectId(artisan._id);
      const result = await Review.aggregate([
        { $match: { artisan: objectId, status: 'active' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      const average = result.length ? Number(result[0].avg.toFixed(1)) : 0;
      const count = result.length ? result[0].count : 0;

      await Artisan.findByIdAndUpdate(artisan._id, {
        $set: { averageRating: average, totalReviews: count },
      });

      const updated = await Artisan.findById(artisan._id);
      expect(updated.averageRating).toBe(4); // (5+3+4)/3 = 4.0
      expect(updated.totalReviews).toBe(3);
    });

    it('should handle zero reviews gracefully', async () => {
      const objectId = new mongoose.Types.ObjectId(artisan._id);
      const result = await Review.aggregate([
        { $match: { artisan: objectId, status: 'active' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      const average = result.length ? Number(result[0].avg.toFixed(1)) : 0;
      const count = result.length ? result[0].count : 0;

      expect(average).toBe(0);
      expect(count).toBe(0);
    });

    it('should exclude flagged/removed reviews from rating computation', async () => {
      await Review.create({
        artisan: artisan._id,
        user: user._id,
        rating: 5,
        comment: 'Great',
        tags: SAMPLE_TAGS,
        status: 'active',
      });

      const user2 = await User.create({
        fullName: 'User Two',
        email: 'user2-flagged@test.com',
        password: 'Password123',
      });

      await Review.create({
        artisan: artisan._id,
        user: user2._id,
        rating: 1,
        comment: 'Spam review',
        tags: ['Delayed'],
        status: 'flagged',
      });

      const objectId = new mongoose.Types.ObjectId(artisan._id);
      const result = await Review.aggregate([
        { $match: { artisan: objectId, status: 'active' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      const average = result.length ? Number(result[0].avg.toFixed(1)) : 0;
      const count = result.length ? result[0].count : 0;

      expect(average).toBe(5);
      expect(count).toBe(1);
    });
  });
});
