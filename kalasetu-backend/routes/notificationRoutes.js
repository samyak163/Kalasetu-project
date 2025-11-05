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
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/', protect, listForUser);
router.patch('/:id/read', protect, markRead);
router.post('/send-to-user', protect, sendToUser);
router.post('/send-to-users', protect, sendToUsers);
router.post('/broadcast', protect, broadcast);
router.get('/history', protect, getHistory);
router.delete('/:notificationId', protect, cancelNotification);

export default router;
