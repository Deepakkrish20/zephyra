// Removed unused import api

export const trackingApi = {
  getLiveRoute: async (_orderId) => {
    // const response = await api.get(`/tracking/${orderId}/route`);
    // return response.data;
    return {};
  },

  updateAgentCoordinates: async (_orderId, _coords) => {
    // const response = await api.post(`/tracking/${orderId}/coordinates`, coords);
    // return response.data;
    return {};
  }
};

export default trackingApi;
