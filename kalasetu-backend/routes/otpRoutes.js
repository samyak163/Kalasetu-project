/**
 * @file otpRoutes.js — OTP Generation & Verification Routes
 *
 * Email-based OTP for registration and login flows. Contains inline
 * handler logic (no separate controller). Rate-limited to 5 OTP
 * requests per 15 minutes per IP to prevent email quota abuse.
 *
 * Mounted at: /api/otp
 *
 * Routes:
 *  POST /send   — Generate and email an OTP (5/15min rate limit)
 *  POST /verify — Verify an OTP code (max 5 attempts per code)
 *
 * OTP storage strategy:
 *  - Existing users: OTP stored directly on User/Artisan document
 *    (otpCode, otpExpires fields)
 *  - New registrations: OTP stored in temporary OTP collection
 *    (auto-deleted by MongoDB TTL index)
 *
 * Phone OTP is defined but not yet implemented (returns error).
 *
 * @see utils/otp.js — OTP generation and verification helpers
 * @see utils/email.js — sendOTPEmail()
 * @see models/otpModel.js — Temporary OTP storage with TTL
 */
import express from 'express';
import { generateOTPWithExpiry, verifyOTP } from '../utils/otp.js';
import { sendOTPEmail } from '../utils/email.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import OTP from '../models/otpModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limit OTP requests (prevent SMS/email quota abuse)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please try again later.' },
});

/**
 * Send OTP for registration/login
 * POST /api/otp/send
 */
router.post('/send', otpLimiter, asyncHandler(async (req, res) => {
  const { email, phoneNumber, purpose = 'registration' } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({
      success: false,
      error: 'Email or phone number is required',
    });
  }

  // Generate OTP (returns plaintext code for email + hashed code for storage)
  const { code, hashedCode, expiresAt } = await generateOTPWithExpiry(10);

  // Store OTP (works for both existing and new users)
  if (email) {
    // Check if user exists
    let user = await User.findOne({ email }).select('_id email fullName +otpCode +otpExpires');
    let userType = 'user';

    if (!user) {
      user = await Artisan.findOne({ email }).select('_id email fullName +otpCode +otpExpires');
      userType = 'artisan';
    }

    if (user) {
      // Store HASHED OTP in user document (plaintext only sent via email)
      user.otpCode = hashedCode;
      user.otpExpires = expiresAt;
      user.otpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      // Send plaintext OTP via email
      await sendOTPEmail(
        email,
        user.fullName || 'User',
        code,
        purpose
      ).catch(err => {
        console.error('Failed to send OTP email:', err);
      });
    } else {
      // New user registration - store OTP in temporary collection
      await OTP.deleteMany({ identifier: email });

      // Store HASHED code in DB
      await OTP.create({
        identifier: email,
        code: hashedCode,
        expiresAt,
        purpose,
        attempts: 0,
      });

      // Send plaintext OTP via email
      await sendOTPEmail(
        email,
        'User',
        code,
        purpose
      ).catch(err => {
        console.error('Failed to send OTP email:', err);
      });
    }
  } else if (phoneNumber) {
    // Phone OTP (similar logic, but for SMS - implement later)
    // For now, return error
    return res.status(400).json({
      success: false,
      error: 'Phone OTP not yet implemented. Please use email.',
    });
  }

  res.json({
    success: true,
    message: 'OTP sent successfully',
    expiresIn: 600, // 10 minutes in seconds
  });
}));

/**
 * Verify OTP
 * POST /api/otp/verify
 */
router.post('/verify', asyncHandler(async (req, res) => {
  const { email, phoneNumber, otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      error: 'OTP code is required',
    });
  }

  const identifier = email || phoneNumber;
  if (!identifier) {
    return res.status(400).json({
      success: false,
      error: 'Email or phone number is required',
    });
  }

  // Find user and verify OTP
  let user = null;
  let otpRecord = null;
  
  if (email) {
    // Check existing user first
    user = await User.findOne({ email }).select('+otpCode +otpExpires +otpAttempts');
    if (!user) {
      user = await Artisan.findOne({ email }).select('+otpCode +otpExpires +otpAttempts');
    }
    
    // If no user, check temporary OTP collection
    if (!user) {
      otpRecord = await OTP.findOne({ identifier: email });
    }
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber }).select('+otpCode +otpExpires +otpAttempts');
    if (!user) {
      user = await Artisan.findOne({ phoneNumber }).select('+otpCode +otpExpires +otpAttempts');
    }
    
    if (!user) {
      otpRecord = await OTP.findOne({ identifier: phoneNumber });
    }
  }

  // Determine which OTP source to use
  const storedCode = user?.otpCode || otpRecord?.code;
  const expiresAt = user?.otpExpires || otpRecord?.expiresAt;
  const attempts = user?.otpAttempts || otpRecord?.attempts || 0;

  if (!storedCode || !expiresAt) {
    return res.status(400).json({
      success: false,
      error: 'OTP not found or expired. Please request a new one.',
    });
  }

  // Check attempts (max 5 attempts)
  if (attempts >= 5) {
    return res.status(429).json({
      success: false,
      error: 'Too many failed attempts. Please request a new OTP.',
    });
  }

  // Verify OTP (async — uses bcrypt.compare for hashed codes)
  const isValid = await verifyOTP(otp, storedCode, expiresAt);

  if (!isValid) {
    // Increment attempts
    if (user) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
    } else if (otpRecord) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      await otpRecord.save();
    }
    
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP code',
      attemptsRemaining: 5 - attempts - 1,
    });
  }

  // Clear OTP after successful verification
  if (user) {
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });
  } else if (otpRecord) {
    otpRecord.verified = true;
    await otpRecord.save();
    // Keep OTP record for 5 minutes after verification (for registration completion)
    // Then MongoDB TTL will auto-delete
  }

  res.json({
    success: true,
    message: 'OTP verified successfully',
  });
}));

export default router;

