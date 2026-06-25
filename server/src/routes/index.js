import { Router } from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import orderRoutes from './orderRoutes.js';
import adminOrderRoutes from './adminOrderRoutes.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/admin', protect, restrictTo('admin'), adminRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/orders', protect, restrictTo('admin'), adminOrderRoutes);
router.use('/delivery', (req, res) => res.json({ msg: 'Agent dispatches routes placeholder' }));
router.use('/tracking', (req, res) => res.json({ msg: 'Live coordinates routes placeholder' }));

export default router;
