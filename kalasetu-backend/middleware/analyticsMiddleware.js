/**
 * @file analyticsMiddleware.js — PostHog API Request Tracking
 *
 * Tracks authenticated API requests as PostHog events for product analytics.
 * Only fires for authenticated users (skips anonymous/public requests).
 *
 * Two tracking modes:
 *  1. trackApiRequest   — Automatic: captures every authenticated API call
 *                         (method, path, status, duration, user agent)
 *  2. trackUserAction   — Manual: captures specific named actions on individual routes
 *                         (e.g., 'Booking Created', 'Payment Initiated')
 *
 * Performance: Uses res.on('finish') to track AFTER the response is sent,
 * so analytics never blocks or slows down the actual API response.
 *
 * @exports {Function} trackApiRequest  — Global middleware for all authenticated requests
 * @exports {Function} trackUserAction  — Route-specific middleware factory for named events
 *
 * @requires ../utils/posthog.js — trackEvent() function that sends events to PostHog
 *
 * @see server.js — Where trackApiRequest is mounted globally
 * @see config/env.config.js — ANALYTICS_CONFIG (PostHog enabled/disabled, API key)
 */

import { trackEvent } from '../utils/posthog.js';

/**
 * Global middleware: tracks every authenticated API request as a PostHog event.
 * Skips anonymous requests (no req.user means no PostHog event).
 * Measures response duration by hooking into the 'finish' event.
 */
export const trackApiRequest = (req, res, next) => {
  // Only track if user is authenticated
  if (!req.user) {
    return next();
  }

  const startTime = Date.now();

  // Hook into response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    trackEvent(req.user.id || req.user._id.toString(), 'API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      success: res.statusCode < 400,
    });
  });

  next();
};

/**
 * Route-specific middleware factory: tracks a named user action.
 * Fires immediately (not on response finish) for simplicity.
 *
 * @param {string} actionName — PostHog event name (e.g., 'Booking Created')
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post('/bookings', protectAny, trackUserAction('Booking Created'), createBooking)
 */
export const trackUserAction = (actionName) => {
  return (req, res, next) => {
    if (req.user) {
      trackEvent(req.user.id || req.user._id.toString(), actionName, {
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};
