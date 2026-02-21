/**
 * @file userAuthController.js — Customer (User) Authentication & Profile
 *
 * Handles registration, login, logout, password reset, profile management,
 * bookmarks, ratings, and support for CUSTOMER accounts only.
 * Artisan auth is in authController.js.
 *
 * Auth Endpoints:
 *  POST /api/users/register        — Register new customer
 *  POST /api/users/login           — Login with email/phone + password
 *  GET  /api/users/me              — Get current user profile (requires `userProtect`)
 *  POST /api/users/logout          — Clear auth cookie
 *  POST /api/users/forgot-password — Send password reset email
 *  POST /api/users/reset-password  — Reset password with token
 *
 * Profile Endpoints:
 *  PUT    /api/users/profile       — Update profile (fullName, bio, image)
 *  POST   /api/users/change-password — Change password (requires current password)
 *
 * Bookmark Endpoints:
 *  GET    /api/users/bookmarks            — List saved artisans
 *  POST   /api/users/bookmarks/:artisanId — Save an artisan
 *  DELETE /api/users/bookmarks/:artisanId — Remove saved artisan
 *
 * Other Endpoints:
 *  GET  /api/users/ratings          — User's review statistics
 *  GET  /api/users/orders           — Order history (placeholder)
 *  POST /api/users/support/contact  — Create support ticket
 *  POST /api/users/support/report   — Report an issue
 *
 * Auth: Uses `userProtect` middleware (User model only)
 *
 * @see authController.js — Artisan authentication
 * @see middleware/userProtectMiddleware.js — `userProtect` used on protected routes
 */

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/userModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import { generateCsrfToken } from '../middleware/csrfMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/email.js';
import Review from '../models/reviewModel.js';
import Artisan from '../models/artisanModel.js';
import { createNotifications } from '../utils/notificationService.js';

// --- Validation Schemas (using Zod) ---
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().email('Invalid email address').transform((v) => v.toLowerCase().trim()).optional()
  ),
  phoneNumber: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().min(7, 'Phone number is required').max(20, 'Phone number is too long').optional()
  ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.email || data.phoneNumber, {
  message: 'Either email or phone number must be provided',
  path: ['email'],
});

const loginSchema = z.object({
  loginIdentifier: z.string().min(3, 'Email or phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform((v) => v.toLowerCase().trim()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});


// --- Register New USER ---
// @desc    Register a new USER user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, phoneNumber, password } = registerSchema.parse(req.body);

  // reCAPTCHA removed for demo - will be added back when going public with custom domain

  // Check for existing email/phone in parallel (optimize query)
  const [userExists, phoneExists] = await Promise.all([
    email ? User.findOne({ email }).select('_id').lean() : null,
    phoneNumber ? User.findOne({ phoneNumber }).select('_id').lean() : null,
  ]);

  if (userExists) {
    res.status(400); // Bad Request
    throw new Error('User with this email already exists');
  }

  if (phoneExists) {
    res.status(400);
    throw new Error('User with this phone number already exists');
  }

  // Password hashing is handled by the pre-save hook in userModel.js
  const userData = {
    fullName,
    password,
  };

  if (email) userData.email = email;
  if (phoneNumber) userData.phoneNumber = phoneNumber;

  const user = await User.create(userData);

  if (user) {
    const token = signJwt(user._id, 'user');
    setAuthCookie(res, token); // Set HTTP-only cookie

    // Send welcome email and verification email
    if (user.email) {
      const { sendWelcomeEmail, sendVerificationEmail } = await import('../utils/email.js');
      const cryptoModule = await import('crypto');
      const verificationToken = cryptoModule.randomBytes(32).toString('hex');

      // Save verification token in main flow (critical - must not be fire-and-forget)
      await User.findByIdAndUpdate(
        user._id,
        {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        { validateBeforeSave: false }
      );

      // Send emails (non-blocking with error capture)
      Promise.allSettled([
        sendWelcomeEmail(user.email, user.fullName),
        sendVerificationEmail(user.email, user.fullName, verificationToken)
      ]).catch(() => {});
    }

    const responsePayload = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      csrfToken: generateCsrfToken(user._id.toString()),
    };

    try {
      await createNotifications(user._id, 'user', [
        {
          title: 'Welcome to KalaSetu 🎉',
          text: `Hi ${user.fullName.split(' ')[0]}, welcome to the KalaSetu community! Start exploring artisans right away.`,
          url: '/',
        },
        {
          title: 'Verify your email',
          text: 'We just sent a verification link to your email. Please verify your account to unlock all features.',
          url: '/verify-email',
        },
      ]);
    } catch (notificationError) {
      console.error('Failed to queue user onboarding notifications:', notificationError);
    }

    res.status(201).json(responsePayload);

  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// --- Login USER ---
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res, next) => {
  const { loginIdentifier, password } = loginSchema.parse(req.body);
  const isEmail = loginIdentifier.includes('@');
  const query = isEmail
    ? { email: loginIdentifier.toLowerCase().trim() }
    : { phoneNumber: loginIdentifier.trim() };

  const user = await User.findOne(query).select('+password +lockUntil +loginAttempts');
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  if (user.isLocked && user.isLocked()) {
    const unlockAt = new Date(user.lockUntil).toLocaleTimeString();
    res.status(423);
    throw new Error(`Account is temporarily locked due to too many failed login attempts. Try again after ${unlockAt}.`);
  }
  const valid = await user.matchPassword(password);
  if (!valid) {
    await user.incLoginAttempts();
    const remaining = 5 - user.loginAttempts;
    res.status(401);
    throw new Error(`Invalid credentials. ${remaining > 0 ? `${remaining} login attempt(s) left before lockout.` : 'Account locked.'}`);
  }
  await user.resetLoginAttempts();
  const token = signJwt(user._id, 'user');
  setAuthCookie(res, token); // Set HTTP-only cookie
  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    csrfToken: generateCsrfToken(user._id.toString()),
  });
});

