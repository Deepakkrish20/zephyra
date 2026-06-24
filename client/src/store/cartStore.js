import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  totalAmount: 0,
  itemCount: 0,

  // Action placeholders
  addToCart: (product, quantity = 1) => {
    // Add logic placeholder
  },

  removeFromCart: (productId) => {
    // Remove logic placeholder
  },

  updateQuantity: (productId, quantity) => {
    // Update logic placeholder
  },

  clearCart: () => {
    set({ cartItems: [], totalAmount: 0, itemCount: 0 });
  }
}));

export default useCartStore;
