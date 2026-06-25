import api from './api';

export const adminApi = {
  createProduct: async (productData) => {
    // const response = await api.post('/admin/products', productData);
    // return response.data;
    return {};
  },

  updateProduct: async (id, productData) => {
    // const response = await api.put(`/admin/products/${id}`, productData);
    // return response.data;
    return {};
  },

  deleteProduct: async (id) => {
    // const response = await api.delete(`/admin/products/${id}`);
    // return response.data;
    return {};
  },

  approveOrder: async (orderId) => {
    // const response = await api.post(`/admin/orders/${orderId}/approve`);
    // return response.data;
    return {};
  },

  createDeliveryAgent: async (agentData) => {
    const response = await api.post('/admin/delivery-agents', agentData);
    return response.data;
  }
};

export default adminApi;
