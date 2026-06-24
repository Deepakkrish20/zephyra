import api from './api';

export const deliveryApi = {
  getAvailableJobs: async () => {
    // const response = await api.get('/delivery/available');
    // return response.data;
    return [];
  },

  acceptJob: async (orderId) => {
    // const response = await api.post(`/delivery/accept/${orderId}`);
    // return response.data;
    return {};
  },

  updateDeliveryStatus: async (orderId, status) => {
    // const response = await api.post(`/delivery/status/${orderId}`, { status });
    // return response.data;
    return {};
  }
};

export default deliveryApi;
