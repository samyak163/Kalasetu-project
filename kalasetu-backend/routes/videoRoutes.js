import express from 'express';
import {
  createRoom,
  getRoomDetails,
  deleteRoom,
  getToken,
  listRooms,
} from '../controllers/videoController.js';
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

// Rooms
router.post('/rooms', authMiddleware, createRoom);
router.get('/rooms', authMiddleware, listRooms);
router.get('/rooms/:roomName', authMiddleware, getRoomDetails);
router.delete('/rooms/:roomName', authMiddleware, deleteRoom);

// Tokens
router.post('/tokens', authMiddleware, getToken);

export default router;
