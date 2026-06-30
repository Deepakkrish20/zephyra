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
  socket.on('disconnect', () => {
    console.log('Mobile client disconnected:', socket.id);
  });
});

const PORT = process.env.MOBILE_PORT || 5001;
server.listen(PORT, () => {
  console.log(`Mobile Server running on port ${PORT}`);
});
export { app, server, io };
