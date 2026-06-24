import api from '@/services/api';

export const checkoutService = {
  /**
   * Fetches the checkout summary calculation from backend.
   * @returns {Promise<Object>} Checkout summary data.
   */
  getCheckoutSummary: async () => {
    try {
      const response = await api.get('/checkout/summary');
      return response.data;
    } catch (error) {
      console.error('[checkoutService] Error getting summary:', error);
      throw error;
    }
  },

  /**
   * Validates checkout inventory stock, product availability, and cart integrity.
   * @param {Object} [shippingData] - Address validation details.
   * @returns {Promise<Object>} Success or failure status.
   */
  validateCheckout: async (shippingData = {}) => {
    try {
      const response = await api.post('/checkout/validate', shippingData);
      return response.data;
    } catch (error) {
      console.error('[checkoutService] Error validating checkout:', error);
      throw error;
    }
  },
};

export default checkoutService;