// --- Logout USER ---
// @desc    Log user out
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res, next) => {
  clearAuthCookie(res);
  res.status(200).json({ message: 'User logged out successfully' });
});

// --- Get USER Profile ---
// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  // req.user is attached by the userProtectMiddleware
  const userData = req.user.toObject ? req.user.toObject() : { ...req.user };
  userData.csrfToken = generateCsrfToken(req.user._id.toString());
  res.status(200).json(userData);
});

// --- Forgot Password ---
// @route POST /api/users/forgot-password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'If this email is registered, you will receive a reset link shortly.' });
  }
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  // Send reset email (falls back to console when not configured)
  await sendPasswordResetEmail(user.email, user.fullName || 'there', resetToken);
  res.status(200).json({ message: 'If this email is registered, you will receive a reset link shortly.' });
});

// --- Reset Password ---
// @route POST /api/users/reset-password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token.');
  }
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.status(200).json({ message: 'Password reset successful. You can now log in.' });
});

// --- Update Profile ---
// @route PUT /api/users/profile
// @access Private
export const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = ['fullName', 'bio', 'profileImageUrl', 'preferences'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json(updated);
});

// --- Change Password ---
// @route POST /api/users/change-password
// @access Private
export const changePassword = asyncHandler(async (req, res) => {
  const schema = z.object({ 
    currentPassword: z.string(), 
    newPassword: z.string().min(8) 
  });
  const { currentPassword, newPassword } = schema.parse(req.body);
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

// --- Bookmarks ---
// @route GET /api/users/bookmarks
// @access Private
export const getBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarks');
  const bookmarks = (user.bookmarks || []).filter(Boolean);
  res.json(bookmarks);
});

// @route POST /api/users/bookmarks/:artisanId
export const addBookmark = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  const artisanExists = await Artisan.exists({ _id: artisanId });
  if (!artisanExists) {
    return res.status(404).json({ success: false, message: 'Artisan not found' });
  }
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: artisanId } });
  res.json({ success: true });
});

// @route DELETE /api/users/bookmarks/:artisanId
export const removeBookmark = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: artisanId } });
  res.json({ success: true });
});

// --- Ratings ---
// @route GET /api/users/ratings
// @access Private
export const getRatings = asyncHandler(async (req, res) => {
  // Aggregate reviews written by this user to artisans (or received by this user if such data exists later)
  const userId = req.user._id;
  const [stats, recent] = await Promise.all([
    Review.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Review.find({ user: userId }).sort({ createdAt: -1 }).limit(10).populate('artisan', 'fullName publicId'),
  ]);

  const overallRating = stats[0]?.avgRating || 0;
  const ratingsCount = stats[0]?.count || 0;

  res.json({
    overallRating: Number(overallRating.toFixed(2)),
    ratingsCount,
    categories: {},
    recentReviews: recent.map(r => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment,
      artisan: r.artisan,
      createdAt: r.createdAt,
    })),
  });
});

// --- Orders ---
// @route GET /api/users/orders
// @access Private
export const getOrders = asyncHandler(async (req, res) => {
  // TODO: Fetch from Order model
  // For now, return empty array
  res.json([]);
});

// --- Support ---
// @route POST /api/users/support/contact
export const contactSupport = asyncHandler(async (req, res) => {
  const { subject, message, priority, category } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required' });
  }
  const validCategories = ['booking', 'payment', 'refund', 'technical', 'account', 'other'];
  const SupportTicket = (await import('../models/supportTicketModel.js')).default;
  const ticket = await SupportTicket.create({
    subject,
    description: message,
    category: validCategories.includes(category) ? category : 'other',
    priority: priority || 'medium',
    createdBy: {
      userId: req.user._id,
      userModel: 'User',
      userName: req.user.fullName,
      userEmail: req.user.email
    }
  });
  res.status(201).json({
    success: true,
    message: 'Your support ticket has been created. We will get back to you soon.',
    data: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
  });
});

// @route POST /api/users/support/report
export const reportIssue = asyncHandler(async (req, res) => {
  const { type, description } = req.body;
  if (!description) {
    return res.status(400).json({ success: false, message: 'Description is required' });
  }
  const SupportTicket = (await import('../models/supportTicketModel.js')).default;
  const categoryMap = { bug: 'technical', payment: 'payment', booking: 'booking', other: 'other' };
  const ticket = await SupportTicket.create({
    subject: `Issue Report: ${type || 'General'}`,
    description,
    category: categoryMap[type] || 'other',
    priority: 'high',
    createdBy: {
      userId: req.user._id,
      userModel: 'User',
      userName: req.user.fullName,
      userEmail: req.user.email
    }
  });
  res.status(201).json({
    success: true,
    message: 'Your issue has been reported. Our team will review it shortly.',
    data: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
  });
});
