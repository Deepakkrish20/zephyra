import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import protect from '../middlewares/authMiddleware.js';

const router = Router();

// Helper function to calculate cart totals and return populated cart
const getPopulatedCartResponse = async (customerId) => {
  let cart = await Cart.findOne({ customerId }).populate('items.productId');

  if (!cart) {
    cart = await Cart.create({ customerId, items: [] });
  }

  // Filter out any cart items where the product no longer exists or is not published
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
    // Re-populate after saving modifications
    cart = await Cart.findOne({ customerId }).populate('items.productId');
  }

  // Calculate totals using database product prices
  let totalItems = cart.items.length; // Number of unique items
  let totalQuantity = 0;
  let totalPrice = 0;

  const formattedItems = cart.items.map((item) => {
    const qty = item.quantity;
    const price = item.productId.price || 0;
    totalQuantity += qty;
    totalPrice += price * qty;

    return {
      product: item.productId,
      quantity: qty,
    };
  });

  return {
    _id: cart._id,
    customerId: cart.customerId,
    items: formattedItems,
    totalItems,
    totalQuantity,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
};

// @route   GET /api/cart
// @desc    Get customer cart
// @access  Private (protect middleware)
router.get('/', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const cartResponse = await getPopulatedCartResponse(customerId);
    res.json(cartResponse);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/cart/add
// @desc    Add product to cart
// @access  Private
router.post('/add', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const qtyToAdd = parseInt(quantity, 10);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    // 1. Verify product exists, is published, and has stock > 0
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'published') {
      return res.status(400).json({ message: 'Product is not available for purchase' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = await Cart.create({ customerId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIdx = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIdx > -1) {
      // 2. Validate inventory limit before incrementing quantity
      const newQty = cart.items[existingItemIdx].quantity + qtyToAdd;
      if (newQty > product.stock) {
        return res.status(400).json({
          message: `Cannot add more items. Only ${product.stock} units are in stock, and you already have ${cart.items[existingItemIdx].quantity} in cart.`,
        });
      }
      cart.items[existingItemIdx].quantity = newQty;
    } else {
      // Validate inventory limit for initial quantity
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          message: `Cannot add ${qtyToAdd} items. Only ${product.stock} units are in stock.`,
        });
      }
      cart.items.push({ productId, quantity: qtyToAdd });
    }

    await cart.save();

    const cartResponse = await getPopulatedCartResponse(customerId);
    res.json(cartResponse);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put('/update', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { productId, quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIdx = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIdx === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Verify stock availability
    const product = await Product.findById(productId);
    if (!product || product.status !== 'published') {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        message: `Requested quantity exceeds available stock. Only ${product.stock} units are available.`,
      });
    }

    cart.items[itemIdx].quantity = newQty;
    await cart.save();

    const cartResponse = await getPopulatedCartResponse(customerId);
    res.json(cartResponse);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove product from cart
// @access  Private
router.delete('/remove/:productId', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIdx = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIdx === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.items.splice(itemIdx, 1);
    await cart.save();

    const cartResponse = await getPopulatedCartResponse(customerId);
    res.json(cartResponse);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', protect, async (req, res, next) => {
  try {
    const customerId = req.user.id;

    let cart = await Cart.findOne({ customerId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    const cartResponse = await getPopulatedCartResponse(customerId);
    res.json(cartResponse);
  } catch (error) {
    next(error);
  }
});

export default router;
