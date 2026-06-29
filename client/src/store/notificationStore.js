import { create } from 'zustand';
import notificationApi from '../services/notificationApi';
import socket from '../services/socket';

// Synthesize a pleasant chime sound using browser Web Audio API
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Low pleasant chime tone (E.g. D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // High pleasant chime tone (E.g. A5, starting slightly later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch (error) {
    console.warn('Web Audio playback failed:', error);
  }
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isSocketConnected: false,

  // Connect socket and listen for notifications
  connectSocket: (user) => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-user-room', userId);
    set({ isSocketConnected: true });

    // Ensure we only have one listener active
    socket.off('new-notification');
    socket.on('new-notification', (notification) => {
      get().addNotification(notification);
    });

    console.log(`[Notification Store] Connected to user-${userId} socket room`);
  },

  // Disconnect socket listener
  disconnectSocket: () => {
    socket.off('new-notification');
    socket.disconnect();
    set({ isSocketConnected: false });
    console.log('[Notification Store] Disconnected socket');
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationApi.getNotifications();
      const unreadCount = data.filter((n) => !n.isRead).length;
      set({ notifications: data, unreadCount, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  addNotification: (notification) => {
    const exists = get().notifications.some((n) => n._id === notification._id);
    if (exists) return;

    set((state) => {
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { notifications, unreadCount };
    });

    // Play chime sound
    playNotificationSound();
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        return { notifications, unreadCount };
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export default useNotificationStore;
