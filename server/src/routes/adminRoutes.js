import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { createDeliveryAgentValidationRules, validate } from '../validators/adminValidator.js';

const router = Router();

// @route   POST /api/admin/delivery-agents
// @desc    Create a new delivery agent account (Admin only)
// @access  Private (Admin)
router.post('/delivery-agents', createDeliveryAgentValidationRules, validate, adminController.createDeliveryAgent);

export default router;
