import { Router } from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import orderRoutes from './orderRoutes.js';
import adminOrderRoutes from './adminOrderRoutes.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

import deliveryRoutes from './deliveryRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import trackingRoutes from './trackingRoutes.js';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/admin', protect, restrictTo('admin'), adminRoutes);
router.use('/admin/products', protect, restrictTo('admin'), productRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/orders', protect, restrictTo('admin'), adminOrderRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/notifications', protect, notificationRoutes);
router.use('/tracking', trackingRoutes);

export default router;
