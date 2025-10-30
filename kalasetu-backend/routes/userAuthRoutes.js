import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from '../controllers/userAuthController.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Private route
// This uses our new 'userProtect' middleware
router.get('/me', userProtect, getMe);

export default router;
