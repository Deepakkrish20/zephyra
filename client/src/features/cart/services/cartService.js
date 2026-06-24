import api from '@/services/api';

export const cartService = {
  /**
   * Fetches the customer's populated cart from backend.
   * @returns {Promise<Object>} The populated cart response.
   */
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('[cartService] Error getting cart:', error);
      throw error;
    }
  },

  /**
   * Adds a product to the cart with specified quantity.
   * @param {string} productId - Product ObjectId.
   * @param {number} [quantity=1] - Quantity to add.
   * @returns {Promise<Object>} The updated populated cart response.
   */
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('[cartService] Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Updates quantity of an item in the cart.
   * @param {string} productId - Product ObjectId.
   * @param {number} quantity - New quantity.
   * @returns {Promise<Object>} The updated populated cart response.
   */
  updateQuantity: async (productId, quantity) => {
    try {
      const response = await api.put('/cart/update', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('[cartService] Error updating quantity:', error);
      throw error;
    }
  },

  /**
   * Removes an item from the cart.
   * @param {string} productId - Product ObjectId.
   * @returns {Promise<Object>} The updated populated cart response.
   */
  removeFromCart: async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      console.error('[cartService] Error removing from cart:', error);
      throw error;
    }
  },

  /**
   * Clears the entire cart.
   * @returns {Promise<Object>} The updated empty cart response.
   */
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('[cartService] Error clearing cart:', error);
      throw error;
    }
  },
};

export default cartService;
