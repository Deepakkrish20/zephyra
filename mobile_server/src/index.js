import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import { updateLiveLocation } from './services/agentTrackingService.js';

dotenv.config();

// Connect Mongoose Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Mobile Server is running.' });
});

// Basic error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error('[Error Handler]', err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});


io.on('connection', (socket) => {
  console.log('Mobile client connected:', socket.id);

  // Join room for real-time order monitoring
  socket.on('join-order-room', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`[Mobile Sockets] Socket ${socket.id} joined room: order-${orderId}`);
  });

  // Handle live location reports
  socket.on('location-update', async (data) => {
    console.log(`[Mobile Sockets] Event location-update received:`, data);
    try {
      const { orderId, agentId, lat, lng, bearing } = data;
      
      // Update MongoDB log
      if (orderId && agentId) {
        await updateLiveLocation(orderId, agentId, { lat, lng });
      }

      // Broadcast coordinates to room
      io.to(`order-${orderId}`).emit('agent-gps-coordinates', {
        lat,
        lng,
        bearing,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`[Mobile Sockets] Location update error: ${error.message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Mobile client disconnected:', socket.id);
  });
});

const PORT = process.env.MOBILE_PORT || 5001;
server.listen(PORT, () => {
  console.log(`Mobile Server running on port ${PORT}`);
});
export { app, server, io };
