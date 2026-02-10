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

// Public routes
router.post('/register', registerLimiter, registerUser);
router.post('/login', strictLimiter, loginUser);
router.post('/logout', strictLimiter, logoutUser);
router.post('/forgot-password', strictLimiter, forgotPassword);
router.post('/reset-password', strictLimiter, resetPassword);

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
