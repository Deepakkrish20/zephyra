import { create } from 'zustand';
import adminOrderService from '../services/adminOrderService';

export const useAdminOrderStore = create((set, get) => ({
  // State
  orders: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  },
  selectedOrder: null,
  loading: false,
  error: null,

  // Actions
  getOrders: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await adminOrderService.getOrders(filters);
      set({
        orders: data.orders || [],
        pagination: data.pagination || { total: 0, page: 1, limit: 10, pages: 1 },
        loading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch admin orders',
        loading: false,
      });
    }
  },

  getOrderById: async (id) => {
    set({ loading: true, error: null, selectedOrder: null });
    try {
      const order = await adminOrderService.getOrderById(id);
      set({ selectedOrder: order, loading: false });
      return order;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch order details',
        loading: false,
      });
    }
  },

  approveOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const updatedOrder = await adminOrderService.approveOrder(id);
      set((state) => {
        const updatedOrders = state.orders.map((o) =>
          o._id === id ? { ...o, status: 'approved' } : o
        );
        const updatedSelected = state.selectedOrder?._id === id
          ? { ...state.selectedOrder, status: 'approved' }
          : state.selectedOrder;
        return {
          orders: updatedOrders,
          selectedOrder: updatedSelected,
          loading: false,
        };
      });
      return updatedOrder;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to approve order';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  rejectOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const updatedOrder = await adminOrderService.rejectOrder(id);
      set((state) => {
        const updatedOrders = state.orders.map((o) =>
          o._id === id ? { ...o, status: 'rejected' } : o
        );
        const updatedSelected = state.selectedOrder?._id === id
          ? { ...state.selectedOrder, status: 'rejected' }
          : state.selectedOrder;
        return {
          orders: updatedOrders,
          selectedOrder: updatedSelected,
          loading: false,
        };
      });
      return updatedOrder;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to reject order';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },
}));

export default useAdminOrderStore;
