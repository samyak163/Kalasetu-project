import asyncHandler from '../utils/asyncHandler.js';
import { 
  sendNotificationToUser, 
  sendNotificationToUsers,
  sendBroadcastNotification,
  oneSignalClient 
} from '../utils/onesignal.js';

/**
 * Send notification to a user
 * POST /api/notifications/send-to-user
 */
export const sendToUser = asyncHandler(async (req, res) => {
  const { userId, title, message, url, data } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({
      success: false,
      message: 'userId, title, and message are required',
    });
  }

  const result = await sendNotificationToUser(userId, {
    title,
    message,
    url,
    data,
  });

  res.json({
    success: true,
    message: 'Notification sent successfully',
    data: result,
  });
});

/**
 * Send notification to multiple users
 * POST /api/notifications/send-to-users
 */
export const sendToUsers = asyncHandler(async (req, res) => {
  const { userIds, title, message, url, data } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'userIds array is required',
    });
  }

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: 'title and message are required',
    });
  }

  const result = await sendNotificationToUsers(userIds, {
    title,
    message,
    url,
    data,
  });

  res.json({
    success: true,
    message: 'Notifications sent successfully',
    data: result,
  });
});

/**
 * Send broadcast notification
 * POST /api/notifications/broadcast
 */
export const broadcast = asyncHandler(async (req, res) => {
  const { title, message, url, data } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: 'title and message are required',
    });
  }

  const result = await sendBroadcastNotification({
    title,
    message,
    url,
    data,
  });

  res.json({
    success: true,
    message: 'Broadcast notification sent successfully',
    data: result,
  });
});

/**
 * Get notification history
 * GET /api/notifications/history
 */
export const getHistory = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const result = await oneSignalClient.getNotificationHistory(
    parseInt(limit),
    parseInt(offset)
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Cancel notification
 * DELETE /api/notifications/:notificationId
 */
export const cancelNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const result = await oneSignalClient.cancelNotification(notificationId);

  res.json({
    success: true,
    message: 'Notification cancelled successfully',
    data: result,
  });
});
