import * as authService from '../services/authService.js';
import User from '../models/User.js';

/**
 * Handle user registration
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser({ name, email, password, role });
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { user },
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
    const { user, token } = await authService.loginUser({ email, password });
    
    return res.status(200).json({
      success: true,
      message: 'User logged in successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout
 */
export const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully.',
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
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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
 * Handle account verification via 6-digit code
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
      return res.status(400).json({ success: false, message: 'User account is already verified.' });
    }

    // Check if code matches and has not expired
    if (user.verificationCode !== code || user.verificationExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    // Clear verification fields and set verified to true
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

