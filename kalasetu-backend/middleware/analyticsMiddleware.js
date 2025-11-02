import { trackEvent } from '../utils/posthog.js';

/**
 * Middleware to track API requests
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
      ip: req.ip,
      success: res.statusCode < 400,
    });
  });

  next();
};

/**
 * Track specific user actions
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
