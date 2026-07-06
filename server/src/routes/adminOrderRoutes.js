import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationUtil.js';

const router = Router();

// @route   GET /api/admin/orders
// @desc    Get all orders with search, status filtering, and pagination
// @access  Private (Admin Only)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Status Filtering
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Search by Order Number
    if (req.query.search) {
      query.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    // Dynamically resolve customer name & email
    const ordersWithCustomer = await Promise.all(
      orders.map(async (order) => {
        let customer = { name: 'Guest User', email: 'guest@example.com' };

        if (order.customerId && mongoose.Types.ObjectId.isValid(order.customerId)) {
          const user = await User.findById(order.customerId).select('name email');
          if (user) {
            customer = { name: user.name, email: user.email };
          }
        } else if (order.customerId) {
          customer = {
            name: `Mock Customer (${order.customerId})`,
            email: `${order.customerId}@example.com`,
          };
        }

        return { ...order, customer };
      })
    );

    res.json({
      success: true,
      orders: ordersWithCustomer,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: {
        orders: ordersWithCustomer,
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get detailed order by ID
// @access  Private (Admin Only)
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let customer = { name: 'Guest User', email: 'guest@example.com' };

    if (order.customerId && mongoose.Types.ObjectId.isValid(order.customerId)) {
      const user = await User.findById(order.customerId).select('name email');
      if (user) {
        customer = { name: user.name, email: user.email };
      }
    } else if (order.customerId) {
      customer = {
        name: `Mock Customer (${order.customerId})`,
        email: `${order.customerId}@example.com`,
      };
    }

    res.json({ ...order, customer });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

// @route   PUT /api/admin/orders/:id/approve
// @desc    Approve a pending order
// @access  Private (Admin Only)
router.put('/:id/approve', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending_approval') {
      return res.status(400).json({
        message: `Invalid status transition. Cannot approve order in "${order.status}" status.`,
      });
    }

    order.status = 'approved';
    await order.save();

    // Notify Customer
    try {
      await createNotification(
        order.customerId,
        `Your order ${order.orderNumber} has been approved and is being prepared.`,
        'order-approved'
      );
    } catch (notifyError) {
      console.error(
        '[Notifications] Failed to notify customer of order approval:',
        notifyError.message
      );
    }

    res.json(order);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

// @route   PUT /api/admin/orders/:id/reject
// @desc    Reject a pending order
// @access  Private (Admin Only)
router.put('/:id/reject', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending_approval') {
      return res.status(400).json({
        message: `Invalid status transition. Cannot reject order in "${order.status}" status.`,
      });
    }

    order.status = 'rejected';
    await order.save();

    // Notify Customer
    try {
      await createNotification(
        order.customerId,
        `Your order ${order.orderNumber} has been rejected.`,
        'order-rejected'
      );
    } catch (notifyError) {
      console.error(
        '[Notifications] Failed to notify customer of order rejection:',
        notifyError.message
      );
    }

    res.json(order);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

export default router;
