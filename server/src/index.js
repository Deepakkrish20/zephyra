import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/index.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { initSocket } from './sockets/socket.js';

// Load environment variables
dotenv.config();

// Establish DB Connection
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Websocket Connections
initSocket(server);

// Middleware Configurations
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server API Routes
app.use('/api', router);

// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'zephyra-core-api',
  });
});

// Fallback Route (404)
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`ZEPHYRA SERVER INITIALIZED SUCCESSFULLY`);
  console.log(`Mode: Development`);
  console.log(`Port: ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`========================================`);
});

export default app;
