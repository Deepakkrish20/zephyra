import { Router } from 'express';
import protect from '../middlewares/authMiddleware.js';
import Tracking from '../models/Tracking.js';
import Order from '../models/Order.js';

const router = Router();

// @route   GET /api/tracking/active-order
// @desc    Get the most recent active order's ID for tracking
// @access  Private
router.get('/active-order', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Find the most recent order that is not delivered or rejected
    const activeOrder = await Order.findOne({
      customerId: userId,
      status: { $in: ['approved', 'accepted', 'picked_up', 'out_for_delivery'] },
    }).sort({ createdAt: -1 });

    if (!activeOrder) {
      return res.json({ success: true, orderId: null });
    }

    res.json({ success: true, orderId: activeOrder._id });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tracking/:orderId
// @desc    Get tracking details for a specific order
// @access  Private
router.get('/:orderId', protect, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access control check: only assigned agent, ordering customer, or admin can access
    if (
      userRole !== 'admin' &&
      order.customerId !== userId &&
      (!order.deliveryAgent || order.deliveryAgent.toString() !== userId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Unauthorized access to this order\'s tracking logs.',
      });
    }

    let tracking = await Tracking.findOne({ order: orderId });
    if (!tracking) {
      return res.json({
        success: true,
        tracking: {
          order: orderId,
          locationLog: [],
          status: 'inactive',
        },
      });
    }

    res.json({
      success: true,
      tracking,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
