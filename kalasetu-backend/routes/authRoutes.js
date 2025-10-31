import express from 'express';
import { register, login, me, logout, forgotPassword, resetPassword, firebaseLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.post('/firebase-login', asyncHandler(firebaseLogin));
router.get('/me', protect, asyncHandler(me));

export default router;


