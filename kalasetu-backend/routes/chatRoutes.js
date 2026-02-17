import express from 'express';
import {
  getChatToken,
  createDMChannel,
  getUserChannels,
  addMembers,
  removeMembers,
} from '../controllers/chatController.js';
import { protectAny } from '../middleware/authMiddleware.js';

const router = express.Router();

// protectAny authenticates both artisans and users, sets req.accountType

// Chat token
router.get('/token', protectAny, getChatToken);

// Channels
router.post('/channels/dm', protectAny, createDMChannel);
router.get('/channels', protectAny, getUserChannels);

// Channel members
router.post('/channels/:channelType/:channelId/members', protectAny, addMembers);
router.delete('/channels/:channelType/:channelId/members', protectAny, removeMembers);

export default router;
