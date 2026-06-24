/**
 * Updates the agent coordinates inside the Tracking database log
 * @param {string} orderId 
 * @param {string} agentId 
 * @param {object} coords { lat, lng }
 */
export const updateLiveLocation = async (orderId, agentId, coords) => {
  // Database update query placeholder:
  // await Tracking.findOneAndUpdate(
  //   { order: orderId, agent: agentId },
  //   { $push: { locationLog: { lat: coords.lat, lng: coords.lng } } },
  //   { upsert: true }
  // );
  
  return {
    success: true,
    orderId,
    agentId,
    coords,
    timestamp: new Date()
  };
};

/**
 * Calculates straight line distance (Haversine formula placeholder)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};
