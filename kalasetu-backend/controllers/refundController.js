import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import RefundRequest from '../models/refundRequestModel.js';
import Payment from '../models/paymentModel.js';
import Notification from '../models/notificationModel.js';

// Zod validation schemas
const createRefundSchema = z.object({
  paymentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID format'),
  amount: z.number().positive('Amount must be greater than 0'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason must not exceed 1000 characters'),
  evidence: z.array(z.object({
    type: z.enum(['image', 'document', 'text']),
    url: z.string().optional(),
    description: z.string().optional()
  })).optional()
});

/**
 * Create refund request
 * POST /api/refunds
 */
export const createRefundRequest = asyncHandler(async (req, res) => {
  // Validate request body
  const validation = createRefundSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.error.errors
    });
  }

  const { paymentId, amount, reason, evidence } = validation.data;

  // Fetch payment
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Check if user is the payer
  if (payment.payerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the payer can request a refund'
    });
  }

  // Check payment status
  if (payment.status !== 'captured') {
    return res.status(400).json({
      success: false,
      message: 'Only captured payments can be refunded'
    });
  }

  // Cumulative refund check
  const existingRefunds = await RefundRequest.find({
    payment: paymentId,
    status: { $in: ['pending', 'approved', 'processing', 'processed'] }
  });

  const totalExistingRefunds = existingRefunds.reduce((sum, refund) => sum + refund.amount, 0);

  if (amount + totalExistingRefunds > payment.amount) {
    return res.status(400).json({
      success: false,
      message: 'Refund amount exceeds available balance',
      details: {
        paymentAmount: payment.amount,
        alreadyRefunded: totalExistingRefunds,
        available: payment.amount - totalExistingRefunds,
        requested: amount
      }
    });
  }

  // Determine account type
  const requestedByModel = req.accountType === 'artisan' ? 'Artisan' : 'User';

  // Create refund request
  const refundRequest = await RefundRequest.create({
    payment: paymentId,
    booking: payment.metadata?.bookingId || null,
    requestedBy: req.user._id,
    requestedByModel,
    amount,
    reason,
    evidence: evidence || []
  });

  // Create in-app notification
  try {
    await Notification.create({
      ownerId: req.user._id,
      ownerType: req.accountType === 'artisan' ? 'artisan' : 'user',
      title: 'Refund Request Submitted',
      text: `Your refund request for Rs.${amount} has been submitted and is pending admin review.`,
      url: `/refunds/${refundRequest._id}`,
      read: false
    });
  } catch (notifError) {
    // Non-critical: don't fail the request if notification creation fails
    console.error('Failed to create notification:', notifError.message);
  }

  res.status(201).json({
    success: true,
    message: 'Refund request created successfully',
    data: refundRequest
  });
});

/**
 * Get user's refund requests
 * GET /api/refunds
 */
export const getUserRefundRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = { requestedBy: req.user._id };

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [refunds, total] = await Promise.all([
    RefundRequest.find(query)
      .populate('payment', 'amount purpose razorpayPaymentId status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    RefundRequest.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: refunds,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

/**
 * Get single refund request
 * GET /api/refunds/:id
 */
export const getRefundRequestById = asyncHandler(async (req, res) => {
  const refundRequest = await RefundRequest.findById(req.params.id)
    .populate('payment', 'amount purpose razorpayPaymentId razorpayOrderId status createdAt')
    .populate('booking', 'serviceTitle scheduledDate status')
    .populate('requestedBy', 'fullName email profileImageUrl')
    .populate('adminResponse.adminId', 'fullName email');

  if (!refundRequest) {
    return res.status(404).json({
      success: false,
      message: 'Refund request not found'
    });
  }

  // Check authorization
  if (refundRequest.requestedBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to view this refund request'
    });
  }

  res.json({
    success: true,
    data: refundRequest
  });
});

export default {
  createRefundRequest,
  getUserRefundRequests,
  getRefundRequestById
};
