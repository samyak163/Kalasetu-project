import asyncHandler from '../utils/asyncHandler.js';
import { 
  sendNotificationToUser, 
  sendNotificationToUsers,
  sendBroadcastNotification,
  oneSignalClient 
} from '../utils/onesignal.js';
import Notification from '../models/notificationModel.js';

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

/**
 * List notifications for current user
 * GET /api/notifications
 */
export const listForUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { limit = 50, offset = 0 } = req.query;
  const list = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(Math.min(100, parseInt(limit)))
    .lean();
  res.json({ success: true, data: list.map(n => ({
    id: n._id,
    title: n.title,
    text: n.text,
    url: n.url,
    read: n.read,
    createdAt: n.createdAt,
  })) });
});

/**
 * Mark one notification as read
 * PATCH /api/notifications/:id/read
 */
export const markRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { id } = req.params;
  const updated = await Notification.findOneAndUpdate({ _id: id, userId }, { $set: { read: true } }, { new: true }).lean();
  if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: { id: updated._id, read: updated.read } });
});
