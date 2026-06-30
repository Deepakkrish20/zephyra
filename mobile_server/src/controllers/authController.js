import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/passwordUtil.js';
import { generateToken } from '../utils/jwtUtil.js';
import { sendVerificationEmail } from '../utils/emailUtil.js';
import ROLES from '../constants/roles.js';

/**
 * Handle user registration (only CUSTOMER role allowed publicly)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.CUSTOMER,
      isVerified: false,
      verificationCode,
      verificationExpires,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    // Convert to object and delete sensitive fields
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationExpires;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Verification email sent.',
      data: { user: userObj },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle account verification via code & auto-login
 */
export const verify = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified.' });
    }

    // Validate code and check expiry
    if (user.verificationCode !== code || user.verificationExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    // Clear verification codes and verify user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Auto-login: generate token
    const token = generateToken({ id: user._id, role: user.role });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationExpires;

    return res.status(200).json({
      success: true,
      message: 'Account verified and logged in successfully.',
      data: {
        user: userObj,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check verification status
    if (user.role === ROLES.CUSTOMER && !user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email address before logging in.' });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationExpires;

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully.',
      data: {
        user: userObj,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user details
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationCode -verificationExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve saved addresses for the customer
 */
export const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: {
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new shipping address to the customer's profile
 */
export const addAddress = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, landmark } =
      req.body;

    if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !postalCode) {
      return res
        .status(400)
        .json({ success: false, message: 'Required shipping details are missing.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newAddress = {
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      landmark,
    };

    user.addresses.push(newAddress);
    await user.save();

    // Return the newly created address (the last one pushed)
    const addedAddress = user.addresses[user.addresses.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: {
        address: addedAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a shipping address from the customer's profile
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove address using mongoose sub-document pull
    user.addresses.pull({ _id: addressId });
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
