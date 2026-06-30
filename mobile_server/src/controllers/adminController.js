import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { hashPassword } from '../utils/passwordUtil.js';
import ROLES from '../constants/roles.js';
import { sendVerificationEmail } from '../utils/emailUtil.js';

/**
 * Fetch Admin Dashboard stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const grossRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const totalActiveOrders = await Order.countDocuments({
      status: { $in: ['approved', 'accepted', 'picked_up', 'out_for_delivery'] },
    });

    const pendingApprovalCount = await Order.countDocuments({ status: 'pending_approval' });
    const totalProducts = await Product.countDocuments();
    const draftProducts = await Product.countDocuments({ status: 'draft' });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('deliveryAgent', 'name');

    return res.status(200).json({
      success: true,
      data: {
        grossRevenue,
        totalActiveOrders,
        pendingApprovalCount,
        totalProducts,
        draftProducts,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Delivery Agent account
 */
export const createDeliveryAgent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await hashPassword(password);

    const agent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.DELIVERY_AGENT,
      isVerified: true, // Delivery agents are pre-verified
    });

    const agentObj = agent.toObject();
    delete agentObj.password;

    return res.status(201).json({
      success: true,
      message: 'Delivery agent account created successfully.',
      data: { user: agentObj },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all delivery agents
 */
export const getDeliveryAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: ROLES.DELIVERY_AGENT })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { agents },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all customers
 */
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: ROLES.CUSTOMER })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { customers },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders with filtering
 */
export const getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const ordersObj = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('deliveryAgent', 'name')
      .lean();

    // Map customer name & email info dynamically
    const ordersWithCustomer = await Promise.all(
      ordersObj.map(async (order) => {
        let customer = { name: 'Guest User', email: 'guest@example.com' };
        
        try {
          const user = await User.findById(order.customerId).select('name email');
          if (user) {
            customer = { name: user.name, email: user.email };
          }
        } catch (e) {
          // Handled
        }
        return { ...order, customer };
      })
    );

    return res.status(200).json({
      success: true,
      data: { orders: ordersWithCustomer },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve order status
 */
export const approveOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve order with status "${order.status}".`,
      });
    }

    order.status = 'approved';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order approved successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject order status
 */
export const rejectOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject order with status "${order.status}".`,
      });
    }

    order.status = 'rejected';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order rejected successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates new catalog product
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, imageUrl, category, stock, status } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name and price are required.' });
    }

    const product = await Product.create({
      name,
      price,
      description,
      imageUrl,
      category: category || 'Uncategorized',
      stock: stock || 0,
      status: status || 'draft',
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin updates catalog product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { name, price, description, imageUrl, category, stock, status } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (status !== undefined) product.status = status;

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};
