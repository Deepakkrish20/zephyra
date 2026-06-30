import Notification from '../models/Notification.js';

export const createNotification = async (recipientId, message, type) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      message,
      type,
      isRead: false,
    });
    console.log(`[Mobile Notification] Created for user ${recipientId}: "${message}"`);
    return notification;
  } catch (error) {
    console.error('[Mobile Notification] Error creating notification:', error.message);
    throw error;
  }
};

export default createNotification;
