import { create } from 'zustand';
import socket from '@/services/socket';
import api from '@/services/api';

export const useTrackingStore = create((set) => ({
  agentLocation: null, // { lat: number, lng: number, timestamp: number }
  orderRoute: [], // Array of { lat, lng }
  isTracking: false,
  deliveryStatus: null, // 'pending' | 'assigned' | 'in-transit' | 'delivered'
  error: null,

  // Connects to Socket.io and pulls initial location history
  startTracking: async (orderId) => {
    if (!orderId) return;
    
    set({ isTracking: true, error: null });

    // 1. Fetch historical route coordinates from the backend database
    try {
      const response = await api.get(`/tracking/${orderId}`);
      if (response.data.success && response.data.tracking) {
        const { locationLog, status } = response.data.tracking;
        if (locationLog && locationLog.length > 0) {
          const formattedRoute = locationLog
            .filter(coord => !(coord.lat > 37.7 && coord.lat < 37.8 && coord.lng > -122.5 && coord.lng < -122.4))
            .map(coord => ({ lat: coord.lat, lng: coord.lng }));
          
          if (formattedRoute.length > 0) {
            set({
              orderRoute: formattedRoute,
              agentLocation: formattedRoute[formattedRoute.length - 1],
              deliveryStatus: status
            });
          }
        }
      }
    } catch (err) {
      console.error('[Tracking Store] Failed to load initial logs:', err);
      set({ error: 'Failed to retrieve initial route details.' });
    }

    // 2. Establish live WebSocket connection
    socket.connect();
    socket.emit('join-order-room', orderId);

    // 3. Register Socket events
    socket.on('agent-gps-coordinates', (data) => {
      const { lat, lng } = data;
      if (lat && lng) {
        set((state) => ({
          agentLocation: { lat, lng, timestamp: Date.now() },
          orderRoute: [...state.orderRoute, { lat, lng }]
        }));
      }
    });

    socket.on('status-update', (data) => {
      if (data.status) {
        set({ deliveryStatus: data.status });
      }
    });
  },

  // Disconnects websocket and resets state
  stopTracking: () => {
    socket.off('agent-gps-coordinates');
    socket.off('status-update');
    socket.disconnect();
    set({
      isTracking: false,
      agentLocation: null,
      orderRoute: [],
      deliveryStatus: null,
      error: null
    });
  },

  updateAgentLocation: (lat, lng) => {
    set({ agentLocation: { lat, lng, timestamp: Date.now() } });
  },

  setOrderRoute: (coordinates) => {
    set({ orderRoute: coordinates });
  },

  setDeliveryStatus: (status) => {
    set({ deliveryStatus: status });
  },
}));

export default useTrackingStore;
