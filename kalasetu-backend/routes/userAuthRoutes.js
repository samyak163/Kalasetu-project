/**
 * @file userAuthRoutes.js — Customer Authentication & Account Routes
 *
 * Maps customer (User) auth and account management endpoints. This is the
 * consumer-side counterpart to authRoutes.js (artisan-side).
 *
 * Mounted at: /api/users
 *
 * Public routes:
 *  POST /register        — Customer registration (5/hour rate limit)
 *  POST /login           — Customer login (20/15min rate limit)
 *  POST /logout          — Clear ks_auth cookie
 *  POST /forgot-password — Send password reset email
 *  POST /reset-password  — Reset password via token
 *
 * Protected routes (userProtect):
 *  GET    /me                    — Get current user profile
 *  PUT    /profile               — Update profile details
 *  POST   /change-password       — Change password (requires old password)
 *  GET    /bookmarks             — List bookmarked artisans
 *  POST   /bookmarks/:artisanId  — Bookmark an artisan
 *  DELETE /bookmarks/:artisanId  — Remove bookmark
 *  GET    /ratings               — List user's submitted ratings
 *  GET    /orders                — List user's booking history
 *  POST   /support/contact       — Submit support contact form
 *  POST   /support/report        — Report an issue
 *
 * Auth: userProtect middleware (User model only, not artisans).
 *
 * @see controllers/userAuthController.js — Handler implementations
 * @see routes/authRoutes.js — Artisan-side equivalent
 */
import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getRatings,
  getOrders,
  contactSupport,
  reportIssue,
} from '../controllers/userAuthController.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Stricter rate limiter for sensitive auth endpoints
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

// Public routes
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', loginLimiter, forgotPassword);
router.post('/reset-password', loginLimiter, resetPassword);

// Private routes
router.get('/me', userProtect, getMe);
router.put('/profile', userProtect, updateProfile);
router.post('/change-password', userProtect, changePassword);
router.get('/bookmarks', userProtect, getBookmarks);
router.post('/bookmarks/:artisanId', userProtect, addBookmark);
router.delete('/bookmarks/:artisanId', userProtect, removeBookmark);
router.get('/ratings', userProtect, getRatings);
router.get('/orders', userProtect, getOrders);
router.post('/support/contact', userProtect, contactSupport);
router.post('/support/report', userProtect, reportIssue);

export default router;
