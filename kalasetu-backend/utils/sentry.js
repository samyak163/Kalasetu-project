import * as Sentry from '@sentry/node';
import { ERROR_TRACKING_CONFIG, SERVER_CONFIG } from '../config/env.config.js';

/**
 * Initialize Sentry for error tracking
 */
export const initSentry = (app) => {
  if (!ERROR_TRACKING_CONFIG.enabled || ERROR_TRACKING_CONFIG.provider !== 'sentry') {
    console.log('⚠️ Sentry error tracking is disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: ERROR_TRACKING_CONFIG.sentry.dsn,
      environment: ERROR_TRACKING_CONFIG.sentry.environment,
      tracesSampleRate: ERROR_TRACKING_CONFIG.sentry.tracesSampleRate,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration({ app }),
      ],
      beforeSend(event, hint) {
        // Don't send errors in development
        if (SERVER_CONFIG.nodeEnv === 'development') {
          console.log('Sentry event (dev):', event);
          return null;
        }
        return event;
      },
      ignoreErrors: [
        'Non-Error promise rejection captured',
        'ResizeObserver loop limit exceeded',
        'Network request failed'
      ]
    });

    console.log('✅ Sentry initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error.message);
  }
};

/**
 * Sentry request handler middleware (for v10+, this is handled in init)
 */
export const sentryRequestHandler = () => {
  // In Sentry v10+, request handling is done automatically via expressIntegration
  return (req, res, next) => next();
};

/**
 * Sentry tracing handler middleware (for v10+, this is handled in init)
 */
export const sentryTracingHandler = () => {
  // In Sentry v10+, tracing is done automatically
  return (req, res, next) => next();
};

/**
 * Sentry error handler middleware
 */
export const sentryErrorHandler = () => {
  if (!ERROR_TRACKING_CONFIG.enabled) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.setupExpressErrorHandler;
};

/**
 * Capture exception manually
 */
export const captureException = (error, context = {}) => {
  if (!ERROR_TRACKING_CONFIG.enabled) {
    console.error('Error:', error);
    return;
  }

  Sentry.withScope((scope) => {
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureException(error);
  });
};

/**
 * Capture message manually
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!ERROR_TRACKING_CONFIG.enabled) {
    console.log(`${level.toUpperCase()}:`, message);
    return;
  }

  Sentry.withScope((scope) => {
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureMessage(message, level);
  });
};

/**
 * Set user context
 */
export const setUser = (user) => {
  if (!ERROR_TRACKING_CONFIG.enabled) return;

  Sentry.setUser({
    id: user.id || user._id,
    email: user.email,
    username: user.fullName || user.username
  });
};

/**
 * Clear user context
 */
export const clearUser = () => {
  if (!ERROR_TRACKING_CONFIG.enabled) return;
  Sentry.setUser(null);
};

export default Sentry;

