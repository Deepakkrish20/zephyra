import { Router } from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import protect from '../middlewares/authMiddleware.js';
import { createNotification } from '../utils/notificationUtil.js';

const router = Router();

// Helper to generate a unique order number
const generateOrderNumber = async () => {
  let isUnique = false;
  let orderNo = '';

  while (!isUnique) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    orderNo = `ZEP-${randomSuffix}`;

    const existingOrder = await Order.findOne({ orderNumber: orderNo });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return orderNo;
};

// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ customerId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Cannot place an order.' });
    }

    // 1. Backend Validations
    const errors = [];
    const validatedItems = [];

    for (const item of cart.items) {
      if (!item.productId) {
        errors.push('One of the products in your cart is no longer available.');
        continue;
      }

      const product = await Product.findById(item.productId._id);
      if (!product) {
        errors.push(`Product "${item.productId.name || 'Unknown'}" no longer exists.`);
        continue;
      }

      if (product.status !== 'published') {
        errors.push(`Product "${product.name}" is no longer available.`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Insufficient stock for "${product.name}". Only ${product.stock} units available, but you have ${item.quantity} in your cart.`
        );
        continue;
      }

      const itemSubtotal = parseFloat((product.price * item.quantity).toFixed(2));
      validatedItems.push({
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Order validation failed.',
        errors,
      });
    }

    // Calculate dynamic grand total
    const totalAmount = validatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    // 2. Perform Stock Reduction atomically
    for (const item of validatedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updatedProduct) {
        return res.status(400).json({
          message: `Stock reduction failed for "${item.productName}". The items may have been sold out.`,
        });
      }
    }

    // 3. Generate Unique Order Number
    const orderNumber = await generateOrderNumber();

    // 4. Create Order
    const order = await Order.create({
      customerId,
      orderNumber,
      items: validatedItems,
      shippingAddress,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: 'pending_approval',
    });

    // 5. Clear Cart items
    cart.items = [];
    await cart.save();

    // 6. Notify Admins
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification(
          admin._id,
          `New order placed: ${orderNumber} for $${order.totalAmount.toFixed(2)}.`,
          'order-created'
        );
      }
    } catch (notifyError) {
      console.error('[Notifications] Failed to notify admins of new order:', notifyError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders
// @desc    Get customer order history
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, customerId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

// @route   GET /api/orders/:id/status
// @desc    Get current order status
// @access  Private
router.get('/:id/status', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, customerId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

export default router;
