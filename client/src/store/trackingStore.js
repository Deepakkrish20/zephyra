import { create } from 'zustand';

export const useTrackingStore = create((set) => ({
  agentLocation: null, // { lat: number, lng: number, timestamp: number }
  orderRoute: [], // Array of { lat, lng }
  isTracking: false,
  deliveryStatus: null, // 'pending' | 'assigned' | 'in-transit' | 'delivered'
  error: null,

  // Action placeholders
  startTracking: (_orderId) => {
    set({ isTracking: true });
  },

  stopTracking: () => {
    set({ isTracking: false, agentLocation: null });
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
