// Removed unused import api

export const orderApi = {
  createOrder: async (_orderData) => {
    // const response = await api.post('/orders', orderData);
    // return response.data;
    return {};
  },

  getOrders: async () => {
    // const response = await api.get('/orders');
    // return response.data;
    return [];
  },

  getOrderById: async (_id) => {
    // const response = await api.get(`/orders/${id}`);
    // return response.data;
    return {};
  }
};

export default orderApi;
