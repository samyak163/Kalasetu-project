/**
 * @file otpModel.js — One-Time Password Storage Schema
 * @collection otps
 *
 * Temporary storage for OTP codes used during registration, login,
 * and contact verification flows (before a user account exists).
 *
 * For existing users, OTP fields are stored directly on the User/Artisan model.
 * This collection is specifically for pre-registration verification where
 * there's no account document to attach the OTP to.
 *
 * Key fields:
 *  - identifier — Email or phone number being verified
 *  - code       — The OTP code (should be hashed in production)
 *  - expiresAt  — Auto-delete via MongoDB TTL index (expired docs removed automatically)
 *  - purpose    — What the OTP is for (registration/login/verification)
 *  - attempts   — Failed verification attempts (for rate limiting)
 *  - verified   — Whether the OTP has been successfully verified
 *
 * TTL index: Documents auto-delete when expiresAt passes (MongoDB handles cleanup).
 *
 * @exports {Model} OTP — Mongoose model
 *
 * @see utils/otp.js — OTP generation and verification logic
 * @see controllers/authController.js — Artisan registration OTP flow
 * @see controllers/userAuthController.js — User registration OTP flow
 */

import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true, // For fast lookup
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // TTL index will be created separately below
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'verification'],
    default: 'verification',
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Auto-delete expired OTPs (MongoDB TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;

