import api from './api';

export const deliveryApi = {
  getAvailableJobs: async () => {
    const response = await api.get('/delivery/available');
    return Array.isArray(response.data) ? response.data : (response.data.orders || response.data.data?.orders || []);
  },

  acceptJob: async (orderId) => {
    const response = await api.post(`/delivery/accept/${orderId}`);
    return response.data;
  },

  getActiveJobs: async () => {
    const response = await api.get('/delivery/active');
    return Array.isArray(response.data) ? response.data : (response.data.orders || response.data.data?.orders || []);
  },

  updateDeliveryStatus: async (orderId, status) => {
    const response = await api.post(`/delivery/status/${orderId}`, { status });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/delivery/stats');
    return response.data;
  },
};

export default deliveryApi;
