import api from './api';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify', { email, code });
    return response.data;
  },

  getAddresses: async () => {
    const response = await api.get('/auth/addresses');
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/auth/addresses', addressData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/auth/addresses/${addressId}`);
    return response.data;
  },
};

export default authApi;
