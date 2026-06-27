import { create } from 'zustand';
import orderService from '../services/orderService';

export const useOrderStore = create((set) => ({
  // State
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,

  // Actions
  createOrder: async (shippingAddress) => {
    set({ loading: true, error: null });
    try {
      const order = await orderService.createOrder(shippingAddress);
      set((state) => ({
        orders: [order, ...state.orders],
        loading: false,
      }));
      return order;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to place order';
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  getOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await orderService.getOrders();
      set({ orders, loading: false });
      return orders;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to load order history',
        loading: false,
      });
    }
  },

  getOrderById: async (id) => {
    set({ loading: true, error: null, selectedOrder: null });
    try {
      const order = await orderService.getOrderById(id);
      set({ selectedOrder: order, loading: false });
      return order;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to load order details',
        loading: false,
      });
    }
  },

  getOrderStatus: async (id) => {
    set({ loading: true, error: null });
    try {
      const statusData = await orderService.getOrderStatus(id);
      set({ loading: false });
      return statusData;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to check status',
        loading: false,
      });
    }
  },
}));

export default useOrderStore;
