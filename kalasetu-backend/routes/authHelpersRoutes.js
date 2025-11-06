import express from 'express';
import { verifyRecaptcha } from '../utils/recaptcha.js';
import { RECAPTCHA_CONFIG } from '../config/env.config.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * Verify reCAPTCHA token
 * POST /api/auth/verify-recaptcha
 */
router.post('/verify-recaptcha', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'reCAPTCHA token is required',
    });
  }

  if (!RECAPTCHA_CONFIG.enabled) {
    // If reCAPTCHA is disabled, always return success (for development)
    return res.json({
      success: true,
      message: 'reCAPTCHA is disabled',
    });
  }

  if (!RECAPTCHA_CONFIG.secretKey) {
    console.warn('reCAPTCHA secret key not configured');
    return res.json({
      success: true,
      message: 'reCAPTCHA not configured, skipping verification',
    });
  }

  const result = await verifyRecaptcha(token, RECAPTCHA_CONFIG.secretKey);

  if (result.success) {
    res.json({
      success: true,
      score: result.score,
      action: result.action,
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'reCAPTCHA verification failed',
      errorCodes: result.errorCodes,
    });
  }
}));

export default router;

