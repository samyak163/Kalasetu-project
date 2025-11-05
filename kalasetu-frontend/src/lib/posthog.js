import posthog from 'posthog-js';
import { ANALYTICS_CONFIG } from '../config/env.config.js';

/**
 * Initialize PostHog for frontend analytics
 */
export const initPostHog = () => {
  if (!ANALYTICS_CONFIG.enabled || ANALYTICS_CONFIG.provider !== 'posthog') {
    console.log('⚠️ PostHog analytics is disabled');
    return;
  }

  if (!ANALYTICS_CONFIG.posthog.apiKey) {
    console.warn('PostHog API key is not configured');
    return;
  }

  try {
    posthog.init(ANALYTICS_CONFIG.posthog.apiKey, {
      api_host: ANALYTICS_CONFIG.posthog.host || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          posthog.debug();
        }
      },
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-sensitive]',
      },
      persistence: 'localStorage',
      // Privacy settings
      opt_in_site_apps: true,
      respect_dnt: true,
    });

    console.log('✅ PostHog initialized');
  } catch (error) {
    console.error('❌ Failed to initialize PostHog:', error.message);
  }
};

/**
 * Identify user in PostHog
 * @param {Object} user - User object
 */
export const identifyPostHogUser = (user) => {
  if (!ANALYTICS_CONFIG.enabled) return;

  try {
    posthog.identify(user.id || user._id, {
      email: user.email,
      name: user.fullName || user.username,
      accountType: user.role || 'USER',
      verified: user.verified,
      createdAt: user.createdAt,
    });
    console.log('✅ PostHog user identified');
  } catch (error) {
    console.error('❌ Failed to identify PostHog user:', error.message);
  }
};

/**
 * Reset PostHog on logout
 */
export const resetPostHog = () => {
  if (!ANALYTICS_CONFIG.enabled) return;

  try {
    posthog.reset();
  } catch (error) {
    console.error('❌ Failed to reset PostHog:', error.message);
  }
};

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 */
export const trackPostHogEvent = (eventName, properties = {}) => {
  if (!ANALYTICS_CONFIG.enabled) return;

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error('❌ Failed to track PostHog event:', error.message);
  }
};

/**
 * Set user properties
 * @param {Object} properties - User properties
 */
export const setPostHogUserProperties = (properties) => {
  if (!ANALYTICS_CONFIG.enabled) return;

  try {
    posthog.people.set(properties);
  } catch (error) {
    console.error('❌ Failed to set PostHog user properties:', error.message);
  }
};

/**
 * Check if feature flag is enabled
 * @param {string} featureKey - Feature flag key
 * @returns {boolean} Feature flag status
 */
export const isFeatureEnabled = (featureKey) => {
  if (!ANALYTICS_CONFIG.enabled) return false;

  try {
    return posthog.isFeatureEnabled(featureKey);
  } catch (error) {
    console.error('❌ Failed to check PostHog feature flag:', error.message);
    return false;
  }
};

/**
 * Get feature flag payload
 * @param {string} featureKey - Feature flag key
 * @returns {any} Feature flag payload
 */
export const getFeatureFlagPayload = (featureKey) => {
  if (!ANALYTICS_CONFIG.enabled) return null;

  try {
    return posthog.getFeatureFlagPayload(featureKey);
  } catch (error) {
    console.error('❌ Failed to get PostHog feature flag payload:', error.message);
    return null;
  }
};

/**
 * Track page view manually
 * @param {string} pageName - Page name
 * @param {Object} properties - Additional properties
 */
export const trackPageView = (pageName, properties = {}) => {
  if (!ANALYTICS_CONFIG.enabled) return;

  try {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page: pageName,
      ...properties,
    });
  } catch (error) {
    console.error('❌ Failed to track PostHog page view:', error.message);
  }
};

export default posthog;

// Lightweight helpers for flags/experiments
export const getVariant = (flagKey, defaultVariant = 'control') => {
  try {
    const value = posthog.getFeatureFlag?.(flagKey);
    return value ?? defaultVariant;
  } catch {
    return defaultVariant;
  }
};