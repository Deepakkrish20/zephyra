import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { createDeliveryAgentValidationRules, validate } from '../validators/adminValidator.js';

const router = Router();

// @route   POST /api/admin/delivery-agents
// @desc    Create a new delivery agent account (Admin only)
// @access  Private (Admin)
router.post(
  '/delivery-agents',
  createDeliveryAgentValidationRules,
  validate,
  adminController.createDeliveryAgent
);

// @route   GET /api/admin/delivery-agents
// @desc    Get all registered delivery agent accounts (Admin only)
// @access  Private (Admin)
router.get('/delivery-agents', adminController.getDeliveryAgents);

// @route   GET /api/admin/customers
// @desc    Get all registered customer accounts (Admin only)
// @access  Private (Admin)
router.get('/customers', adminController.getCustomers);

// @route   POST /api/admin/customers/:id/send-reminder
// @desc    Send verification reminder email (Admin only)
// @access  Private (Admin)
router.post('/customers/:id/send-reminder', adminController.sendVerificationReminder);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard metrics and recent transactions (Admin only)
// @access  Private (Admin)
router.get('/dashboard', adminController.getDashboardStats);

export default router;
