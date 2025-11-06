import mongoose from 'mongoose';

/**
 * Temporary OTP storage for users not yet registered
 * In production, use Redis instead
 */
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
    index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
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

