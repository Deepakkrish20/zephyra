import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import protect from '../middlewares/authMiddleware.js';

const router = Router();

// @route   GET /api/checkout/summary
// @desc    Calculate checkout summary
// @access  Private
router.get('/summary', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    let cart = await Cart.findOne({ customerId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.json({
        items: [],
        totalAmount: 0,
        totalQuantity: 0,
      });
    }

    // Clean up items if product is deleted or unpublished
    let updatedItems = [];
    let isModified = false;

    for (const item of cart.items) {
      if (item.productId && item.productId.status === 'published') {
        updatedItems.push(item);
      } else {
        isModified = true;
      }
    }

    if (isModified) {
      cart.items = updatedItems;
      await cart.save();
      cart = await Cart.findOne({ customerId }).populate('items.productId');
    }

    let totalQuantity = 0;
    let totalAmount = 0;

    const itemsSummary = cart.items.map((item) => {
      const qty = item.quantity;
      const price = item.productId.price || 0;
      const subtotal = price * qty;

      totalQuantity += qty;
      totalAmount += subtotal;

      return {
        product: {
          _id: item.productId._id,
          name: item.productId.name,
          price,
          imageUrl: item.productId.imageUrl,
          category: item.productId.category,
        },
        quantity: qty,
        subtotal: parseFloat(subtotal.toFixed(2)),
      };
    });

    res.json({
      items: itemsSummary,
      totalQuantity,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/checkout/validate
// @desc    Validate checkout stock and cart integrity
// @access  Private
router.post('/validate', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const cart = await Cart.findOne({ customerId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

    const errors = [];

    for (const item of cart.items) {
      // 1. Verify product still exists in DB
      if (!item.productId) {
        errors.push('One of the products in your cart is no longer available.');
        continue;
      }

      const product = await Product.findById(item.productId._id);
      if (!product) {
        errors.push(`Product "${item.productId.name || 'Unknown'}" no longer exists.`);
        continue;
      }

      // 2. Verify product is published
      if (product.status !== 'published') {
        errors.push(`Product "${product.name}" is no longer available for purchase.`);
        continue;
      }

      // 3. Verify stock is sufficient
      if (product.stock < item.quantity) {
        errors.push(
          `Insufficient stock for "${product.name}". Only ${product.stock} units available, but you have ${item.quantity} in your cart.`
        );
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Checkout validation failed.',
        errors,
      });
    }

    res.json({
      success: true,
      message: 'Checkout validation passed successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
