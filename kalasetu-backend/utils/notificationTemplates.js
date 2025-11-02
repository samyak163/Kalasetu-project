import { sendNotificationToUser } from './onesignal.js';

/**
 * Send welcome notification to new user
 */
export const sendWelcomeNotification = async (userId, userName) => {
  return sendNotificationToUser(userId, {
    title: 'Welcome to KalaSetu! 🎨',
    message: `Hi ${userName}, welcome to the artisan community!`,
    url: '/dashboard',
    data: { type: 'welcome' },
  });
};

/**
 * Send order notification
 */
export const sendOrderNotification = async (userId, orderId, status) => {
  const messages = {
    pending: 'Your order has been received',
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  return sendNotificationToUser(userId, {
    title: 'Order Update',
    message: messages[status] || 'Order status updated',
    url: `/orders/${orderId}`,
    data: { type: 'order', orderId, status },
  });
};

/**
 * Send message notification
 */
export const sendMessageNotification = async (userId, senderName, message) => {
  return sendNotificationToUser(userId, {
    title: `New message from ${senderName}`,
    message: message.length > 50 ? message.substring(0, 50) + '...' : message,
    url: '/messages',
    data: { type: 'message', senderName },
  });
};

/**
 * Send review notification to artisan
 */
export const sendReviewNotification = async (artisanId, reviewerName, rating) => {
  return sendNotificationToUser(artisanId, {
    title: 'New Review Received ⭐',
    message: `${reviewerName} left you a ${rating}-star review`,
    url: '/reviews',
    data: { type: 'review', rating },
  });
};

/**
 * Send profile view notification
 */
export const sendProfileViewNotification = async (artisanId, viewCount) => {
  return sendNotificationToUser(artisanId, {
    title: 'Profile Activity 👀',
    message: `Your profile has been viewed ${viewCount} times today`,
    url: '/profile',
    data: { type: 'profile_view', viewCount },
  });
};
