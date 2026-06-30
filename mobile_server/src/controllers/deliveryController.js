import Order from '../models/Order.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationUtil.js';

/**
 * Get available delivery jobs (status: 'approved')
 */
export const getAvailableJobs = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: 'approved',
      $or: [{ deliveryAgent: { $exists: false } }, { deliveryAgent: null }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Claim/accept a delivery job
 */
export const acceptJob = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const agentId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'approved' || order.deliveryAgent) {
      return res.status(400).json({ success: false, message: 'This order is no longer available.' });
    }

    order.deliveryAgent = agentId;
    order.status = 'accepted';
    await order.save();

    // Create notifications
    try {
      const agent = await User.findById(agentId).select('name');
      const agentName = agent ? agent.name : 'A courier';
      await createNotification(
        order.customerId,
        `${agentName} has accepted your order ${order.orderNumber}.`,
        'order-accepted'
      );
    } catch (e) {
      //
    }

    return res.status(200).json({
      success: true,
      message: 'Job claimed successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active contracts claimed by logged-in agent
 */
export const getActiveJobs = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const orders = await Order.find({
      deliveryAgent: agentId,
      status: { $in: ['accepted', 'picked_up', 'out_for_delivery'] },
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update delivery status of order
 */
export const updateJobStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const agentId = req.user.id;

    const validStatuses = ['accepted', 'picked_up', 'out_for_delivery', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery status value.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId) {
      return res.status(403).json({ success: false, message: 'Permission denied. Not assigned to you.' });
    }

    order.status = status;
    await order.save();

    // Notify Customer
    try {
      let statusMsg = '';
      if (status === 'picked_up') {
        statusMsg = `Your order ${order.orderNumber} has been picked up from the store.`;
      } else if (status === 'out_for_delivery') {
        statusMsg = `Your order ${order.orderNumber} is out for delivery!`;
      } else if (status === 'delivered') {
        statusMsg = `Your order ${order.orderNumber} has been successfully delivered.`;
      }

      if (statusMsg) {
        await createNotification(order.customerId, statusMsg, `order-${status}`);
      }
    } catch (e) {
      //
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get delivery statistics
 */
export const getAgentStats = async (req, res, next) => {
  try {
    const agentId = req.user.id;

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

    return res.status(200).json({
      success: true,
      data: {
        completedOrdersCount,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalTips: parseFloat(totalTips.toFixed(2)),
        averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};
