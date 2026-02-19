/**
 * @file notificationRoutes.js — Notification Routes (In-App + Push)
 *
 * Two layers of notification endpoints:
 * 1. User-facing: view own in-app notifications, mark as read (protectAny)
 * 2. Admin-facing: send push notifications via OneSignal (protectAdmin)
 *
 * Mounted at: /api/notifications
 *
 * User routes (protectAny):
 *  GET   /           — List own notifications (paginated)
 *  PATCH /:id/read   — Mark single notification as read
 *
 * Admin routes (protectAdmin + permissions):
 *  POST   /send-to-user    — Send notification to one user (users:edit)
 *  POST   /send-to-users   — Send notification to multiple users (users:edit)
 *  POST   /broadcast       — Broadcast push to all users (users:edit)
 *  GET    /history          — OneSignal notification history
 *  DELETE /:notificationId  — Cancel a scheduled notification
 *
 * @see controllers/notificationController.js — Handler implementations
 * @see utils/onesignal.js — OneSignal push integration
 * @see models/notificationModel.js — In-app notification storage
 */
import express from 'express';
import {
  sendToUser,
  sendToUsers,
  broadcast,
  getHistory,
  cancelNotification,
  listForUser,
  markRead,
} from '../controllers/notificationController.js';
import { protectAny, protectAdmin, checkPermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes — view own notifications
router.get('/', protectAny, listForUser);
router.patch('/:id/read', protectAny, markRead);

// Admin-only routes — sending notifications to users is a platform action
router.post('/send-to-user', protectAdmin, checkPermission('users', 'edit'), sendToUser);
router.post('/send-to-users', protectAdmin, checkPermission('users', 'edit'), sendToUsers);
router.post('/broadcast', protectAdmin, checkPermission('users', 'edit'), broadcast);
router.get('/history', protectAdmin, getHistory);
router.delete('/:notificationId', protectAdmin, cancelNotification);

export default router;
