import api from '@/services/api';

export const orderService = {
  /**
   * Creates a new order using the validated shipping address.
   * @param {Object} shippingAddress - Form address fields.
   * @returns {Promise<Object>} The created order response.
   */
  createOrder: async (shippingAddress) => {
    try {
      const response = await api.post('/orders', { shippingAddress });
      return response.data;
    } catch (error) {
      console.error('[orderService] Error creating order:', error);
      throw error;
    }
  },

  /**
   * Fetches customer's order history.
   * @returns {Promise<Array>} List of orders.
   */
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data || [];
    } catch (error) {
      console.error('[orderService] Error getting orders:', error);
      throw error;
    }
  },

  /**
   * Fetches details of a specific order by ID.
   * @param {string} id - Order ObjectId.
   * @returns {Promise<Object>} The order details.
   */
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[orderService] Error getting order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetches status of an order.
   * @param {string} id - Order ObjectId.
   * @returns {Promise<Object>} Order status details.
   */
  getOrderStatus: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/status`);
      return response.data;
    } catch (error) {
      console.error(`[orderService] Error getting order status for ${id}:`, error);
      throw error;
    }
  },
};

export default orderService;
