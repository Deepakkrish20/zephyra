import api from './api';

export const trackingApi = {
  getLiveRoute: async (orderId) => {
    // const response = await api.get(`/tracking/${orderId}/route`);
    // return response.data;
    return {};
  },

  updateAgentCoordinates: async (orderId, coords) => {
    // const response = await api.post(`/tracking/${orderId}/coordinates`, coords);
    // return response.data;
    return {};
  }
};

export default trackingApi;
