import User from '../models/User.js';
import { hashPassword } from '../utils/passwordUtil.js';
import ROLES from '../constants/roles.js';
import { sendVerificationReminderEmail } from '../utils/emailUtil.js';

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

/**
 * Admin retrieves all customer accounts
 */
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: ROLES.CUSTOMER })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        customers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin sends a verification reminder to a customer
 */
export const sendVerificationReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User account is already verified.' });
    }

    // Generate or refresh verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Send the reminder email
    await sendVerificationReminderEmail(user.email, verificationCode);

    return res.status(200).json({
      success: true,
      message: 'Verification reminder sent successfully.',
    });
  } catch (error) {
    next(error);
  }
};

