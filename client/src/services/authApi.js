import api from './api';

export const authApi = {
  login: async (credentials) => {
    // const response = await api.post('/auth/login', credentials);
    // return response.data;
    return { mock: true, user: { name: 'Jane' } };
  },
  
  register: async (userData) => {
    // const response = await api.post('/auth/register', userData);
    // return response.data;
    return { mock: true };
  },

  getCurrentUser: async () => {
    // const response = await api.get('/auth/me');
    // return response.data;
    return { mock: true };
  }
};

export default authApi;
