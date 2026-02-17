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
