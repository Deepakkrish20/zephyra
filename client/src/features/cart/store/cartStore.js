import { create } from 'zustand';
import cartService from '../services/cartService';

export const useCartStore = create((set, get) => ({
  // State
  cartItems: [],
  totalItems: 0,
  totalQuantity: 0,
  totalPrice: 0,
  itemCount: 0, // For backward compatibility with PublicLayout header badge
  loading: false,
  error: null,

  // Actions
  getCart: async () => {
    set({ loading: true, error: null });
    try {
      const data = await cartService.getCart();
      set({
        cartItems: data.items,
        totalItems: data.totalItems,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
        itemCount: data.totalQuantity,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch cart',
        loading: false,
      });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      // If productId was passed as an object (e.g. product), extract _id
      const id = typeof productId === 'object' ? productId._id : productId;
      const data = await cartService.addToCart(id, quantity);
      set({
        cartItems: data.items,
        totalItems: data.totalItems,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
        itemCount: data.totalQuantity,
        loading: false,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add item to cart';
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  updateQuantity: async (productId, quantity) => {
    set({ loading: true, error: null });
    try {
      const data = await cartService.updateQuantity(productId, quantity);
      set({
        cartItems: data.items,
        totalItems: data.totalItems,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
        itemCount: data.totalQuantity,
        loading: false,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update quantity';
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  removeFromCart: async (productId) => {
    set({ loading: true, error: null });
    try {
      const data = await cartService.removeFromCart(productId);
      set({
        cartItems: data.items,
        totalItems: data.totalItems,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
        itemCount: data.totalQuantity,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to remove item',
        loading: false,
      });
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      const data = await cartService.clearCart();
      set({
        cartItems: data.items,
        totalItems: data.totalItems,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
        itemCount: data.totalQuantity,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to clear cart',
        loading: false,
      });
    }
  },
}));

export default useCartStore;
