import express from 'express';
import {
  getChatToken,
  createDMChannel,
  getUserChannels,
  addMembers,
  removeMembers,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';

const router = express.Router();

// Apply either artisan OR USER authentication
const authMiddleware = (req, res, next) => {
  // Try artisan auth first
  protect(req, res, (err) => {
    if (!err && req.user) {
      return next();
    }
    
    // If artisan auth fails, try USER auth
    userProtect(req, res, (userErr) => {
      if (userErr || !req.user) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      next();
    });
  });
};

// Chat token
router.get('/token', authMiddleware, getChatToken);

// Channels
router.post('/channels/dm', authMiddleware, createDMChannel);
router.get('/channels', authMiddleware, getUserChannels);

// Channel members
router.post('/channels/:channelType/:channelId/members', authMiddleware, addMembers);
router.delete('/channels/:channelType/:channelId/members', authMiddleware, removeMembers);

export default router;
