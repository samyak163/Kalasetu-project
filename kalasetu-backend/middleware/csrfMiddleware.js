import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * CSRF Protection Middleware
 *
 * Since we use SameSite=None cookies for cross-origin auth (Vercel frontend + Render backend),
 * we need CSRF protection. This uses the double-submit pattern with a custom header:
 *
 * 1. On login, a CSRF token is generated and returned in the response body
 * 2. Frontend stores it in memory/localStorage and sends it as X-CSRF-Token header
 * 3. This middleware verifies the token on state-changing requests (POST, PUT, PATCH, DELETE)
 *
 * Custom headers cannot be set by cross-origin forms or simple requests, which blocks CSRF.
 */

/**
 * Generate a CSRF token tied to a user session
 * @param {string} userId - The user's ID
 * @returns {string} CSRF token
 */
export const generateCsrfToken = (userId) => {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  // Sign with JWT_SECRET so it can't be forged
  return jwt.sign({ csrf: payload }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Middleware that verifies the CSRF token on state-changing requests.
 * Safe methods (GET, HEAD, OPTIONS) are allowed through without CSRF check.
 * Webhook routes should be excluded (they have their own signature verification).
 */
export const verifyCsrf = (req, res, next) => {
  // Safe methods don't need CSRF protection
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF for routes that have their own verification (webhooks, jobs)
  // Note: mounted at /api, so req.path is relative (e.g. /payments/webhook, /jobs/...)
  if (req.path.includes('/webhook') || req.path.startsWith('/jobs')) {
    return next();
  }

  // Skip CSRF for unauthenticated routes (user doesn't have a token yet)
  const publicPaths = [
    '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password',
    '/auth/firebase-login',
    '/users/login', '/users/register', '/users/forgot-password', '/users/reset-password',
    '/admin/auth/login',
    '/otp/', '/auth-helpers/',
    '/contact',
  ];
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  // In development, CSRF is optional for easier testing
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'];
  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
    });
  }

  try {
    jwt.verify(csrfToken, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired CSRF token',
    });
  }
};
