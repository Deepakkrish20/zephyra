import { create } from 'zustand';

export const useProductStore = create((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  // Action placeholders
  fetchProducts: async () => {
    set({ isLoading: true });
    // Fetch logic placeholder
    set({ isLoading: false });
  },

  fetchProductById: async (id) => {
    set({ isLoading: true });
    // Fetch details logic placeholder
    set({ isLoading: false });
  },

  createProduct: async (productData) => {
    set({ isLoading: true });
    // Create logic placeholder
    set({ isLoading: false });
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true });
    // Update logic placeholder
    set({ isLoading: false });
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    // Delete logic placeholder
    set({ isLoading: false });
  }
}));

export default useProductStore;
