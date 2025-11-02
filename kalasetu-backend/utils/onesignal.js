import axios from 'axios';
import { PUSH_CONFIG } from '../config/env.config.js';

/**
 * OneSignal REST API client
 */
class OneSignalClient {
  constructor() {
    this.appId = PUSH_CONFIG.onesignal.appId;
    this.apiKey = PUSH_CONFIG.onesignal.restApiKey;
    this.baseUrl = 'https://onesignal.com/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.apiKey}`,
      },
    });
  }

  /**
   * Send notification to specific user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Response
   */
  async sendToUser(userId, notification) {
    if (!PUSH_CONFIG.enabled || PUSH_CONFIG.provider !== 'onesignal') {
      console.log('⚠️ OneSignal is disabled');
      return null;
    }

    try {
      const response = await this.client.post('/notifications', {
        app_id: this.appId,
        include_external_user_ids: [userId],
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data || {},
        url: notification.url,
        web_url: notification.url,
        chrome_web_icon: notification.icon,
        firefox_icon: notification.icon,
        chrome_icon: notification.icon,
      });

      console.log(`✅ Notification sent to user ${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send OneSignal notification:', error.message);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Response
   */
  async sendToUsers(userIds, notification) {
    if (!PUSH_CONFIG.enabled || PUSH_CONFIG.provider !== 'onesignal') {
      console.log('⚠️ OneSignal is disabled');
      return null;
    }

    try {
      const response = await this.client.post('/notifications', {
        app_id: this.appId,
        include_external_user_ids: userIds,
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data || {},
        url: notification.url,
        web_url: notification.url,
      });

      console.log(`✅ Notification sent to ${userIds.length} users`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send OneSignal notifications:', error.message);
      throw error;
    }
  }

  /**
   * Send notification to all users
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Response
   */
  async sendToAll(notification) {
    if (!PUSH_CONFIG.enabled || PUSH_CONFIG.provider !== 'onesignal') {
      console.log('⚠️ OneSignal is disabled');
      return null;
    }

    try {
      const response = await this.client.post('/notifications', {
        app_id: this.appId,
        included_segments: ['All'],
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data || {},
        url: notification.url,
        web_url: notification.url,
      });

      console.log('✅ Notification sent to all users');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send broadcast notification:', error.message);
      throw error;
    }
  }

  /**
   * Send notification to segment
   * @param {string} segment - Segment name
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Response
   */
  async sendToSegment(segment, notification) {
    if (!PUSH_CONFIG.enabled || PUSH_CONFIG.provider !== 'onesignal') {
      console.log('⚠️ OneSignal is disabled');
      return null;
    }

    try {
      const response = await this.client.post('/notifications', {
        app_id: this.appId,
        included_segments: [segment],
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data || {},
        url: notification.url,
        web_url: notification.url,
      });

      console.log(`✅ Notification sent to segment ${segment}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send segment notification:', error.message);
      throw error;
    }
  }

  /**
   * Send notification with filters
   * @param {Array} filters - OneSignal filters
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Response
   */
  async sendWithFilters(filters, notification) {
    if (!PUSH_CONFIG.enabled || PUSH_CONFIG.provider !== 'onesignal') {
      console.log('⚠️ OneSignal is disabled');
      return null;
    }

    try {
      const response = await this.client.post('/notifications', {
        app_id: this.appId,
        filters,
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data || {},
        url: notification.url,
        web_url: notification.url,
      });

      console.log('✅ Notification sent with filters');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send filtered notification:', error.message);
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Response
   */
  async cancelNotification(notificationId) {
    if (!PUSH_CONFIG.enabled) return null;

    try {
      const response = await this.client.delete(`/notifications/${notificationId}`, {
        params: { app_id: this.appId },
      });

      console.log(`✅ Notification ${notificationId} cancelled`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to cancel notification:', error.message);
      throw error;
    }
  }

  /**
   * View notification details
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Notification details
   */
  async viewNotification(notificationId) {
    if (!PUSH_CONFIG.enabled) return null;

    try {
      const response = await this.client.get(`/notifications/${notificationId}`, {
        params: { app_id: this.appId },
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to view notification:', error.message);
      throw error;
    }
  }

  /**
   * Get notification history
   * @param {number} limit - Number of notifications to retrieve
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Object>} Notification history
   */
  async getNotificationHistory(limit = 50, offset = 0) {
    if (!PUSH_CONFIG.enabled) return null;

    try {
      const response = await this.client.get('/notifications', {
        params: {
          app_id: this.appId,
          limit,
          offset,
        },
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to get notification history:', error.message);
      throw error;
    }
  }

  /**
   * Create segment
   * @param {string} name - Segment name
   * @param {Array} filters - Segment filters
   * @returns {Promise<Object>} Response
   */
  async createSegment(name, filters) {
    if (!PUSH_CONFIG.enabled) return null;

    try {
      const response = await this.client.post('/apps/' + this.appId + '/segments', {
        name,
        filters,
      });

      console.log(`✅ Segment ${name} created`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create segment:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const oneSignalClient = new OneSignalClient();

// Helper functions
export const sendNotificationToUser = (userId, notification) => {
  return oneSignalClient.sendToUser(userId, notification);
};

export const sendNotificationToUsers = (userIds, notification) => {
  return oneSignalClient.sendToUsers(userIds, notification);
};

export const sendBroadcastNotification = (notification) => {
  return oneSignalClient.sendToAll(notification);
};

export const sendSegmentNotification = (segment, notification) => {
  return oneSignalClient.sendToSegment(segment, notification);
};
