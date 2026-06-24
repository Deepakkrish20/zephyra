import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [], // Array of { id, message, type, isRead, timestamp }
  unreadCount: 0,

  // Action placeholders
  addNotification: (notification) => {
    // Add logic placeholder
  },

  markAsRead: (id) => {
    // Mark read logic placeholder
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  }
}));

export default useNotificationStore;
