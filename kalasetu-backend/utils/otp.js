import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
export const generateOTP = () => {
  // Generate a 6-digit code (000000 to 999999)
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate OTP with expiration time
 * @param {number} expiryMinutes - Expiration time in minutes (default: 10)
 * @returns {Object} { code, hashedCode, expiresAt }
 */
export const generateOTPWithExpiry = async (expiryMinutes = 10) => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  // Hash the OTP for storage — plaintext code is only sent to user via email/SMS
  // Cost factor 8 (lower than passwords) since OTPs are temporary and rate-limited
  const hashedCode = await bcrypt.hash(code, 8);
  return { code, hashedCode, expiresAt };
};

/**
 * Verify OTP code against a hashed stored code
 * @param {string} providedCode - Plaintext code provided by user
 * @param {string} storedCode - Hashed code stored in database
 * @param {Date} expiresAt - Expiration date
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
export const verifyOTP = async (providedCode, storedCode, expiresAt) => {
  if (!providedCode || !storedCode || !expiresAt) {
    return false;
  }

  // Check if expired
  if (new Date() > new Date(expiresAt)) {
    return false;
  }

  // Compare against bcrypt hash
  return await bcrypt.compare(providedCode.trim(), storedCode);
};

