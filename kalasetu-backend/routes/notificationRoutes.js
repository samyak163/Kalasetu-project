import express from 'express';
import {
  sendToUser,
  sendToUsers,
  broadcast,
  getHistory,
  cancelNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/send-to-user', protect, sendToUser);
router.post('/send-to-users', protect, sendToUsers);
router.post('/broadcast', protect, broadcast);
router.get('/history', protect, getHistory);
router.delete('/:notificationId', protect, cancelNotification);

export default router;
