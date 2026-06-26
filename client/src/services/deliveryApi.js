import api from './api';

export const deliveryApi = {
  getAvailableJobs: async () => {
    const response = await api.get('/delivery/available');
    return response.data;
  },

  acceptJob: async (orderId) => {
    const response = await api.post(`/delivery/accept/${orderId}`);
    return response.data;
  },

  getActiveJobs: async () => {
    const response = await api.get('/delivery/active');
    return response.data;
  },

  updateDeliveryStatus: async (orderId, status) => {
    const response = await api.post(`/delivery/status/${orderId}`, { status });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/delivery/stats');
    return response.data;
  }
};

export default deliveryApi;
