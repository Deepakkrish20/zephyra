import Notification from '../models/Notification.js';
import { getIO } from '../sockets/socket.js';

/**
 * Creates a notification in the database and broadcasts it over Socket.io in real time.
 * @param {string} recipientId - Mongoose ID of the user receiving the notification.
 * @param {string} message - The text content of the notification.
 * @param {string} type - The category of notification (e.g., 'order-update', 'delivery-assignment').
 * @returns {Promise<Object>} The created notification object.
 */
export const createNotification = async (recipientId, message, type) => {
  try {
    // 1. Persist to MongoDB
    const notification = await Notification.create({
      recipient: recipientId,
      message,
      type,
      isRead: false,
    });

    // 2. Broadcast via Sockets if recipient has active connection
    try {
      const io = getIO();
      io.to(`user-${recipientId}`).emit('new-notification', notification);
      console.log(`[Notification Utility] Broadcasted to user-${recipientId}: "${message}"`);
    } catch (socketError) {
      console.warn(
        `[Notification Utility] Failed to emit socket event (Socket server might not be initialized):`,
        socketError.message
      );
    }

    return notification;
  } catch (error) {
    console.error('[Notification Utility] Error creating notification:', error.message);
    throw error;
  }
};

export default createNotification;
