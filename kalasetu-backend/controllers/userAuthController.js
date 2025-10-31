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
  phoneNumber: z.string().min(7, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform((v) => v.toLowerCase().trim()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});


// --- Register New Customer ---
// @desc    Register a new customer user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, phoneNumber, password } = registerSchema.parse(req.body);

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // Bad Request
    throw new Error('User with this email already exists');
  }

  const phoneExists = await User.findOne({ phoneNumber });
  if (phoneExists) {
    res.status(400);
    throw new Error('User with this phone number already exists');
  }

  // Password hashing is handled by the pre-save hook in userModel.js
  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    password,
  });

  if (user) {
    const token = signJwt(user._id);
    setAuthCookie(res, token); // Set HTTP-only cookie

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
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
  // Simulate sending email
  console.log(`Password reset link for ${email}: ${resetUrl}`);
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
  res.json(user.bookmarks || []);
});

// @route POST /api/users/bookmarks/:artisanId
export const addBookmark = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
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
  // TODO: Calculate from reviews/ratings collection
  // For now, return mock data structure
  res.json({
    overallRating: 0,
    ratingsCount: 0,
    categories: {
      punctuality: 0,
      courtesy: 0,
      generosity: 0,
      communication: 0,
      propertyCare: 0,
    },
    recentReviews: [],
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
  // TODO: Send email/create ticket
  res.json({ message: 'Message sent successfully' });
});

// @route POST /api/users/support/report
export const reportIssue = asyncHandler(async (req, res) => {
  // TODO: Create support ticket
  res.json({ message: 'Issue reported successfully' });
});
