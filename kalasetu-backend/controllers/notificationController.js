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
  const { userId, ownerId, ownerType = 'user', title, message, url, data } = req.body;
  const targetId = ownerId || userId;

  if (!targetId || !message) {
    return res.status(400).json({
      success: false,
      message: 'ownerId/userId and message are required',
    });
  }

  if (!['user', 'artisan'].includes(ownerType)) {
    return res.status(400).json({ success: false, message: 'ownerType must be user or artisan' });
  }

  await Notification.create({
    ownerId: targetId,
    ownerType,
    title: title || '',
    text: message,
    url: url || '',
  });

  const result = await sendNotificationToUser(targetId, {
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
  const { userIds, ownerIds, ownerType = 'user', title, message, url, data } = req.body;
  const ids = ownerIds || userIds;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'ownerIds/userIds array is required',
    });
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'message is required',
    });
  }

  if (!['user', 'artisan'].includes(ownerType)) {
    return res.status(400).json({ success: false, message: 'ownerType must be user or artisan' });
  }

  const docs = ids.map((id) => ({
    ownerId: id,
    ownerType,
    title: title || '',
    text: message,
    url: url || '',
  }));

  await Notification.insertMany(docs, { ordered: false }).catch(() => {});

  const result = await sendNotificationToUsers(ids, {
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
  const ownerId = req.account?._id || req.user?._id || req.accountId;
  const ownerType = req.accountType;

  if (!ownerId || !ownerType) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { limit = 50, offset = 0 } = req.query;
  const list = await Notification.find({
    ownerId,
    $or: [
      { ownerType },
      { ownerType: { $exists: false } },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(parseInt(offset, 10))
    .limit(Math.min(100, parseInt(limit, 10)))
    .lean();

  res.json({
    success: true,
    data: list.map((n) => ({
      id: n._id,
      title: n.title,
      text: n.text,
      url: n.url,
      read: n.read,
      createdAt: n.createdAt,
    })),
  });
});

/**
 * Mark one notification as read
 * PATCH /api/notifications/:id/read
 */
export const markRead = asyncHandler(async (req, res) => {
  const ownerId = req.account?._id || req.user?._id || req.accountId;
  const ownerType = req.accountType;
  if (!ownerId || !ownerType) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { id } = req.params;
  const updated = await Notification.findOneAndUpdate(
    {
      _id: id,
      ownerId,
      $or: [
        { ownerType },
        { ownerType: { $exists: false } },
      ],
    },
    { $set: { read: true } },
    { new: true }
  ).lean();
  if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: { id: updated._id, read: updated.read } });
});
