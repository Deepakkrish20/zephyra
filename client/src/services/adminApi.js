import api from './api';

export const adminApi = {
  createProduct: async () => {
    // const response = await api.post('/admin/products', ...);
    // return response.data;
    return {};
  },

  updateProduct: async () => {
    // const response = await api.put(`/admin/products/...`, ...);
    // return response.data;
    return {};
  },

  deleteProduct: async () => {
    // const response = await api.delete(`/admin/products/...`);
    // return response.data;
    return {};
  },

  approveOrder: async () => {
    // const response = await api.post(`/admin/orders/.../approve`);
    // return response.data;
    return {};
  },

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
  }
};

export default adminApi;
