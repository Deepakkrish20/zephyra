import Cart from '../models/Cart.js';

/**
 * Get customer's cart
 */
export const getCart = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    let cart = await Cart.findOne({ customerId }).populate('items.productId');

    if (!cart) {
      cart = await Cart.create({ customerId, items: [] });
    }

    return res.status(200).json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or update item quantity in cart
 */
export const addToCart = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // If quantity is 0 or less, remove item
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    } else if (quantity > 0) {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    
    // Populate product details for response
    const populatedCart = await Cart.findOne({ customerId }).populate('items.productId');

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
      data: { cart: populatedCart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove specific product from cart
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ customerId });
    if (cart) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
    }

    const populatedCart = await Cart.findOne({ customerId }).populate('items.productId');

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: { cart: populatedCart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear customer's cart
 */
export const clearCart = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const cart = await Cart.findOne({ customerId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared.',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};
