import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getUserPayments,
  getArtisanEarnings,
  requestRefund,
  handleWebhook,
} from '../controllers/paymentController.js';
import { protect, protectAny } from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook (no auth, uses signature verification)
router.post('/webhook', handleWebhook);

// Shared routes (both user types)
router.post('/create-order', protectAny, createPaymentOrder);
router.post('/verify', protectAny, verifyPayment);
router.get('/', protectAny, getUserPayments);
router.get('/:paymentId', protectAny, getPaymentDetails);
router.post('/:paymentId/refund', protectAny, requestRefund);

// Artisan-only routes
router.get('/artisan/earnings', protect, getArtisanEarnings);

export default router;
