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
import { protect, protectAny } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/', protectAny, listForUser);
router.patch('/:id/read', protectAny, markRead);
router.post('/send-to-user', protectAny, sendToUser);
router.post('/send-to-users', protectAny, sendToUsers);
router.post('/broadcast', protect, broadcast);
router.get('/history', protect, getHistory);
router.delete('/:notificationId', protect, cancelNotification);

export default router;
