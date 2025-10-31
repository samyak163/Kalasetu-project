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

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

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
