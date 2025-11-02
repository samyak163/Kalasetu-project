import * as Sentry from '@sentry/react';
import { ERROR_TRACKING_CONFIG, SESSION_REPLAY_CONFIG } from '../config/env.config.js';
import LogRocket from 'logrocket';

/**
 * Initialize Sentry for error tracking
 */
export const initSentry = () => {
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
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Don't send errors in development
        if (import.meta.env.DEV) {
          console.log('Sentry event (dev):', event);
          return null;
        }

        // Attach LogRocket session URL to Sentry events
        if (SESSION_REPLAY_CONFIG.enabled && SESSION_REPLAY_CONFIG.provider === 'logrocket') {
          LogRocket.getSessionURL((sessionURL) => {
            if (sessionURL) {
              event.extra = event.extra || {};
              event.extra.sessionURL = sessionURL;
            }
          });
        }

        return event;
      },
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Network request failed',
        'Failed to fetch',
        'NetworkError'
      ]
    });

    console.log('✅ Sentry initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error.message);
  }
};

/**
 * Set user context
 */
export const setSentryUser = (user) => {
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
export const clearSentryUser = () => {
  if (!ERROR_TRACKING_CONFIG.enabled) return;
  Sentry.setUser(null);
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
export const captureMessage = (message, level = 'info') => {
  if (!ERROR_TRACKING_CONFIG.enabled) {
    console.log(`${level.toUpperCase()}:`, message);
    return;
  }

  Sentry.captureMessage(message, level);
};

export default Sentry;

