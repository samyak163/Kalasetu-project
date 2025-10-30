import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/userModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

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

  // Find user and explicitly select the password (since it's hidden by default)
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    const token = signJwt(user._id);
    setAuthCookie(res, token); // Set HTTP-only cookie

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
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
