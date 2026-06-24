import api from '@/services/api';

export const adminOrderService = {
  /**
   * Fetch all orders for admin with optional filters (page, limit, status, search)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The paginated orders list and metadata.
   */
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      return response.data;
    } catch (error) {
      console.error('[adminOrderService] Error getting orders:', error);
      throw error;
    }
  },

  /**
   * Get complete details of a specific order
   * @param {string} id - Order ObjectID
   * @returns {Promise<Object>} Order details object.
   */
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[adminOrderService] Error getting order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Approve a pending order (status pending_approval -> approved)
   * @param {string} id - Order ObjectID
   * @returns {Promise<Object>} The updated order object.
   */
  approveOrder: async (id) => {
    try {
      const response = await api.put(`/admin/orders/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error(`[adminOrderService] Error approving order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reject a pending order (status pending_approval -> rejected)
   * @param {string} id - Order ObjectID
   * @returns {Promise<Object>} The updated order object.
   */
  rejectOrder: async (id) => {
    try {
      const response = await api.put(`/admin/orders/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error(`[adminOrderService] Error rejecting order ${id}:`, error);
      throw error;
    }
  },
};

export default adminOrderService;
