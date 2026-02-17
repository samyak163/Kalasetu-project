import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';
import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';
import RefundRequest from '../models/refundRequestModel.js';
import Notification from '../models/notificationModel.js';
import { createOrder, verifyPaymentSignature, fetchPayment, refundPayment, verifyWebhookSignature } from '../utils/razorpay.js';
import { sendEmail } from '../utils/email.js';
import { RAZORPAY_CONFIG } from '../config/env.config.js';

const createOrderSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID').optional(),
  amount: z.number().positive('Amount must be positive').max(500000, 'Amount exceeds maximum').optional(),
  purpose: z.enum(['consultation', 'product_purchase', 'service', 'subscription', 'other']),
  recipientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Create payment order
 * POST /api/payments/create-order
 * When bookingId is provided, amount is derived server-side from booking price.
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues.map(i => i.message).join(', '),
    });
  }

  const { bookingId, amount: clientAmount, purpose, recipientId, description, metadata } = parsed.data;
  const payerId = req.user.id || req.user._id.toString();

  let amount;
  let resolvedRecipientId = recipientId || null;

  if (bookingId) {
    // Server-authoritative: derive amount from booking price
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (String(booking.user) !== payerId) {
      return res.status(403).json({ success: false, message: 'You can only pay for your own bookings' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking is not in a payable state' });
    }
    if (!booking.price || booking.price <= 0) {
      return res.status(400).json({ success: false, message: 'Booking has no valid price' });
    }
    amount = booking.price;
    resolvedRecipientId = resolvedRecipientId || booking.artisan;
  } else {
    // Fallback for non-booking payments — client amount with validation
    if (!clientAmount) {
      return res.status(400).json({ success: false, message: 'Either bookingId or amount is required' });
    }
    amount = clientAmount;
  }

  // Create Razorpay order
  const razorpayOrder = await createOrder({
    amount,
    notes: {
      purpose,
      payerId,
      recipientId: resolvedRecipientId ? String(resolvedRecipientId) : '',
      ...(bookingId && { bookingId }),
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
    recipientId: resolvedRecipientId || null,
    recipientModel: resolvedRecipientId ? 'Artisan' : null,
    purpose,
    description,
    metadata: { ...metadata, ...(bookingId && { bookingId }) },
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

  // Verify the requesting user is the actual payer
  const userId = req.user.id || req.user._id.toString();
  if (payment.payerId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: you are not the payer for this payment',
    });
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  // Don't store the signature — it's only needed for verification, not storage
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
  const { status, type = 'sent', limit = 20, page = 1, bookingId } = req.query;

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

  // Filter by bookingId (from metadata)
  if (bookingId) {
    query['metadata.bookingId'] = bookingId;
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

  // Check payment status — refunded check first since it's more specific
  if (payment.status === 'refunded') {
    return res.status(400).json({
      success: false,
      message: 'Payment already refunded',
    });
  }

  if (payment.status !== 'captured') {
    return res.status(400).json({
      success: false,
      message: 'Only captured payments can be refunded',
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

  // Process refund via Razorpay
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

  // Atomic update to prevent race conditions
  const updated = await Payment.findOneAndUpdate(
    { _id: payment._id, status: 'captured' },
    {
      $set: {
        status: 'refunded',
        refundId: refund.id,
        refundAmount,
        refundedAt: new Date(),
        'metadata.refundReason': reason,
      },
    },
    { new: true }
  );

  if (!updated) {
    return res.status(409).json({
      success: false,
      message: 'Payment status changed during refund processing',
    });
  }

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      refundId: refund.id,
      amount: refundAmount,
    },
  });
});

/**
 * Webhook handler for Razorpay events
 * POST /api/payments/webhook
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  // req.body is a raw Buffer from express.raw() middleware (set up in server.js)
  // This ensures we verify the exact bytes Razorpay sent, not a re-serialized string
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

  // Verify webhook signature using raw body
  const isValid = verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    });
  }

  // Parse the raw body if it came as a Buffer
  const parsedBody = Buffer.isBuffer(req.body) ? JSON.parse(rawBody) : req.body;

  const eventId = parsedBody.event_id || parsedBody.payload?.payment?.entity?.id;
  const event = parsedBody.event;
  const paymentData = parsedBody.payload?.payment?.entity;

  try {
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentData, eventId);
        break;

      case 'payment.failed':
        await handlePaymentFailed(paymentData, eventId);
        break;

      case 'refund.created':
        await handleRefundCreated(parsedBody.payload?.refund?.entity || paymentData);
        break;

      case 'refund.failed':
        await handleRefundFailed(parsedBody.payload?.refund?.entity || paymentData);
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
 * Handle payment captured event (atomic + idempotent)
 * Uses findOneAndUpdate with status precondition to prevent double-processing
 */
async function handlePaymentCaptured(paymentData, eventId) {
  const update = {
    $set: {
      status: 'captured',
      razorpayPaymentId: paymentData.id,
      ...(eventId && { webhookEventId: eventId }),
    },
  };

  await Payment.findOneAndUpdate(
    { razorpayOrderId: paymentData.order_id, status: { $ne: 'captured' } },
    update
  );
}

/**
 * Handle payment failed event (atomic + idempotent)
 */
async function handlePaymentFailed(paymentData, eventId) {
  const update = {
    $set: {
      status: 'failed',
      'metadata.failureReason': paymentData.error_description,
      ...(eventId && { webhookEventId: eventId }),
    },
  };

  await Payment.findOneAndUpdate(
    { razorpayOrderId: paymentData.order_id, status: { $nin: ['captured', 'failed', 'refunded'] } },
    update
  );
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

  // Update RefundRequest status
  const refundRequest = await RefundRequest.findOne({ razorpayRefundId: refundData.id });
  if (refundRequest && refundRequest.status !== 'processed') {
    refundRequest.status = 'processed';
    refundRequest.razorpayRefundStatus = refundData.status;
    refundRequest.processedAt = new Date();
    await refundRequest.save();

    // Notify user that refund is complete
    try {
      const RequesterModel = refundRequest.requestedByModel === 'User'
        ? (await import('../models/userModel.js')).default
        : (await import('../models/artisanModel.js')).default;
      const requester = await RequesterModel.findById(refundRequest.requestedBy).lean();

      if (requester) {
        await Notification.create({
          ownerId: refundRequest.requestedBy,
          ownerType: refundRequest.requestedByModel === 'User' ? 'user' : 'artisan',
          title: 'Refund Processed',
          text: `Your refund of Rs.${refundRequest.amount} has been processed successfully.`,
          url: `/refunds/${refundRequest._id}`,
          read: false
        });

        const emailHtml = buildRefundProcessedEmailHTML(requester.fullName, refundRequest);
        await sendEmail({
          to: requester.email,
          subject: 'Your Refund Has Been Processed - KalaSetu',
          html: emailHtml
        }).catch(() => {});
      }
    } catch (notifError) {
      // Non-critical: don't fail webhook for notification errors
      console.error('Failed to send refund processed notification:', notifError.message);
    }
  }
}

/**
 * Handle refund failed event
 */
async function handleRefundFailed(refundData) {
  const refundRequest = await RefundRequest.findOne({ razorpayRefundId: refundData.id });

  if (refundRequest) {
    refundRequest.status = 'failed';
    refundRequest.failureReason = refundData.error_description || 'Refund failed';
    refundRequest.razorpayRefundStatus = refundData.status;
    await refundRequest.save();

    // Notify user about failure
    try {
      const RequesterModel = refundRequest.requestedByModel === 'User'
        ? (await import('../models/userModel.js')).default
        : (await import('../models/artisanModel.js')).default;
      const requester = await RequesterModel.findById(refundRequest.requestedBy).lean();

      if (requester) {
        await Notification.create({
          ownerId: refundRequest.requestedBy,
          ownerType: refundRequest.requestedByModel === 'User' ? 'user' : 'artisan',
          title: 'Refund Failed',
          text: `Your refund request for Rs.${refundRequest.amount} could not be processed. Please contact support.`,
          url: `/refunds/${refundRequest._id}`,
          read: false
        });

        const emailHtml = buildRefundFailedEmailHTML(requester.fullName, refundRequest);
        await sendEmail({
          to: requester.email,
          subject: 'Refund Processing Failed - KalaSetu',
          html: emailHtml
        }).catch(() => {});
      }
    } catch (notifError) {
      // Non-critical: don't fail webhook for notification errors
      console.error('Failed to send refund failed notification:', notifError.message);
    }

    console.log(`❌ Refund failed: ${refundRequest._id}`);
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildRefundProcessedEmailHTML(userName, refundRequest) {
  const brandColor = '#A55233';
  const frontendUrl = process.env.FRONTEND_URL || 'https://kalasetu.com';
  userName = escapeHtml(userName);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Processed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${brandColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 24px; font-weight: bold; color: ${brandColor}; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: ${brandColor}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Processed Successfully</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Great news! Your refund has been successfully processed.</p>

          <div class="amount">
            Amount: Rs.${refundRequest.amount.toLocaleString('en-IN')}
          </div>

          <p>The refund should reflect in your original payment method within 5-7 business days depending on your bank.</p>

          <a href="${frontendUrl}/refunds/${refundRequest._id}" class="button">View Refund Details</a>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you don't see the refund after 7 business days, please contact your bank or our support team.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildRefundFailedEmailHTML(userName, refundRequest) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://kalasetu.com';
  userName = escapeHtml(userName);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Processing Failed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 24px; font-weight: bold; color: #f44336; margin: 20px 0; }
        .reason { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Processing Failed</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>We're sorry, but your refund could not be processed at this time.</p>

          <div class="amount">
            Amount: Rs.${refundRequest.amount.toLocaleString('en-IN')}
          </div>

          <div class="reason">
            <strong>Reason:</strong> ${refundRequest.failureReason || 'Unknown error'}
          </div>

          <p>Our support team has been notified and will investigate this issue. We'll reach out to you shortly to resolve this.</p>

          <a href="${frontendUrl}/refunds/${refundRequest._id}" class="button">View Refund Details</a>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have urgent questions, please contact our support team directly.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
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
