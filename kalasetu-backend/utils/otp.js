import crypto from 'crypto';

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
 * @returns {Object} { code, expiresAt }
 */
export const generateOTPWithExpiry = (expiryMinutes = 10) => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return { code, expiresAt };
};

/**
 * Verify OTP code
 * @param {string} providedCode - Code provided by user
 * @param {string} storedCode - Code stored in database
 * @param {Date} expiresAt - Expiration date
 * @returns {boolean} True if valid, false otherwise
 */
export const verifyOTP = (providedCode, storedCode, expiresAt) => {
  if (!providedCode || !storedCode || !expiresAt) {
    return false;
  }

  // Check if expired
  if (new Date() > new Date(expiresAt)) {
    return false;
  }

  // Check if code matches
  return providedCode.trim() === storedCode.trim();
};

