import User from '../models/User.js';
import { hashPassword } from '../utils/passwordUtil.js';
import ROLES from '../constants/roles.js';

/**
 * Admin creates a new delivery agent account
 */
export const createDeliveryAgent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check email uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with delivery_agent role
    const agent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.DELIVERY_AGENT,
    });

    // Strip password field from response
    const agentObj = agent.toObject();
    delete agentObj.password;

    return res.status(201).json({
      success: true,
      message: 'Delivery agent account created successfully.',
      data: {
        user: agentObj,
      },
    });
  } catch (error) {
    next(error);
  }
};
