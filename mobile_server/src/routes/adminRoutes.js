import express from 'express';
import {
  getDashboardStats,
  createDeliveryAgent,
  getDeliveryAgents,
  getCustomers,
  getOrders,
  approveOrder,
  rejectOrder,
  createProduct,
  updateProduct,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Require both authentication and admin authorization for all routes below
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// User listings & creations
router.get('/customers', getCustomers);
router.get('/delivery-agents', getDeliveryAgents);
router.post('/delivery-agents', createDeliveryAgent);

// Order queue
router.get('/orders', getOrders);
router.put('/orders/:id/approve', approveOrder);
router.put('/orders/:id/reject', rejectOrder);

// Catalog CRUD options
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);

export default router;
