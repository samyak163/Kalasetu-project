/**
 * @file chatRoutes.js — Stream Chat Integration Routes
 *
 * Real-time messaging via Stream Chat. Provides token generation for
 * client-side SDK auth, DM channel creation, channel listing, and
 * member management. Uses protectAny since both users and artisans chat.
 *
 * Mounted at: /api/chat
 *
 * Routes (all protectAny):
 *  GET  /token                                    — Get Stream Chat auth token
 *  POST /channels/dm                              — Create 1:1 DM channel
 *  GET  /channels                                 — List user's channels
 *  POST /channels/:channelType/:channelId/members — Add members to channel
 *  DELETE /channels/:channelType/:channelId/members — Remove members
 *
 * @see controllers/chatController.js — Handler implementations
 * @see config/env.config.js — STREAM_CONFIG (API key + secret)
 */
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
