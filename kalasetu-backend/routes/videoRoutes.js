/**
 * @file videoRoutes.js — Daily.co Video Call Routes
 *
 * Video consultation room management via Daily.co. Handles room CRUD
 * and token generation for client-side video SDK. Uses protectAny
 * since both users and artisans participate in video calls.
 *
 * Mounted at: /api/video
 *
 * Routes (all protectAny):
 *  POST   /rooms           — Create a video room
 *  GET    /rooms           — List active rooms
 *  GET    /rooms/:roomName — Get room details
 *  DELETE /rooms/:roomName — Delete a room
 *  POST   /tokens          — Generate participant token
 *
 * @see controllers/videoController.js — Handler implementations
 * @see config/env.config.js — DAILY_CONFIG (API key)
 */
import express from 'express';
import {
  createRoom,
  getRoomDetails,
  deleteRoom,
  getToken,
  listRooms,
} from '../controllers/videoController.js';
import { protectAny, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// protectAny authenticates both artisans and users, sets req.accountType

// Rooms
router.post('/rooms', protectAny, createRoom);
// listRooms exposes all active rooms (names contain user IDs) — admin-only
router.get('/rooms', protectAdmin, listRooms);
router.get('/rooms/:roomName', protectAny, getRoomDetails);
router.delete('/rooms/:roomName', protectAny, deleteRoom);

// Tokens
router.post('/tokens', protectAny, getToken);

export default router;
