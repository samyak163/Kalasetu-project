import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getUserPayments,
  requestRefund,
  handleWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';

const router = express.Router();

// Webhook (no auth, uses signature verification)
router.post('/webhook', handleWebhook);

// Artisan routes
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/', protect, getUserPayments);
router.get('/:paymentId', protect, getPaymentDetails);
router.post('/:paymentId/refund', protect, requestRefund);

// Customer routes
router.post('/user/create-order', userProtect, createPaymentOrder);
router.post('/user/verify', userProtect, verifyPayment);
router.get('/user/payments', userProtect, getUserPayments);
router.get('/user/:paymentId', userProtect, getPaymentDetails);
router.post('/user/:paymentId/refund', userProtect, requestRefund);

export default router;
