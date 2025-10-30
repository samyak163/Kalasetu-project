import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/userModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // Simulate sending for now

// --- Validation Schemas (using Zod) ---
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});


// --- Register New Customer ---
// @desc    Register a new customer user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, password } = registerSchema.parse(req.body);

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // Bad Request
    throw new Error('User with this email already exists');
  }

  // Password hashing is handled by the pre-save hook in userModel.js
  const user = await User.create({
    fullName,
    email,
    password,
  });

  if (user) {
    const token = signJwt(user._id);
    setAuthCookie(res, token); // Set HTTP-only cookie

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// --- Login Customer ---
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }).select('+password +lockUntil +loginAttempts');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
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
    throw new Error(`Invalid email or password. ${remaining > 0 ? `${remaining} login attempt(s) left before lockout.` : 'Account locked.'}`);
  }
  await user.resetLoginAttempts();
  const token = signJwt(user._id);
  setAuthCookie(res, token); // Set HTTP-only cookie
  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
  });
});

// --- Logout Customer ---
// @desc    Log user out
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res, next) => {
  clearAuthCookie(res);
  res.status(200).json({ message: 'User logged out successfully' });
});

// --- Get Customer Profile ---
// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  // req.user is attached by the userProtectMiddleware
  // We already found the user, so we just return it.
  res.status(200).json(req.user);
});

// --- Forgot Password ---
// @route POST /api/users/forgot-password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
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
  // Simulate sending email
  console.log(`Password reset link for ${email}: ${resetUrl}`);
  res.status(200).json({ message: 'If this email is registered, you will receive a reset link shortly.' });
});

// --- Reset Password ---
// @route POST /api/users/reset-password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;
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
