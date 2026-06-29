import api from './api';

export const adminApi = {
  createDeliveryAgent: async (agentData) => {
    const response = await api.post('/admin/delivery-agents', agentData);
    return response.data;
  },

  getDeliveryAgents: async () => {
    const response = await api.get('/admin/delivery-agents');
    return response.data;
  },

  getCustomers: async () => {
    const response = await api.get('/admin/customers');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  sendVerificationReminder: async (id) => {
    const response = await api.post(`/admin/customers/${id}/send-reminder`);
    return response.data;
  },
};

export default adminApi;
