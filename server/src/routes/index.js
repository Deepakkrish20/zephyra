import { Router } from 'express';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import orderRoutes from './orderRoutes.js';
import adminOrderRoutes from './adminOrderRoutes.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

// Route placeholders
router.use('/auth', (req, res) => res.json({ msg: 'Auth routes placeholder' }));
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/orders', protect, restrictTo('admin'), adminOrderRoutes);
router.use('/delivery', (req, res) => res.json({ msg: 'Agent dispatches routes placeholder' }));
router.use('/tracking', (req, res) => res.json({ msg: 'Live coordinates routes placeholder' }));

export default router;
