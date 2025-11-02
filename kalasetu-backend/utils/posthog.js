import { PostHog } from 'posthog-node';
import { ANALYTICS_CONFIG } from '../config/env.config.js';

let posthogClient = null;

/**
 * Initialize PostHog client
 * @returns {PostHog|null} PostHog client or null
 */
export const initPostHog = () => {
  if (!ANALYTICS_CONFIG.enabled || ANALYTICS_CONFIG.provider !== 'posthog') {
    console.log('⚠️ PostHog analytics is disabled');
    return null;
  }

  if (!ANALYTICS_CONFIG.posthog.apiKey) {
    console.warn('PostHog API key is not configured');
    return null;
  }

  try {
    posthogClient = new PostHog(
      ANALYTICS_CONFIG.posthog.apiKey,
      {
        host: ANALYTICS_CONFIG.posthog.host || 'https://app.posthog.com',
        flushAt: 20,
        flushInterval: 10000,
      }
    );

    console.log('✅ PostHog initialized');
    return posthogClient;
  } catch (error) {
    console.error('❌ Failed to initialize PostHog:', error.message);
    return null;
  }
};

/**
 * Get PostHog client instance
 * @returns {PostHog|null}
 */
export const getPostHogClient = () => {
  if (!posthogClient) {
    return initPostHog();
  }
  return posthogClient;
};

/**
 * Track event in PostHog
 * @param {string} distinctId - User ID
 * @param {string} event - Event name
 * @param {Object} properties - Event properties
 */
export const trackEvent = (distinctId, event, properties = {}) => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        $timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Failed to track PostHog event:', error.message);
  }
};

/**
 * Identify user in PostHog
 * @param {string} distinctId - User ID
 * @param {Object} properties - User properties
 */
export const identifyUser = (distinctId, properties = {}) => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.identify({
      distinctId,
      properties: {
        ...properties,
        $set: {
          email: properties.email,
          name: properties.name,
          accountType: properties.accountType,
        },
        $set_once: {
          createdAt: properties.createdAt || new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('❌ Failed to identify PostHog user:', error.message);
  }
};

/**
 * Set user properties
 * @param {string} distinctId - User ID
 * @param {Object} properties - Properties to set
 */
export const setUserProperties = (distinctId, properties = {}) => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.identify({
      distinctId,
      properties: {
        $set: properties,
      },
    });
  } catch (error) {
    console.error('❌ Failed to set PostHog user properties:', error.message);
  }
};

/**
 * Check if feature flag is enabled
 * @param {string} distinctId - User ID
 * @param {string} featureKey - Feature flag key
 * @returns {Promise<boolean>} Feature flag status
 */
export const isFeatureEnabled = async (distinctId, featureKey) => {
  const client = getPostHogClient();
  if (!client) return false;

  try {
    return await client.isFeatureEnabled(featureKey, distinctId);
  } catch (error) {
    console.error('❌ Failed to check PostHog feature flag:', error.message);
    return false;
  }
};

/**
 * Get feature flag payload
 * @param {string} distinctId - User ID
 * @param {string} featureKey - Feature flag key
 * @returns {Promise<any>} Feature flag payload
 */
export const getFeatureFlagPayload = async (distinctId, featureKey) => {
  const client = getPostHogClient();
  if (!client) return null;

  try {
    return await client.getFeatureFlagPayload(featureKey, distinctId);
  } catch (error) {
    console.error('❌ Failed to get PostHog feature flag payload:', error.message);
    return null;
  }
};

/**
 * Shutdown PostHog client gracefully
 */
export const shutdownPostHog = async () => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    await client.shutdown();
    console.log('✅ PostHog shutdown complete');
  } catch (error) {
    console.error('❌ Failed to shutdown PostHog:', error.message);
  }
};

export default {
  initPostHog,
  trackEvent,
  identifyUser,
  setUserProperties,
  isFeatureEnabled,
  getFeatureFlagPayload,
  shutdownPostHog,
};
