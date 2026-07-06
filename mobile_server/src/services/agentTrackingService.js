import Tracking from '../models/Tracking.js';

/**
 * Updates the agent coordinates inside the Tracking database log
 * @param {string} orderId
 * @param {string} agentId
 * @param {object} coords { lat, lng }
 */
export const updateLiveLocation = async (orderId, agentId, coords) => {
  const updatedTracking = await Tracking.findOneAndUpdate(
    { order: orderId, agent: agentId },
    { 
      $push: { 
        locationLog: { 
          lat: coords.lat, 
          lng: coords.lng, 
          timestamp: new Date() 
        } 
      },
      $set: { status: 'active' }
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    orderId,
    agentId,
    coords,
    timestamp: new Date(),
    tracking: updatedTracking
  };
};
