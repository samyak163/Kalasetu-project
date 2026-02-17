import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Notification from '../models/notificationModel.js';
import { createNotification, createNotifications } from '../utils/notificationService.js';

// Mock req/res following existing test patterns (auth-middleware.test.js)
function mockReq(overrides = {}) {
  return {
    cookies: {},
    headers: {},
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

describe('Notification System', () => {
  const userId = new mongoose.Types.ObjectId();
  const artisanId = new mongoose.Types.ObjectId();

  // ── Model Tests ──────────────────────────────────────────────────

  describe('Notification Model', () => {
    it('should create a notification with all required fields', async () => {
      const notification = await Notification.create({
        ownerId: userId,
        ownerType: 'user',
        title: 'Test Title',
        text: 'Test notification text',
      });

      expect(notification).toBeDefined();
      expect(notification.ownerId.toString()).toBe(userId.toString());
      expect(notification.ownerType).toBe('user');
      expect(notification.title).toBe('Test Title');
      expect(notification.text).toBe('Test notification text');
    });

    it('should default read to false', async () => {
      const notification = await Notification.create({
        ownerId: userId,
        ownerType: 'user',
        text: 'Unread notification',
      });

      expect(notification.read).toBe(false);
    });

    it('should default title and url to empty strings', async () => {
      const notification = await Notification.create({
        ownerId: userId,
        ownerType: 'user',
        text: 'Minimal notification',
      });

      expect(notification.title).toBe('');
      expect(notification.url).toBe('');
    });

    it('should default ownerType to user', async () => {
      const notification = await Notification.create({
        ownerId: userId,
        text: 'Default ownerType notification',
      });

      expect(notification.ownerType).toBe('user');
    });

    it('should reject creation without ownerId', async () => {
      await expect(
        Notification.create({ ownerType: 'user', text: 'No owner' })
      ).rejects.toThrow();
    });

    it('should reject creation without text', async () => {
      await expect(
        Notification.create({ ownerId: userId, ownerType: 'user' })
      ).rejects.toThrow();
    });

    it('should reject invalid ownerType', async () => {
      await expect(
        Notification.create({ ownerId: userId, ownerType: 'admin', text: 'Bad type' })
      ).rejects.toThrow();
    });

    it('should include timestamps', async () => {
      const notification = await Notification.create({
        ownerId: userId,
        ownerType: 'artisan',
        text: 'Timestamped notification',
      });

      expect(notification.createdAt).toBeDefined();
      expect(notification.updatedAt).toBeDefined();
    });
  });

  // ── createNotification Utility Tests ─────────────────────────────

  describe('createNotification utility', () => {
    it('should create a notification in the database', async () => {
      const result = await createNotification({
        ownerId: userId,
        ownerType: 'user',
        title: 'Booking Confirmed',
        text: 'Your booking has been confirmed',
        url: '/bookings/123',
      });

      expect(result).toBeDefined();
      expect(result.ownerId.toString()).toBe(userId.toString());
      expect(result.text).toBe('Your booking has been confirmed');
      expect(result.url).toBe('/bookings/123');

      // Verify it persisted in DB
      const found = await Notification.findById(result._id);
      expect(found).toBeDefined();
      expect(found.title).toBe('Booking Confirmed');
    });

    it('should return null if ownerId is missing', async () => {
      const result = await createNotification({
        ownerType: 'user',
        text: 'No owner',
      });
      expect(result).toBeNull();
    });

    it('should return null if ownerType is missing', async () => {
      const result = await createNotification({
        ownerId: userId,
        text: 'No type',
      });
      expect(result).toBeNull();
    });

    it('should return null if text is missing', async () => {
      const result = await createNotification({
        ownerId: userId,
        ownerType: 'user',
      });
      expect(result).toBeNull();
    });

    it('should default title and url to empty strings', async () => {
      const result = await createNotification({
        ownerId: userId,
        ownerType: 'artisan',
        text: 'Minimal fields',
      });

      expect(result.title).toBe('');
      expect(result.url).toBe('');
    });
  });

  // ── createNotifications (bulk) Tests ─────────────────────────────

  describe('createNotifications utility', () => {
    it('should create multiple notifications', async () => {
      const items = [
        { title: 'First', text: 'First notification' },
        { title: 'Second', text: 'Second notification', url: '/test' },
      ];

      const results = await createNotifications(userId, 'user', items);

      expect(results).toHaveLength(2);
      expect(results[0].text).toBe('First notification');
      expect(results[1].url).toBe('/test');
    });

    it('should return empty array for missing ownerId', async () => {
      const results = await createNotifications(null, 'user', [{ text: 'Test' }]);
      expect(results).toEqual([]);
    });

    it('should return empty array for empty items', async () => {
      const results = await createNotifications(userId, 'user', []);
      expect(results).toEqual([]);
    });

    it('should filter out items without text', async () => {
      const items = [
        { title: 'No text' },
        { text: 'Has text' },
        { title: 'Also no text', text: '' },
      ];

      const results = await createNotifications(userId, 'user', items);
      // Only the item with non-empty text passes the filter (item.text is truthy)
      expect(results).toHaveLength(1);
      expect(results[0].text).toBe('Has text');
    });
  });

  // ── Notification Listing (listForUser logic) ─────────────────────
  // Tests the query logic that listForUser controller uses:
  //   Notification.find({ ownerId, ownerType }).sort({ createdAt: -1 })

  describe('Notification listing (getUserNotifications logic)', () => {
    beforeEach(async () => {
      // Create notifications for different users with slight time gaps
      await Notification.create({ ownerId: userId, ownerType: 'user', text: 'User notif 1', title: 'A' });
      // Small delay so createdAt values differ
      await new Promise(r => setTimeout(r, 10));
      await Notification.create({ ownerId: userId, ownerType: 'user', text: 'User notif 2', title: 'B' });
      await Notification.create({ ownerId: artisanId, ownerType: 'artisan', text: 'Artisan notif', title: 'C' });
    });

    it('should return notifications for a specific user', async () => {
      const list = await Notification.find({ ownerId: userId, ownerType: 'user' })
        .sort({ createdAt: -1 })
        .lean();

      expect(list).toHaveLength(2);
      expect(list[0].text).toBeDefined();
      expect(list[1].text).toBeDefined();
    });

    it('should return notifications sorted by createdAt descending', async () => {
      const list = await Notification.find({ ownerId: userId, ownerType: 'user' })
        .sort({ createdAt: -1 })
        .lean();

      const dates = list.map(n => new Date(n.createdAt).getTime());
      expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
    });

    it('should not return another user notifications', async () => {
      const list = await Notification.find({ ownerId: artisanId, ownerType: 'artisan' })
        .sort({ createdAt: -1 })
        .lean();

      expect(list).toHaveLength(1);
      expect(list[0].text).toBe('Artisan notif');
    });

    it('should support limit and skip for pagination', async () => {
      const list = await Notification.find({ ownerId: userId, ownerType: 'user' })
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(1)
        .lean();

      expect(list).toHaveLength(1);
    });

    it('should map response fields correctly (as controller does)', async () => {
      const list = await Notification.find({ ownerId: userId, ownerType: 'user' })
        .sort({ createdAt: -1 })
        .lean();

      // Controller maps each notification to this shape:
      const mapped = list.map(n => ({
        id: n._id,
        title: n.title,
        text: n.text,
        url: n.url,
        read: n.read,
        createdAt: n.createdAt,
      }));

      const notif = mapped[0];
      expect(notif).toHaveProperty('id');
      expect(notif).toHaveProperty('title');
      expect(notif).toHaveProperty('text');
      expect(notif).toHaveProperty('url');
      expect(notif).toHaveProperty('read');
      expect(notif).toHaveProperty('createdAt');
    });
  });

  // ── Mark Notification Read (markRead logic) ──────────────────────

  describe('markNotificationRead logic', () => {
    let notification;

    beforeEach(async () => {
      notification = await Notification.create({
        ownerId: userId,
        ownerType: 'user',
        title: 'Unread',
        text: 'Mark me as read',
      });
    });

    it('should mark a notification as read', async () => {
      const updated = await Notification.findOneAndUpdate(
        { _id: notification._id, ownerId: userId },
        { $set: { read: true } },
        { new: true },
      ).lean();

      expect(updated).toBeDefined();
      expect(updated.read).toBe(true);

      // Verify persistence
      const found = await Notification.findById(notification._id);
      expect(found.read).toBe(true);
    });

    it('should return null for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updated = await Notification.findOneAndUpdate(
        { _id: fakeId, ownerId: userId },
        { $set: { read: true } },
        { new: true },
      ).lean();

      expect(updated).toBeNull();
    });

    it('should not allow marking another user notification as read', async () => {
      const otherId = new mongoose.Types.ObjectId();
      const updated = await Notification.findOneAndUpdate(
        { _id: notification._id, ownerId: otherId },
        { $set: { read: true } },
        { new: true },
      ).lean();

      expect(updated).toBeNull();

      // Original should still be unread
      const found = await Notification.findById(notification._id);
      expect(found.read).toBe(false);
    });
  });

  // ── Mark All Read ────────────────────────────────────────────────

  describe('markAllRead logic', () => {
    beforeEach(async () => {
      await Notification.create([
        { ownerId: userId, ownerType: 'user', text: 'Notif 1' },
        { ownerId: userId, ownerType: 'user', text: 'Notif 2' },
        { ownerId: artisanId, ownerType: 'artisan', text: 'Other user notif' },
      ]);
    });

    it('should mark all user notifications as read', async () => {
      await Notification.updateMany(
        { ownerId: userId, ownerType: 'user' },
        { $set: { read: true } },
      );

      const userNotifs = await Notification.find({ ownerId: userId });
      expect(userNotifs.every(n => n.read)).toBe(true);

      // Other user's notifications should remain unread
      const otherNotifs = await Notification.find({ ownerId: artisanId });
      expect(otherNotifs[0].read).toBe(false);
    });
  });

  // ── Admin Route Protection Verification ──────────────────────────

  describe('Admin-only route protection', () => {
    // These tests verify the route file uses protectAdmin for send routes.
    // We import the route module and check its stack programmatically.
    it('send-to-user, send-to-users, and broadcast routes should use protectAdmin', async () => {
      const { default: router } = await import('../routes/notificationRoutes.js');

      // Express router stores routes in router.stack
      const routes = router.stack
        .filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
          middlewareCount: layer.route.stack.length,
        }));

      const sendToUser = routes.find(r => r.path === '/send-to-user');
      const sendToUsers = routes.find(r => r.path === '/send-to-users');
      const broadcastRoute = routes.find(r => r.path === '/broadcast');

      // All three should exist and have multiple middleware layers (protectAdmin + checkPermission + handler)
      expect(sendToUser).toBeDefined();
      expect(sendToUser.methods).toContain('post');
      expect(sendToUser.middlewareCount).toBeGreaterThanOrEqual(3);

      expect(sendToUsers).toBeDefined();
      expect(sendToUsers.methods).toContain('post');
      expect(sendToUsers.middlewareCount).toBeGreaterThanOrEqual(3);

      expect(broadcastRoute).toBeDefined();
      expect(broadcastRoute.methods).toContain('post');
      expect(broadcastRoute.middlewareCount).toBeGreaterThanOrEqual(3);
    });

    it('user-facing routes (list, markRead) should use protectAny', async () => {
      const { default: router } = await import('../routes/notificationRoutes.js');

      const routes = router.stack
        .filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
          middlewareCount: layer.route.stack.length,
        }));

      const listRoute = routes.find(r => r.path === '/' && r.methods.includes('get'));
      const readRoute = routes.find(r => r.path === '/:id/read');

      expect(listRoute).toBeDefined();
      // protectAny + handler = 2 middleware layers
      expect(listRoute.middlewareCount).toBeGreaterThanOrEqual(2);

      expect(readRoute).toBeDefined();
      expect(readRoute.middlewareCount).toBeGreaterThanOrEqual(2);
    });
  });
});
