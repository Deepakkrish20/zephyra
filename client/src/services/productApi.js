// Removed unused import api

export const productApi = {
  getProducts: async () => {
    // const response = await api.get('/products');
    // return response.data;
    return [];
  },

  getProduct: async (_id) => {
    // const response = await api.get(`/products/${id}`);
    // return response.data;
    return {};
  }
};

export default productApi;
