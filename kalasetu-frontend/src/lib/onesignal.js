import OneSignal from 'react-onesignal';
import { PUSH_CONFIG } from '../config/env.config.js';

/**
 * Initialize OneSignal
 */
export const initOneSignal = async () => {
  if (!PUSH_CONFIG.enabled || PUSH_CONFIG.provider !== 'onesignal') {
    console.log('⚠️ OneSignal is disabled');
    return;
  }

  if (!PUSH_CONFIG.onesignal.appId) {
    console.warn('OneSignal app ID is not configured');
    return;
  }

  try {
    await OneSignal.init({
      appId: PUSH_CONFIG.onesignal.appId,
      allowLocalhostAsSecureOrigin: import.meta.env.DEV,
      notifyButton: {
        enable: true,
      },
      welcomeNotification: {
        title: 'Welcome to KalaSetu!',
        message: 'Thanks for subscribing to notifications',
      },
      autoResubscribe: true,
      serviceWorkerParam: { scope: '/push/onesignal/' },
      serviceWorkerPath: 'OneSignalSDKWorker.js',
    });

    console.log('✅ OneSignal initialized');
  } catch (error) {
    console.error('❌ Failed to initialize OneSignal:', error.message);
  }
};

/**
 * Set external user ID (your app's user ID)
 * @param {string} userId - User ID
 */
export const setOneSignalUserId = async (userId) => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    await OneSignal.setExternalUserId(userId);
    console.log(`✅ OneSignal external user ID set: ${userId}`);
  } catch (error) {
    console.error('❌ Failed to set OneSignal user ID:', error.message);
  }
};

/**
 * Remove external user ID on logout
 */
export const removeOneSignalUserId = async () => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    await OneSignal.removeExternalUserId();
    console.log('✅ OneSignal external user ID removed');
  } catch (error) {
    console.error('❌ Failed to remove OneSignal user ID:', error.message);
  }
};

/**
 * Check if user is subscribed to notifications
 * @returns {Promise<boolean>} Subscription status
 */
export const isSubscribed = async () => {
  if (!PUSH_CONFIG.enabled) return false;

  try {
    return await OneSignal.getNotificationPermission() === 'granted';
  } catch (error) {
    console.error('❌ Failed to check subscription status:', error.message);
    return false;
  }
};

/**
 * Request notification permission
 * @returns {Promise<boolean>} Permission granted
 */
export const requestNotificationPermission = async () => {
  if (!PUSH_CONFIG.enabled) return false;

  try {
    const permission = await OneSignal.registerForPushNotifications();
    console.log('✅ Notification permission requested');
    return permission;
  } catch (error) {
    console.error('❌ Failed to request notification permission:', error.message);
    return false;
  }
};

/**
 * Add tag to user
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
export const addTag = async (key, value) => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    await OneSignal.sendTag(key, value);
    console.log(`✅ Tag added: ${key}=${value}`);
  } catch (error) {
    console.error('❌ Failed to add tag:', error.message);
  }
};

/**
 * Add multiple tags
 * @param {Object} tags - Object with key-value pairs
 */
export const addTags = async (tags) => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    await OneSignal.sendTags(tags);
    console.log('✅ Tags added:', tags);
  } catch (error) {
    console.error('❌ Failed to add tags:', error.message);
  }
};

/**
 * Remove tag
 * @param {string} key - Tag key
 */
export const removeTag = async (key) => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    await OneSignal.deleteTag(key);
    console.log(`✅ Tag removed: ${key}`);
  } catch (error) {
    console.error('❌ Failed to remove tag:', error.message);
  }
};

/**
 * Get user ID (OneSignal Player ID)
 * @returns {Promise<string|null>} Player ID
 */
export const getPlayerId = async () => {
  if (!PUSH_CONFIG.enabled) return null;

  try {
    const playerId = await OneSignal.getUserId();
    return playerId;
  } catch (error) {
    console.error('❌ Failed to get player ID:', error.message);
    return null;
  }
};

/**
 * Set notification click handler
 * @param {Function} handler - Click handler function
 */
export const setNotificationClickHandler = (handler) => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    OneSignal.on('notificationDisplay', (event) => {
      console.log('Notification displayed:', event);
    });

    OneSignal.on('notificationDismiss', (event) => {
      console.log('Notification dismissed:', event);
    });

    OneSignal.addListenerForNotificationOpened((event) => {
      console.log('Notification opened:', event);
      if (handler) {
        handler(event);
      }
    });

    console.log('✅ Notification handlers set');
  } catch (error) {
    console.error('❌ Failed to set notification handlers:', error.message);
  }
};

/**
 * Show slide prompt for notification permission
 */
export const showSlidePrompt = async () => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    await OneSignal.showSlidedownPrompt();
  } catch (error) {
    console.error('❌ Failed to show slide prompt:', error.message);
  }
};

/**
 * Show native prompt for notification permission
 */
export const showNativePrompt = async () => {
  if (!PUSH_CONFIG.enabled) return;

  try {
    await OneSignal.showNativePrompt();
  } catch (error) {
    console.error('❌ Failed to show native prompt:', error.message);
  }
};

export default OneSignal;
