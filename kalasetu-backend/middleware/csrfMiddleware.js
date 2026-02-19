/**
 * @file csrfMiddleware.js — Cross-Site Request Forgery Protection
 *
 * Implements the "double-submit with custom header" CSRF pattern.
 *
 * Why CSRF protection is needed:
 *  KalaSetu uses SameSite=None cookies (Vercel frontend on *.vercel.app
 *  talking to Render backend on *.onrender.com). This cross-origin cookie
 *  setup means browsers WILL send auth cookies on cross-site requests,
 *  making CSRF attacks possible without this middleware.
 *
 * How it works:
 *  1. On login, generateCsrfToken() creates a JWT-signed token
 *     → returned in the response body to the frontend
 *  2. Frontend stores it in memory and attaches it as `X-CSRF-Token` header
 *     on every state-changing request (POST, PUT, PATCH, DELETE)
 *  3. verifyCsrf() middleware checks the header exists and is valid
 *  4. Since custom headers cannot be set by cross-origin forms or <img> tags,
 *     this blocks CSRF attacks
 *
 * Exemptions (routes that skip CSRF):
 *  - GET, HEAD, OPTIONS (safe/read-only methods)
 *  - Webhook routes (verified by their own signature mechanisms)
 *  - QStash job routes (verified by QStash signing keys)
 *  - Public auth routes (user doesn't have a token yet)
 *  - All routes in development mode (for easier API testing)
 *
 * @exports {Function} generateCsrfToken — Create a CSRF token tied to a user session
 * @exports {Function} verifyCsrf        — Middleware that validates X-CSRF-Token header
 *
 * @requires crypto — Random bytes for token uniqueness
 * @requires jsonwebtoken — Sign/verify CSRF tokens (same secret as auth JWTs)
 *
 * @see controllers/authController.js — Returns CSRF token on artisan login
 * @see controllers/userAuthController.js — Returns CSRF token on user login
 * @see kalasetu-frontend/src/lib/axios.js — Attaches X-CSRF-Token header on requests
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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

  // Skip CSRF for routes that have their own signature verification
  // Note: mounted at /api, so req.path is relative (e.g. /payments/webhook, /jobs/...)
  // Use explicit path checks instead of broad .includes('/webhook') to prevent
  // accidental CSRF bypass if a future route name happens to contain 'webhook'
  const webhookPaths = ['/payments/webhook'];
  if (webhookPaths.some(p => req.path.startsWith(p)) || req.path.startsWith('/jobs')) {
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
    const decoded = jwt.verify(csrfToken, process.env.JWT_SECRET);

    // Defense-in-depth: verify CSRF token belongs to the authenticated user
    // The CSRF payload format is "userId:timestamp:random"
    const authToken = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];
    if (authToken && decoded.csrf) {
      try {
        const authDecoded = jwt.verify(authToken, process.env.JWT_SECRET);
        const csrfUserId = decoded.csrf.split(':')[0];
        if (csrfUserId && authDecoded.id && csrfUserId !== authDecoded.id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'CSRF token mismatch',
          });
        }
      } catch {
        // If auth token is invalid, the auth middleware will reject it later
      }
    }

    next();
  } catch {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired CSRF token',
    });
  }
};
