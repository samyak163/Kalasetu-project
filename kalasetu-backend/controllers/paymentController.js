import asyncHandler from '../utils/asyncHandler.js';
import Payment from '../models/paymentModel.js';
import { createOrder, verifyPaymentSignature, fetchPayment, refundPayment, verifyWebhookSignature } from '../utils/razorpay.js';
import { RAZORPAY_CONFIG } from '../config/env.config.js';

/**
 * Create payment order
 * POST /api/payments/create-order
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, purpose, recipientId, description, metadata } = req.body;
  const payerId = req.user.id || req.user._id.toString();

  if (!amount || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Amount and purpose are required',
    });
  }

  // Create Razorpay order
  const razorpayOrder = await createOrder({
    amount,
    notes: {
      purpose,
      payerId,
      recipientId: recipientId || '',
    },
  });

  if (!razorpayOrder) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }

  // Save to database
  const payment = await Payment.create({
    orderId: razorpayOrder.receipt,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: RAZORPAY_CONFIG.currency,
    status: 'created',
    payerId,
    payerModel: req.accountType === 'artisan' ? 'Artisan' : 'User',
    recipientId: recipientId || null,
    recipientModel: recipientId ? 'Artisan' : null,
    purpose,
    description,
    metadata,
  });

  res.status(201).json({
    success: true,
    message: 'Payment order created successfully',
    data: {
      orderId: payment._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: RAZORPAY_CONFIG.keyId,
    },
  });
});

/**
 * Verify payment
 * POST /api/payments/verify
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing payment verification data',
    });
  }

  // Verify signature
  const isValid = verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature',
    });
  }

  // Update payment in database
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = 'captured';
  await payment.save();

  // Fetch full payment details from Razorpay
  const paymentDetails = await fetchPayment(razorpay_payment_id);

  res.json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      paymentId: payment._id,
      status: payment.status,
      amount: payment.amount,
      paymentDetails,
    },
  });
});

/**
 * Get payment details
 * GET /api/payments/:paymentId
 */
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id || req.user._id.toString();

  const payment = await Payment.findById(paymentId)
    .populate('payerId', 'fullName email profileImageUrl')
    .populate('recipientId', 'fullName email profileImageUrl');

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  // Check if user is authorized to view this payment
  const isAuthorized = 
    payment.payerId._id.toString() === userId ||
    (payment.recipientId && payment.recipientId._id.toString() === userId);

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to view this payment',
    });
  }

  res.json({
    success: true,
    data: payment,
  });
});

/**
 * Get user's payments
 * GET /api/payments
 */
export const getUserPayments = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id.toString();
  const { status, type = 'sent', limit = 20, page = 1 } = req.query;

  const query = {};

  // Filter by type (sent or received)
  if (type === 'sent') {
    query.payerId = userId;
  } else if (type === 'received') {
    query.recipientId = userId;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate('payerId', 'fullName email profileImageUrl')
    .populate('recipientId', 'fullName email profileImageUrl')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Get artisan earnings summary
 * GET /api/payments/artisan/earnings
 */
export const getArtisanEarnings = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Use aggregation pipeline instead of loading all payments into memory
  const [earningsAgg, transactions] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          recipientId: artisanId,
          recipientModel: 'Artisan',
          status: 'captured'
        }
      },
      {
        $facet: {
          totalEarned: [
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          thisMonthEarnings: [
            { $match: { createdAt: { $gte: firstDayOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]
        }
      }
    ]),

    // Fetch only the 20 most recent transactions for display
    Payment.find({
      recipientId: artisanId,
      recipientModel: 'Artisan',
      status: 'captured'
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('description purpose amount createdAt status razorpayPaymentId')
      .lean()
  ]);

  const agg = earningsAgg[0];
  const totalEarned = agg.totalEarned[0]?.total || 0;
  const thisMonthEarnings = agg.thisMonthEarnings[0]?.total || 0;

  // For now, assume all captured payments are available (no withdrawal system yet)
  const availableBalance = totalEarned;
  const pendingAmount = 0;
  const lastWithdrawal = 0;

  // Format transactions for display
  const formattedTransactions = transactions.map(payment => ({
    _id: payment._id,
    type: payment.status === 'refunded' ? 'refund' : 'payment',
    description: payment.description || payment.purpose || 'Payment received',
    amount: payment.amount,
    date: payment.createdAt,
    status: payment.status,
    paymentId: payment.razorpayPaymentId
  }));

  res.status(200).json({
    success: true,
    data: {
      summary: {
        availableBalance,
        pendingAmount,
        totalEarned,
        lastWithdrawal,
        thisMonth: thisMonthEarnings
      },
      transactions: formattedTransactions
    }
  });
});

