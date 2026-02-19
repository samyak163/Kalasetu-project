/**
 * @file refundRoutes.js — Refund Request Routes
 *
 * User-facing refund request management. Both artisans and customers can
 * create and track refund requests (protectAny). Admin approval/rejection
 * is handled via adminRoutes.js.
 *
 * Mounted at: /api/refunds
 *
 * Routes (all protectAny):
 *  POST /     — Create a new refund request
 *  GET  /     — List user's refund requests
 *  GET  /:id  — Get refund request details
 *
 * @see controllers/refundController.js — Handler implementations
 * @see routes/adminRoutes.js — Admin refund approval endpoints
 * @see models/refundRequestModel.js — RefundRequest schema
 */
import express from 'express';
import { protectAny } from '../middleware/authMiddleware.js';
import { createRefundRequest, getUserRefundRequests, getRefundRequestById } from '../controllers/refundController.js';

const router = express.Router();

router.post('/', protectAny, createRefundRequest);
router.get('/', protectAny, getUserRefundRequests);
router.get('/:id', protectAny, getRefundRequestById);

export default router;
