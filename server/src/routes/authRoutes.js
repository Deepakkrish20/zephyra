import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { registerValidationRules, loginValidationRules, validate } from '../validators/authValidator.js';
import protect from '../middlewares/authMiddleware.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new customer account
// @access  Public (customer only)
router.post('/register', registerValidationRules, validate, authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginValidationRules, validate, authController.login);

// @route   POST /api/auth/logout
// @desc    Log out current user / session clean up
// @access  Public (stateless)
router.post('/logout', authController.logout);

// @route   GET /api/auth/me
// @desc    Get current logged in user details
// @access  Private
router.get('/me', protect, authController.getCurrentUser);

// @route   POST /api/auth/verify
// @desc    Verify customer email account
// @access  Public
router.post('/verify', authController.verify);

export default router;
