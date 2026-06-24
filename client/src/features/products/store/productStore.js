import { create } from 'zustand';
import productService from '../services/productService';

export const useProductStore = create((set, get) => ({
  // State
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'All',
  showAll: false, // Set to true to include draft/unpublished products (for Admin dashboard)
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 6,
  },

  // Actions
  getProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { searchTerm, selectedCategory, pagination, showAll } = get();
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      if (searchTerm.trim() !== '') {
        params.search = searchTerm;
      }

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (showAll) {
        params.all = 'true';
      }

      const response = await productService.fetchProducts(params);

      set({
        products: response.products,
        pagination: {
          ...pagination,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalProducts: response.totalProducts,
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to load products',
        loading: false,
        products: [],
      });
    }
  },

  getProductById: async (id, all = false) => {
    set({ loading: true, error: null, selectedProduct: null });
    try {
      const product = await productService.fetchProductById(id, all);
      set({ selectedProduct: product, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to load product details',
        loading: false,
        selectedProduct: null,
      });
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await productService.createProduct(productData);
      set({ loading: false });
      // Re-fetch products to update the list
      await get().getProducts();
      return newProduct;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create product';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await productService.updateProduct(id, productData);
      set({ loading: false });
      // Re-fetch products to update the list
      await get().getProducts();
      return updatedProduct;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update product';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await productService.deleteProduct(id);
      set({ loading: false });
      // Re-fetch products to update the list
      await get().getProducts();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete product';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  setSearchTerm: (term) => {
    set((state) => ({
      searchTerm: term,
      pagination: { ...state.pagination, currentPage: 1 },
    }));
    get().getProducts();
  },

  setCategory: (category) => {
    set((state) => ({
      selectedCategory: category,
      pagination: { ...state.pagination, currentPage: 1 },
    }));
    get().getProducts();
  },

  setShowAll: (showAll) => {
    set((state) => ({
      showAll,
      pagination: { ...state.pagination, currentPage: 1, limit: showAll ? 50 : 6 }, // Larger limit for admin table list
    }));
    get().getProducts();
  },

  setCurrentPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, currentPage: page },
    }));
    get().getProducts();
  },

  clearFilters: () => {
    set((state) => ({
      searchTerm: '',
      selectedCategory: 'All',
      pagination: { ...state.pagination, currentPage: 1 },
    }));
    get().getProducts();
  },
}));

export default useProductStore;
