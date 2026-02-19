/**
 * @file authRoutes.js — Artisan Authentication Routes
 *
 * Maps artisan auth endpoints to their controller handlers with rate limiting.
 * This file handles artisan-side authentication only (the "provider" side).
 *
 * Mounted at: /api/auth
 *
 * Routes:
 *  POST /register       — Artisan registration (5/hour rate limit)
 *  POST /login          — Artisan login (20/15min rate limit)
 *  POST /logout         — Clear ks_auth cookie
 *  POST /forgot-password — Send password reset email
 *  POST /reset-password  — Reset password via token
 *  POST /firebase-login  — Social auth via Firebase (Google/Apple)
 *  GET  /me              — Get current artisan profile (requires protect)
 *
 * Auth: protect middleware for /me only; all others are public.
 * Rate limits are applied per-IP to prevent brute-force attacks.
 *
 * @see controllers/authController.js — Handler implementations
 * @see routes/userAuthRoutes.js — Customer-side equivalent
 */
import express from 'express';
import { register, login, me, logout, forgotPassword, resetPassword, firebaseLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Please try again in 1 hour.' },
});

router.post('/register', registerLimiter, asyncHandler(register));
router.post('/login', loginLimiter, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', loginLimiter, asyncHandler(forgotPassword));
router.post('/reset-password', loginLimiter, asyncHandler(resetPassword));
router.post('/firebase-login', loginLimiter, asyncHandler(firebaseLogin));
router.get('/me', protect, asyncHandler(me));

export default router;


