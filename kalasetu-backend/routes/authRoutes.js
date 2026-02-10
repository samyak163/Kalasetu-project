import express from 'express';
import { register, login, me, logout, forgotPassword, resetPassword, firebaseLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts, please try again later.' },
});

router.post('/register', registerLimiter, asyncHandler(register));
router.post('/login', strictLimiter, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', strictLimiter, asyncHandler(forgotPassword));
router.post('/reset-password', strictLimiter, asyncHandler(resetPassword));
router.post('/firebase-login', asyncHandler(firebaseLogin));
router.get('/me', protect, asyncHandler(me));

export default router;


