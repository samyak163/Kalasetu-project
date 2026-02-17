import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';
import Booking from '../models/bookingModel.js';
import ArtisanService from '../models/artisanServiceModel.js';
import {
  getMyBookings,
  getArtisanBookings,
  cancelBooking,
  respondToBooking,
  completeBooking,
  requestModification,
  respondToModification,
} from '../controllers/bookingController.js';

// Mock external services that bookingController imports
vi.mock('../utils/streamChat.js', () => ({
  createDirectMessageChannel: vi.fn().mockResolvedValue({ id: 'mock-channel', type: 'messaging' }),
  upsertStreamUser: vi.fn().mockResolvedValue({}),
  sendMessage: vi.fn().mockResolvedValue({}),
}));
vi.mock('../utils/dailyco.js', () => ({
  createDailyRoom: vi.fn().mockResolvedValue({ name: 'mock-room', url: 'https://daily.co/mock-room' }),
}));
vi.mock('../utils/notificationService.js', () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}));

function mockReq(overrides = {}) {
  return {
    cookies: {},
    headers: {},
    body: {},
    params: {},
    query: {},
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

// Helper: wraps asyncHandler-wrapped controllers.
// asyncHandler doesn't return the inner promise, so we need to wait for
// either res.json() to be called or next(err) to fire.
function callController(controller, req, res) {
  return new Promise((resolve) => {
    const origJson = res.json.bind(res);
    res.json = (data) => {
      origJson(data);
      resolve();
      return res;
    };
    const next = (err) => {
      if (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
      }
      resolve();
    };
    controller(req, res, next);
  });
}

describe('Booking Tests', () => {
  let testUser, testArtisan, testService;
  let userToken, artisanToken;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      fullName: 'Booking Test User',
      email: 'bookinguser@example.com',
      password: 'Password123',
    });

    // Create test artisan (password must be pre-hashed)
    const hashedPass = await bcrypt.hash('Password123', 10);
    testArtisan = await Artisan.create({
      fullName: 'Booking Test Artisan',
      email: 'bookingartisan@example.com',
      password: hashedPass,
      isActive: true,
    });

    // Create a test service belonging to the artisan
    const categoryId = new mongoose.Types.ObjectId();
    testService = await ArtisanService.create({
      artisan: testArtisan._id,
      category: categoryId,
      categoryName: 'Pottery',
      name: 'Pottery Workshop',
      description: 'A hands-on pottery workshop',
      price: 1500,
      durationMinutes: 90,
    });

    userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    artisanToken = jwt.sign({ id: testArtisan._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  // Helper to create a booking directly in the database (bypasses transaction-based controller).
  // We explicitly unset modificationRequest since the subdocument schema has a default
  // status of 'pending' which interferes with modification-related tests.
  async function createTestBooking(overrides = {}) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(Date.now() + 25 * 60 * 60 * 1000);
    const booking = await Booking.create({
      artisan: testArtisan._id,
      user: testUser._id,
      service: testService._id,
      serviceName: testService.name,
      categoryName: testService.categoryName,
      start: tomorrow,
      end: dayAfter,
      notes: 'Test booking',
      price: testService.price,
      status: 'pending',
      ...overrides,
    });
    // The modificationRequest subdocument defaults to { status: 'pending' } in the schema,
    // which would block requestModification. Clear it at the raw MongoDB level for clean tests.
    if (!overrides.modificationRequest) {
      await Booking.collection.updateOne(
        { _id: booking._id },
        { $unset: { modificationRequest: '' } }
      );
    }
    return Booking.findById(booking._id);
  }

  // -------------------------------------------------------------------
  // 1. Booking Model - createBooking logic tested at model level
  //    (Controller uses transactions which need replica set)
  // -------------------------------------------------------------------
  describe('Booking Model (createBooking equivalent)', () => {
    it('should create a booking with all required fields', async () => {
      const booking = await createTestBooking();

      expect(booking).toBeDefined();
      expect(booking.artisan.toString()).toBe(testArtisan._id.toString());
      expect(booking.user.toString()).toBe(testUser._id.toString());
      expect(booking.serviceName).toBe('Pottery Workshop');
      expect(booking.categoryName).toBe('Pottery');
      expect(booking.price).toBe(1500);
      expect(booking.status).toBe('pending');
      expect(booking.notes).toBe('Test booking');
    });

    it('should fail when required fields are missing', async () => {
      await expect(Booking.create({})).rejects.toThrow();
    });

    it('should fail without artisan field', async () => {
      await expect(Booking.create({
        user: testUser._id,
        start: new Date(Date.now() + 86400000),
        end: new Date(Date.now() + 90000000),
      })).rejects.toThrow();
    });

    it('should fail without user field', async () => {
      await expect(Booking.create({
        artisan: testArtisan._id,
        start: new Date(Date.now() + 86400000),
        end: new Date(Date.now() + 90000000),
      })).rejects.toThrow();
    });

    it('should fail without start field', async () => {
      await expect(Booking.create({
        artisan: testArtisan._id,
        user: testUser._id,
        end: new Date(Date.now() + 90000000),
      })).rejects.toThrow();
    });

    it('should fail without end field', async () => {
      await expect(Booking.create({
        artisan: testArtisan._id,
        user: testUser._id,
        start: new Date(Date.now() + 86400000),
      })).rejects.toThrow();
    });

    it('should default status to pending', async () => {
      const booking = await createTestBooking();
      expect(booking.status).toBe('pending');
    });

    it('should only accept valid status enum values', async () => {
      await expect(createTestBooking({ status: 'invalid_status' })).rejects.toThrow();
    });

    it('should detect overlapping bookings with a query (overlap detection logic)', async () => {
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      await createTestBooking({ start, end });

      // Overlapping time window
      const overlapStart = new Date(start.getTime() + 30 * 60 * 1000);
      const overlapEnd = new Date(end.getTime() + 30 * 60 * 1000);
      const overlap = await Booking.findOne({
        artisan: testArtisan._id,
        status: { $in: ['pending', 'confirmed'] },
        start: { $lt: overlapEnd },
        end: { $gt: overlapStart },
      });
      expect(overlap).not.toBeNull();
    });

    it('should not detect overlap for non-overlapping times', async () => {
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      await createTestBooking({ start, end });

      // Non-overlapping (after end)
      const laterStart = new Date(end.getTime() + 60 * 60 * 1000);
      const laterEnd = new Date(laterStart.getTime() + 2 * 60 * 60 * 1000);
      const overlap = await Booking.findOne({
        artisan: testArtisan._id,
        status: { $in: ['pending', 'confirmed'] },
        start: { $lt: laterEnd },
        end: { $gt: laterStart },
      });
      expect(overlap).toBeNull();
    });
  });

  // -------------------------------------------------------------------
  // 2. getMyBookings
  // -------------------------------------------------------------------
  describe('getMyBookings', () => {
    it('should return bookings for the authenticated user', async () => {
      await createTestBooking();
      await createTestBooking({
        start: new Date(Date.now() + 48 * 60 * 60 * 1000),
        end: new Date(Date.now() + 49 * 60 * 60 * 1000),
      });

      const req = mockReq({ user: testUser });
      const res = mockRes();
      await callController(getMyBookings, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return empty list when user has no bookings', async () => {
      const req = mockReq({ user: testUser });
      const res = mockRes();
      await callController(getMyBookings, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = mockReq({ user: null });
      const res = mockRes();
      await callController(getMyBookings, req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------
  // 3. getArtisanBookings
  // -------------------------------------------------------------------
  describe('getArtisanBookings', () => {
    it('should return bookings for the authenticated artisan', async () => {
      await createTestBooking();

      const req = mockReq({ user: testArtisan });
      const res = mockRes();
      await callController(getArtisanBookings, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return empty list for artisan with no bookings', async () => {
      const hashedPass = await bcrypt.hash('Password123', 10);
      const otherArtisan = await Artisan.create({
        fullName: 'Other Artisan',
        email: 'other@example.com',
        password: hashedPass,
      });

      const req = mockReq({ user: otherArtisan });
      const res = mockRes();
      await callController(getArtisanBookings, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------
  // 4. cancelBooking
  // -------------------------------------------------------------------
  describe('cancelBooking', () => {
    it('should allow the user to cancel their pending booking', async () => {
      const booking = await createTestBooking({ status: 'pending' });

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
        body: { reason: 'Schedule conflict' },
      });
      const res = mockRes();
      await callController(cancelBooking, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should allow the artisan to cancel a booking', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
        body: { reason: 'Unavailable' },
      });
      const res = mockRes();
      await callController(cancelBooking, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should return 403 when a non-owner tries to cancel', async () => {
      const booking = await createTestBooking();
      const hashedPass = await bcrypt.hash('Password123', 10);
      const otherUser = await User.create({
        fullName: 'Other User',
        email: 'other_user@example.com',
        password: 'Password123',
      });

      const req = mockReq({
        user: otherUser,
        params: { id: booking._id.toString() },
      });
      const res = mockRes();
      await callController(cancelBooking, req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Forbidden');
    });

    it('should return 400 when trying to cancel an already cancelled booking', async () => {
      const booking = await createTestBooking({ status: 'cancelled' });

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
      });
      const res = mockRes();
      await callController(cancelBooking, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cannot cancel');
    });

    it('should return 400 when trying to cancel a completed booking', async () => {
      const booking = await createTestBooking({ status: 'completed' });

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
      });
      const res = mockRes();
      await callController(cancelBooking, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cannot cancel');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = mockReq({
        user: testUser,
        params: { id: fakeId.toString() },
      });
      const res = mockRes();
      await callController(cancelBooking, req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  // -------------------------------------------------------------------
  // 5. respondToBooking
  // -------------------------------------------------------------------
  describe('respondToBooking', () => {
    it('should allow the artisan to accept a pending booking', async () => {
      const booking = await createTestBooking({ status: 'pending' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
        body: { action: 'accept' },
      });
      const res = mockRes();
      await callController(respondToBooking, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });

    it('should allow the artisan to reject a pending booking', async () => {
      const booking = await createTestBooking({ status: 'pending' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
        body: { action: 'reject', reason: 'Too busy' },
      });
      const res = mockRes();
      await callController(respondToBooking, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
      expect(res.body.data.rejectionReason).toBe('Too busy');
    });

    it('should return 400 when booking is already handled', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
        body: { action: 'accept' },
      });
      const res = mockRes();
      await callController(respondToBooking, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Booking already handled');
    });

    it('should return 403 when a non-artisan tries to respond', async () => {
      const booking = await createTestBooking({ status: 'pending' });

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
        body: { action: 'accept' },
      });
      const res = mockRes();
      await callController(respondToBooking, req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Forbidden');
    });

    it('should return 400 for invalid action', async () => {
      const booking = await createTestBooking({ status: 'pending' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
        body: { action: 'invalid' },
      });
      const res = mockRes();
      await callController(respondToBooking, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid action');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = mockReq({
        user: testArtisan,
        params: { id: fakeId.toString() },
        body: { action: 'accept' },
      });
      const res = mockRes();
      await callController(respondToBooking, req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  // -------------------------------------------------------------------
  // 6. requestModification
  //
  // NOTE: The bookingModel schema defines modificationRequest as an inline
  // subdocument with `status: { default: 'pending' }`. Mongoose applies
  // this default on every hydration, so every new booking appears to have
  // a "pending" modification request. To test requestModification's happy
  // path, we first set the status to 'approved' to simulate a booking
  // with no active modification request.
  // -------------------------------------------------------------------
  describe('requestModification', () => {
    // Helper: clear the default modificationRequest so the controller
    // doesn't think there's already a pending modification.
    async function clearModificationRequest(bookingId) {
      await Booking.collection.updateOne(
        { _id: bookingId },
        { $set: { 'modificationRequest.status': 'approved' } }
      );
    }

    it('should allow the user to request a modification on a confirmed booking', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });
      await clearModificationRequest(booking._id);
      const newStart = new Date(Date.now() + 72 * 60 * 60 * 1000);

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
        body: {
          newStart: newStart.toISOString(),
          reason: 'Need to reschedule',
        },
      });
      const res = mockRes();
      await callController(requestModification, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.modificationRequest.status).toBe('pending');
      expect(res.body.data.modificationRequest.reason).toBe('Need to reschedule');
    });

    it('should reject modification request when one is already pending', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });
      // Explicit pending modification request with full data
      booking.modificationRequest = {
        newStart: new Date(Date.now() + 72 * 60 * 60 * 1000),
        newEnd: new Date(Date.now() + 73 * 60 * 60 * 1000),
        reason: 'First request',
        requestedBy: testUser._id,
        requestedAt: new Date(),
        status: 'pending',
      };
      await booking.save();

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
        body: {
          newStart: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
          reason: 'Second request',
        },
      });
      const res = mockRes();
      await callController(requestModification, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('A modification request is already pending');
    });

    it('should return 403 when a non-owner tries to request modification', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });
      await clearModificationRequest(booking._id);
      const otherUser = await User.create({
        fullName: 'Outsider',
        email: 'outsider@example.com',
        password: 'Password123',
      });

      const req = mockReq({
        user: otherUser,
        params: { id: booking._id.toString() },
        body: {
          newStart: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        },
      });
      const res = mockRes();
      await callController(requestModification, req, res);

      expect(res.statusCode).toBe(403);
    });

    it('should return 400 for cancelled bookings', async () => {
      const booking = await createTestBooking({ status: 'cancelled' });
      await clearModificationRequest(booking._id);
      const newStart = new Date(Date.now() + 72 * 60 * 60 * 1000);

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
        body: { newStart: newStart.toISOString() },
      });
      const res = mockRes();
      await callController(requestModification, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Only pending or confirmed bookings can be modified');
    });
  });

  // -------------------------------------------------------------------
  // 7. respondToModification
  // -------------------------------------------------------------------
  describe('respondToModification', () => {
    it('should approve a modification and update booking times', async () => {
      const newStart = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);
      const booking = await createTestBooking({ status: 'confirmed' });
      booking.modificationRequest = {
        newStart,
        newEnd,
        reason: 'Rescheduling',
        requestedBy: testUser._id,
        requestedAt: new Date(),
        status: 'pending',
      };
      await booking.save();

      const req = mockReq({
        user: testArtisan, // artisan responds (different from requester)
        params: { id: booking._id.toString() },
        body: { action: 'approve' },
      });
      const res = mockRes();
      await callController(respondToModification, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.modificationRequest.status).toBe('approved');
      // Verify that the booking times were updated
      expect(new Date(res.body.data.start).getTime()).toBe(newStart.getTime());
      expect(new Date(res.body.data.end).getTime()).toBe(newEnd.getTime());
    });

    it('should reject a modification request', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });
      booking.modificationRequest = {
        newStart: new Date(Date.now() + 72 * 60 * 60 * 1000),
        newEnd: new Date(Date.now() + 73 * 60 * 60 * 1000),
        reason: 'Rescheduling',
        requestedBy: testUser._id,
        requestedAt: new Date(),
        status: 'pending',
      };
      await booking.save();

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
        body: { action: 'reject' },
      });
      const res = mockRes();
      await callController(respondToModification, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.modificationRequest.status).toBe('rejected');
    });

    it('should prevent the requester from responding to their own modification', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });
      booking.modificationRequest = {
        newStart: new Date(Date.now() + 72 * 60 * 60 * 1000),
        newEnd: new Date(Date.now() + 73 * 60 * 60 * 1000),
        reason: 'Rescheduling',
        requestedBy: testUser._id,
        requestedAt: new Date(),
        status: 'pending',
      };
      await booking.save();

      const req = mockReq({
        user: testUser, // same as requestedBy
        params: { id: booking._id.toString() },
        body: { action: 'approve' },
      });
      const res = mockRes();
      await callController(respondToModification, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('You cannot respond to your own modification request');
    });

    it('should return 400 when no pending modification exists', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });
      // Set modificationRequest.status to 'approved' (non-pending) to simulate
      // a booking that had a previous modification already handled.
      // This is needed because the schema defaults modificationRequest.status to 'pending'.
      await Booking.collection.updateOne(
        { _id: booking._id },
        { $set: { 'modificationRequest.status': 'approved' } }
      );

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
        body: { action: 'approve' },
      });
      const res = mockRes();
      await callController(respondToModification, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('No pending modification request');
    });
  });

  // -------------------------------------------------------------------
  // 8. completeBooking
  // -------------------------------------------------------------------
  describe('completeBooking', () => {
    it('should mark a confirmed booking as completed', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
      });
      const res = mockRes();
      await callController(completeBooking, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('should return 400 when trying to complete a pending booking', async () => {
      const booking = await createTestBooking({ status: 'pending' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
      });
      const res = mockRes();
      await callController(completeBooking, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Only confirmed bookings can be marked as completed');
    });

    it('should return 403 when a non-artisan tries to complete a booking', async () => {
      const booking = await createTestBooking({ status: 'confirmed' });

      const req = mockReq({
        user: testUser,
        params: { id: booking._id.toString() },
      });
      const res = mockRes();
      await callController(completeBooking, req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Forbidden');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = mockReq({
        user: testArtisan,
        params: { id: fakeId.toString() },
      });
      const res = mockRes();
      await callController(completeBooking, req, res);

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 when trying to complete a cancelled booking', async () => {
      const booking = await createTestBooking({ status: 'cancelled' });

      const req = mockReq({
        user: testArtisan,
        params: { id: booking._id.toString() },
      });
      const res = mockRes();
      await callController(completeBooking, req, res);

      expect(res.statusCode).toBe(400);
    });
  });
});
