import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';
import {
  getChatToken,
  createDMChannel,
  getUserChannels,
  addMembers,
  removeMembers,
} from '../controllers/chatController.js';

const router = express.Router();

// Custom auth middleware that accepts BOTH artisan AND user authentication
// This replaces the broken middleware that was calling protect() and userProtect()
const authMiddleware = async (req, res, next) => {
  try {
    // Read JWT from cookie
    const token = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in User collection first
    let user = await User.findById(decoded.id).select('-password');

    // If not found, try Artisan collection
    if (!user) {
      user = await Artisan.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
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
