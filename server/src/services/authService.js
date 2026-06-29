import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/passwordUtil.js';
import { generateToken } from '../utils/jwtUtil.js';
import { sendVerificationEmail } from '../utils/emailUtil.js';

/**
 * Service to handle registration of a new user
 * Only 'customer' roles can register via this service/API
 */
export const registerUser = async ({ name, email, password, role }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered.');
    error.statusCode = 400;
    throw error;
  }

  // Admin Registration Rule: Public registration allowed only for customer.
  if (role !== 'customer') {
    const error = new Error('Public registration is only allowed for the customer role.');
    error.statusCode = 403;
    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate verification code for customers
  const isCustomer = role === 'customer';
  const verificationCode = isCustomer
    ? Math.floor(100000 + Math.random() * 900000).toString()
    : undefined;
  const verificationExpires = isCustomer
    ? new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry
    : undefined;

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isVerified: !isCustomer, // Non-customers (admin, delivery agent) are verified automatically
    verificationCode,
    verificationExpires,
  });

  // Send verification email if user is a customer
  if (isCustomer) {
    await sendVerificationEmail(email, verificationCode);
  }

  // Convert to object and exclude password & verification fields
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationCode;
  delete userObj.verificationExpires;

  return userObj;
};

/**
 * Service to handle user login and JWT token generation
 */
export const loginUser = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Check if customer email is verified
  if (user.role === 'customer' && !user.isVerified) {
    const error = new Error('Please verify your email address before logging in.');
    error.statusCode = 403;
    throw error;
  }

  // Compare passwords
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Generate token
  const token = generateToken({ id: user._id, role: user.role });

  // Convert to object and exclude password & verification fields
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationCode;
  delete userObj.verificationExpires;

  return {
    user: userObj,
    token,
  };
};
