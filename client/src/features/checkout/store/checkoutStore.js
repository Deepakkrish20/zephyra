import { create } from 'zustand';
import checkoutService from '../services/checkoutService';

export const useCheckoutStore = create((set) => ({
  // State
  shippingInfo: null,
  checkoutSummary: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  },
  totalAmount: 0,
  loading: false,
  error: null,

  // Actions
  getCheckoutSummary: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await checkoutService.getCheckoutSummary();
      set({
        checkoutSummary: summary,
        totalAmount: summary.totalAmount,
        loading: false,
      });
      return summary;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to retrieve checkout summary',
        loading: false,
      });
    }
  },

  validateCheckout: async (shippingData = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await checkoutService.validateCheckout(shippingData);
      set({ loading: false });
      return result;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Checkout validation failed';
      const errorsList = error.response?.data?.errors || [];
      
      set({
        error: errorMsg,
        loading: false,
      });
      
      const fullError = new Error(errorMsg);
      fullError.errors = errorsList;
      throw fullError;
    }
  },

  saveShippingInfo: (info) => {
    set({ shippingInfo: info });
  },

  clearCheckout: () => {
    set({
      shippingInfo: null,
      checkoutSummary: {
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
      },
      totalAmount: 0,
      error: null,
    });
  },
}));

export default useCheckoutStore;
