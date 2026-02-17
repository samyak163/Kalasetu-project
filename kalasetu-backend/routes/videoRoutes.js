import express from 'express';
import {
  createRoom,
  getRoomDetails,
  deleteRoom,
  getToken,
  listRooms,
} from '../controllers/videoController.js';
import { protectAny } from '../middleware/authMiddleware.js';

const router = express.Router();

// protectAny authenticates both artisans and users, sets req.accountType

// Rooms
router.post('/rooms', protectAny, createRoom);
router.get('/rooms', protectAny, listRooms);
router.get('/rooms/:roomName', protectAny, getRoomDetails);
router.delete('/rooms/:roomName', protectAny, deleteRoom);

// Tokens
router.post('/tokens', protectAny, getToken);

export default router;