/**
 * Request refund
 * POST /api/payments/:paymentId/refund
 */
export const requestRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;
  const userId = req.user.id || req.user._id.toString();

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  // Check if user is the payer
  if (payment.payerId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Only the payer can request a refund',
    });
  }

  // Check if payment is captured
  if (payment.status !== 'captured') {
    return res.status(400).json({
      success: false,
      message: 'Only captured payments can be refunded',
    });
  }

  // Check if already refunded
  if (payment.status === 'refunded') {
    return res.status(400).json({
      success: false,
      message: 'Payment already refunded',
    });
  }

  // Validate refund amount doesn't exceed original
  const refundAmount = amount || payment.amount;
  if (refundAmount > payment.amount) {
    return res.status(400).json({
      success: false,
      message: 'Refund amount cannot exceed original payment amount',
    });
  }

  // Process refund
  const refund = await refundPayment(
    payment.razorpayPaymentId,
    refundAmount
  );

  if (!refund) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process refund',
    });
  }

  // Update payment
  payment.status = 'refunded';
  payment.refundId = refund.id;
  payment.refundAmount = refundAmount;
  payment.refundedAt = new Date();
  payment.metadata = {
    ...payment.metadata,
    refundReason: reason,
  };
  await payment.save();

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      refundId: refund.id,
      amount: payment.refundAmount,
    },
  });
});

/**
 * Webhook handler for Razorpay events
 * POST /api/payments/webhook
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const isValid = verifyWebhookSignature(body, signature);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    });
  }

  const eventId = req.body.event_id || req.body.payload?.payment?.entity?.id;
  const event = req.body.event;
  const paymentData = req.body.payload?.payment?.entity;

  // Atomic idempotency check using findOneAndUpdate
  if (eventId) {
    const existing = await Payment.findOneAndUpdate(
      { webhookEventId: eventId },
      { $setOnInsert: { webhookEventId: eventId } },
      { upsert: false }
    );
    if (existing) {
      return res.json({ success: true, message: 'Already processed' });
    }
  }

  try {
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentData, eventId);
        break;

      case 'payment.failed':
        await handlePaymentFailed(paymentData, eventId);
        break;

      case 'refund.created':
        await handleRefundCreated(paymentData);
        break;

      default:
        break;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
});

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(paymentData, eventId) {
  const payment = await Payment.findOne({
    razorpayOrderId: paymentData.order_id,
  });

  if (payment && payment.status !== 'captured') {
    payment.status = 'captured';
    payment.razorpayPaymentId = paymentData.id;
    if (eventId) payment.webhookEventId = eventId;
    await payment.save();
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(paymentData, eventId) {
  const payment = await Payment.findOne({
    razorpayOrderId: paymentData.order_id,
  });

  if (payment) {
    payment.status = 'failed';
    payment.metadata = {
      ...payment.metadata,
      failureReason: paymentData.error_description,
    };
    if (eventId) payment.webhookEventId = eventId;
    await payment.save();

    console.log(`❌ Payment failed: ${payment._id}`);
  }
}

/**
 * Handle refund created event
 */
async function handleRefundCreated(refundData) {
  const payment = await Payment.findOne({
    razorpayPaymentId: refundData.payment_id,
  });

  if (payment) {
    payment.status = 'refunded';
    payment.refundId = refundData.id;
    payment.refundAmount = refundData.amount / 100; // Convert from paise
    payment.refundedAt = new Date();
    await payment.save();

    console.log(`✅ Refund processed: ${payment._id}`);
  }
}

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getUserPayments,
  getArtisanEarnings,
  requestRefund,
  handleWebhook,
};
