import express from 'express';
import {
  getAvailableJobs,
  acceptJob,
  getActiveJobs,
  updateJobStatus,
  getAgentStats,
} from '../controllers/deliveryController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('delivery_agent'));

router.get('/available', getAvailableJobs);
router.post('/accept/:orderId', acceptJob);
router.get('/active', getActiveJobs);
router.post('/status/:orderId', updateJobStatus);
router.get('/stats', getAgentStats);

export default router;
