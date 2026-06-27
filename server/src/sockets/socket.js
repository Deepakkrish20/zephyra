import { Server } from 'socket.io';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  console.log('[Sockets] Socket.IO Server initialized.');

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`[Sockets] Client connected: ${socket.id}`);

    // Join room for real-time order monitoring
    socket.on('join-order-room', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`[Sockets] Socket ${socket.id} joined room: order-${orderId}`);
    });

    // Join room for targeting user-specific notifications
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`[Sockets] Socket ${socket.id} joined user room: user-${userId}`);
    });

    // Event Skeletons

    // Order Creation Dispatch
    socket.on(SOCKET_EVENTS.ORDER_CREATED, (data) => {
      console.log(`[Sockets] Event ${SOCKET_EVENTS.ORDER_CREATED} received:`, data);
      // Emit to Admin dashboard room
      io.to('admin-room').emit('admin-notification', {
        event: SOCKET_EVENTS.ORDER_CREATED,
        orderId: data.orderId,
      });
    });

    // Admin Approves Order
    socket.on(SOCKET_EVENTS.ORDER_APPROVED, (data) => {
      console.log(`[Sockets] Event ${SOCKET_EVENTS.ORDER_APPROVED} received:`, data);
      // Notify all available delivery agents
      io.to('delivery-agents-room').emit(SOCKET_EVENTS.DELIVERY_REQUEST, {
        orderId: data.orderId,
        pickupAddress: data.pickupAddress,
      });
    });

    // Delivery Agent Accepts Order
    socket.on(SOCKET_EVENTS.DELIVERY_ACCEPTED, (data) => {
      console.log(`[Sockets] Event ${SOCKET_EVENTS.DELIVERY_ACCEPTED} received:`, data);
      // Assign and notify order specific client room
      io.to(`order-${data.orderId}`).emit('status-update', {
        status: 'assigned',
        agentId: data.agentId,
      });
    });

    // GPS Location Update Broadcasts
    socket.on(SOCKET_EVENTS.LOCATION_UPDATE, (data) => {
      console.log(`[Sockets] Event ${SOCKET_EVENTS.LOCATION_UPDATE} received:`, data);
      // Broadcast to client tracking room
      socket.to(`order-${data.orderId}`).emit('agent-gps-coordinates', {
        lat: data.lat,
        lng: data.lng,
        bearing: data.bearing,
      });
    });

    // Final Delivery Confirmation
    socket.on(SOCKET_EVENTS.ORDER_DELIVERED, (data) => {
      console.log(`[Sockets] Event ${SOCKET_EVENTS.ORDER_DELIVERED} received:`, data);
      io.to(`order-${data.orderId}`).emit('status-update', {
        status: 'delivered',
      });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`[Sockets] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('[Sockets] Socket.io is not initialized!');
  }
  return io;
};
