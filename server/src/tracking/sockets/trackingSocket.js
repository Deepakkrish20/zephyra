import { SOCKET_EVENTS } from '../../constants/socketEvents.js';
import { updateLiveLocation } from '../services/agentTrackingService.js';

export const registerTrackingSocket = (socket, io) => {
  console.log(`[Tracking Socket] Registered for connection: ${socket.id}`);

  // Handle location broadcasts
  socket.on(SOCKET_EVENTS.LOCATION_UPDATE, async (data) => {
    try {
      const { orderId, agentId, lat, lng } = data;
      
      // Execute database update or processing logic
      await updateLiveLocation(orderId, agentId, { lat, lng });

      // Notify customer listening room
      io.to(`order-${orderId}`).emit('agent-gps-coordinates', {
        lat,
        lng,
        timestamp: Date.now()
      });
      
      console.log(`[Tracking Socket] Broadcast coordinate update: order-${orderId}`);
    } catch (error) {
      console.error(`[Tracking Socket] Location update parsing error: ${error.message}`);
    }
  });
};

export default registerTrackingSocket;
