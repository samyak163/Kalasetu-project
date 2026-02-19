/**
 * @file paymentRoutes.js — Payment & Razorpay Routes
 *
 * Razorpay payment lifecycle: order creation, verification, history,
 * refund requests, and webhook handling. The webhook route is deliberately
 * unauthenticated — it uses Razorpay signature verification instead.
 *
 * Mounted at: /api/payments
 *
 * Webhook (no auth — signature verified):
 *  POST /webhook — Razorpay webhook callback
 *
 * Shared routes (protectAny):
 *  POST /create-order      — Create Razorpay order for a booking
 *  POST /verify            — Verify payment after Razorpay checkout
 *  GET  /                  — List user's payment history
 *  GET  /:paymentId        — Get payment details
 *  POST /:paymentId/refund — Request a refund
 *
 * Artisan routes (protect):
 *  GET /artisan/earnings — Get artisan earnings summary
 *
 * Note: /webhook must be first to avoid being caught by auth middleware.
 *
 * @see controllers/paymentController.js — Handler implementations
 * @see models/paymentModel.js — Payment schema with Razorpay fields
 */
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

// Artisan-only routes — MUST be before /:paymentId to avoid "artisan" matching as paymentId
router.get('/artisan/earnings', protect, getArtisanEarnings);

// Parameterized routes last
router.get('/:paymentId', protectAny, getPaymentDetails);
router.post('/:paymentId/refund', protectAny, requestRefund);

export default router;
