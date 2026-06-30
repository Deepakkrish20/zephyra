import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

/**
 * Handle checkout and place a new order
 */
export const checkout = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { address, items } = req.body;

    if (!address) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    let orderItems = [];
    let totalAmount = 0;

    // Direct Buy Now checkout support
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product || product.status !== 'published') {
          return res.status(400).json({ success: false, message: `Product ${item.productId} is no longer available.` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
        }

        const itemSubtotal = product.price * item.quantity;
        totalAmount += itemSubtotal;

        orderItems.push({
          productId: product._id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });

        // Deduct inventory stock
        product.stock -= item.quantity;
        await product.save();
      }
    } else {
      // Traditional cart-based checkout
      const cart = await Cart.findOne({ customerId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
      }

      for (const item of cart.items) {
        const product = item.productId;
        if (!product || product.status !== 'published') {
          return res.status(400).json({ success: false, message: `Product ${item.productId} is no longer available.` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
        }

        const itemSubtotal = product.price * item.quantity;
        totalAmount += itemSubtotal;

        orderItems.push({
          productId: product._id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });

        // Deduct inventory stock
        product.stock -= item.quantity;
        await product.save();
      }

      // Clear user's cart
      cart.items = [];
      await cart.save();
    }

    // Generate unique order number
    const orderNumber = `ZEP-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`;

    // Create new Order in database
    const order = await Order.create({
      customerId,
      orderNumber,
      items: orderItems,
      shippingAddress: address,
      totalAmount,
      status: 'pending_approval',
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
