import express from 'express';
import { checkout } from '../controllers/checkoutController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require auth for checkout

router.post('/', checkout);

export default router;
