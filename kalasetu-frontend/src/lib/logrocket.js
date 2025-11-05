import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import { SESSION_REPLAY_CONFIG } from '../config/env.config.js';

/**
 * Initialize LogRocket for session replay
 */
export const initLogRocket = () => {
  if (!SESSION_REPLAY_CONFIG.enabled || SESSION_REPLAY_CONFIG.provider !== 'logrocket') {
    console.log('⚠️ LogRocket session replay is disabled');
    return;
  }

  if (!SESSION_REPLAY_CONFIG.logrocket.appId) {
    console.warn('LogRocket app ID is not configured');
    return;
  }

  try {
    LogRocket.init(SESSION_REPLAY_CONFIG.logrocket.appId, {
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      console: {
        shouldAggregateConsoleErrors: true,
      },
      network: {
        requestSanitizer: (request) => {
          // Sanitize sensitive headers
          if (request.headers['Authorization']) {
            request.headers['Authorization'] = '[REDACTED]';
          }
          if (request.headers['Cookie']) {
            request.headers['Cookie'] = '[REDACTED]';
          }
          return request;
        },
        responseSanitizer: (response) => {
          // Sanitize sensitive response data
          if (response.body) {
            try {
              const body = JSON.parse(response.body);
              if (body.token) body.token = '[REDACTED]';
              if (body.password) body.password = '[REDACTED]';
              response.body = JSON.stringify(body);
            } catch (e) {
              // Not JSON, leave as is
            }
          }
          return response;
        },
      },
      dom: {
        inputSanitizer: true, // Sanitize all input values
        textSanitizer: (text, element) => {
          // Sanitize sensitive text content
          if (element.type === 'password' || 
              element.autocomplete === 'cc-number' ||
              element.autocomplete === 'cc-csc') {
            return '[REDACTED]';
          }
          return text;
        },
      },
    });

    // Setup React integration
    setupLogRocketReact(LogRocket);

    console.log('✅ LogRocket initialized');
  } catch (error) {
    console.error('❌ Failed to initialize LogRocket:', error.message);
  }
};

/**
 * Identify user in LogRocket
 * @param {Object} user - User object
 */
export const identifyLogRocketUser = (user) => {
  if (!SESSION_REPLAY_CONFIG.enabled) return;

  try {
    LogRocket.identify(user.id || user._id, {
      name: user.fullName || user.username,
      email: user.email,
      accountType: user.role || 'USER',
      // Add custom traits
      verified: user.verified,
      createdAt: user.createdAt,
    });
    console.log('✅ LogRocket user identified');
  } catch (error) {
    console.error('❌ Failed to identify LogRocket user:', error.message);
  }
};

/**
 * Track custom event in LogRocket
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 */
export const trackLogRocketEvent = (eventName, properties = {}) => {
  if (!SESSION_REPLAY_CONFIG.enabled) return;

  try {
    LogRocket.track(eventName, properties);
  } catch (error) {
    console.error('❌ Failed to track LogRocket event:', error.message);
  }
};

/**
 * Add custom tag to session
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
export const addLogRocketTag = (key, value) => {
  if (!SESSION_REPLAY_CONFIG.enabled) return;

  try {
    LogRocket.addTag(key, value);
  } catch (error) {
    console.error('❌ Failed to add LogRocket tag:', error.message);
  }
};

/**
 * Capture exception in LogRocket
 * @param {Error} error - Error object
 * @param {Object} extra - Additional context
 */
export const captureLogRocketException = (error, extra = {}) => {
  if (!SESSION_REPLAY_CONFIG.enabled) return;

  try {
    LogRocket.captureException(error, {
      extra,
      tags: {
        source: 'manual-capture',
      },
    });
  } catch (err) {
    console.error('❌ Failed to capture exception in LogRocket:', err.message);
  }
};

/**
 * Get current session URL
 * @returns {Promise<string|null>} Session URL or null
 */
export const getLogRocketSessionURL = async () => {
  if (!SESSION_REPLAY_CONFIG.enabled) return null;

  try {
    return await new Promise((resolve) => {
      LogRocket.getSessionURL((sessionURL) => {
        resolve(sessionURL);
      });
    });
  } catch (error) {
    console.error('❌ Failed to get LogRocket session URL:', error.message);
    return null;
  }
};

export default LogRocket;
