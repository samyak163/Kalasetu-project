import Notification from '../models/notificationModel.js';

export const createNotification = async ({ ownerId, ownerType, title = '', text, url = '' }) => {
  if (!ownerId || !ownerType || !text) return null;

  try {
    const notification = await Notification.create({
      ownerId,
      ownerType,
      title,
      text,
      url,
    });
    return notification;
  } catch (error) {
    console.error('Notification create error:', error.message);
    return null;
  }
};

export const createNotifications = async (ownerId, ownerType, items = []) => {
  if (!ownerId || !ownerType || !Array.isArray(items) || items.length === 0) return [];

  const payload = items
    .filter((item) => item && item.text)
    .map((item) => ({
      ownerId,
      ownerType,
      title: item.title || '',
      text: item.text,
      url: item.url || '',
    }));

  if (payload.length === 0) return [];

  try {
    const created = await Notification.insertMany(payload, { ordered: false });
    return created;
  } catch (error) {
    console.error('Notification bulk create error:', error.message);
    return [];
  }
};


