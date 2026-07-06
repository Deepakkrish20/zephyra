import { Router } from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import protect, { restrictTo } from '../middlewares/authMiddleware.js';
import { createNotification } from '../utils/notificationUtil.js';

const router = Router();

// @route   GET /api/delivery/available
// @desc    Get all available delivery jobs (status: 'approved', no deliveryAgent assigned)
// @access  Private (Delivery Agent Only)
router.get('/available', protect, restrictTo('delivery_agent'), async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: 'approved',
      $or: [{ deliveryAgent: { $exists: false } }, { deliveryAgent: null }],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
      data: {
        orders,
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/delivery/accept/:orderId
// @desc    Accept/claim a delivery job
// @access  Private (Delivery Agent Only)
router.post('/accept/:orderId', protect, restrictTo('delivery_agent'), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const agentId = req.user.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'approved' || order.deliveryAgent) {
      return res.status(400).json({ message: 'This order is no longer available for claim.' });
    }

    order.deliveryAgent = agentId;
    order.status = 'accepted';
    await order.save();

    // Notify Customer
    try {
      const agent = await User.findById(agentId).select('name');
      const agentName = agent ? agent.name : 'A courier';
      await createNotification(
        order.customerId,
        `${agentName} has accepted your order ${order.orderNumber}.`,
        'order-accepted'
      );
    } catch (notifyError) {
      console.error(
        '[Notifications] Failed to notify customer of courier assignment:',
        notifyError.message
      );
    }

    res.json({
      success: true,
      ...order.toObject(),
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

// @route   GET /api/delivery/active
// @desc    Get all active delivery contracts claimed by the logged-in agent
// @access  Private (Delivery Agent Only)
router.get('/active', protect, restrictTo('delivery_agent'), async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const orders = await Order.find({
      deliveryAgent: agentId,
      status: { $in: ['accepted', 'picked_up', 'out_for_delivery'] },
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      orders,
      data: {
        orders,
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/delivery/status/:orderId
// @desc    Update the delivery status of an order
// @access  Private (Delivery Agent Only)
router.post('/status/:orderId', protect, restrictTo('delivery_agent'), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const agentId = req.user.id;

    const validStatuses = ['accepted', 'picked_up', 'out_for_delivery', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid delivery status value.' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to the agent
    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId) {
      return res
        .status(403)
        .json({ message: 'Permission denied: This order is not assigned to you.' });
    }

    order.status = status;
    await order.save();

    // Notify Customer of status update
    try {
      let statusMsg = '';
      if (status === 'picked_up') {
        statusMsg = `Your order ${order.orderNumber} has been picked up from the store.`;
      } else if (status === 'out_for_delivery') {
        statusMsg = `Your order ${order.orderNumber} is out for delivery!`;
      } else if (status === 'delivered') {
        statusMsg = `Your order ${order.orderNumber} has been successfully delivered.`;
      } else if (status === 'accepted') {
        statusMsg = `Courier assigned to your order ${order.orderNumber}.`;
      }

      if (statusMsg) {
        await createNotification(order.customerId, statusMsg, `order-${status}`);
      }
    } catch (notifyError) {
      console.error(
        '[Notifications] Failed to notify customer of order status update:',
        notifyError.message
      );
    }

    res.json({
      success: true,
      ...order.toObject(),
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

// @route   GET /api/delivery/stats
// @desc    Get dashboard statistics for the logged-in agent
// @access  Private (Delivery Agent Only)
router.get('/stats', protect, restrictTo('delivery_agent'), async (req, res, next) => {
  try {
    const agentId = req.user.id;

    // Find all completed orders
    const completedOrders = await Order.find({
      deliveryAgent: agentId,
      status: 'delivered',
    });

    let completedOrdersCount = completedOrders.length;
    let totalEarnings = 0;
    let totalTips = 0;
    let ratedCount = 0;
    let ratingSum = 0;

    completedOrders.forEach((order) => {
      // Payout Rate: $8.50 base + 5% of order value
      const basePayout = 8.5 + order.totalAmount * 0.05;
      const tip = order.deliveryTip || 0;
      totalEarnings += basePayout + tip;
      totalTips += tip;

      if (order.deliveryRating !== undefined && order.deliveryRating !== null) {
        ratingSum += order.deliveryRating;
        ratedCount += 1;
      }
    });

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(2)) : 5.0;

    res.json({
      completedOrdersCount,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalTips: parseFloat(totalTips.toFixed(2)),
      averageRating,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
