import api from '@/services/api';

export const productService = {
  /**
   * Fetches products from the backend API.
   * Supports filtering by search term, category, and pagination.
   * Supports fetching draft products for admins if params.all = true.
   * @param {Object} params - Query parameters.
   * @param {string} [params.search] - Search query.
   * @param {string} [params.category] - Category filter.
   * @param {number} [params.page] - Page number.
   * @param {number} [params.limit] - Limit of items per page.
   * @param {boolean} [params.all] - Whether to fetch all products (including drafts).
   * @returns {Promise<Object>} The normalized API response.
   */
  fetchProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return {
        products: response.data?.products || [],
        currentPage: response.data?.currentPage || 1,
        totalPages: response.data?.totalPages || 1,
        totalProducts: response.data?.totalProducts || 0,
      };
    } catch (error) {
      console.error('[productService] Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Fetches details of a single product by ID.
   * @param {string} id - The product ID.
   * @param {boolean} [all=false] - Whether to bypass published filter.
   * @returns {Promise<Object>} The normalized product details.
   */
  fetchProductById: async (id, all = false) => {
    try {
      const params = all ? { all: 'true' } : {};
      const response = await api.get(`/products/${id}`, { params });
      return response.data || {};
    } catch (error) {
      console.error(`[productService] Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new product catalog listing.
   * @param {Object} productData - New product details.
   * @returns {Promise<Object>} The newly created product.
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('[productService] Error creating product:', error);
      throw error;
    }
  },

  /**
   * Updates an existing product catalog listing.
   * @param {string} id - Product ObjectId.
   * @param {Object} productData - Fields to update.
   * @returns {Promise<Object>} The updated product.
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`[productService] Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a product catalog listing.
   * @param {string} id - Product ObjectId.
   * @returns {Promise<Object>} The deletion status message.
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[productService] Error deleting product ${id}:`, error);
      throw error;
    }
  },
};

export default productService;
