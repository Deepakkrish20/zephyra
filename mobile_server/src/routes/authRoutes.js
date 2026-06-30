import express from 'express';
import { register, verify, login, getCurrentUser, getAddresses, addAddress, deleteAddress } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify', verify);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

export default router;
