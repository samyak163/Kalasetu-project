/**
 * @file paymentController.js — Razorpay Payment Processing
 *
 * Handles the full payment lifecycle: order creation, checkout verification,
 * webhook processing, payment history, and refund initiation.
 *
 * Endpoints:
 *  POST /api/payments/create-order  — Create Razorpay order (returns orderId for checkout)
 *  POST /api/payments/verify        — Verify Razorpay payment signature after checkout
 *  GET  /api/payments               — Payment history for current user
 *  GET  /api/payments/:id           — Single payment details
 *  POST /api/payments/webhook       — Razorpay webhook handler (signature verified)
 *  POST /api/payments/:id/refund    — Initiate refund request
 *
 * Payment flow:
 *  1. Frontend calls create-order → backend creates Razorpay order → returns orderId
 *  2. Frontend opens Razorpay checkout with orderId
 *  3. On success, frontend calls verify → backend verifies signature → marks as captured
 *  4. Razorpay sends webhook for async confirmation → updates payment status
 *
 * @security Webhook signatures MUST be verified using RAZORPAY_WEBHOOK_SECRET.
 *           Payment amounts are validated against booking prices.
 *
 * @see utils/razorpay.js — Razorpay SDK helpers
 * @see models/paymentModel.js — Payment schema
 * @see models/refundRequestModel.js — Refund requests
 */

import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';
import mongoose from 'mongoose';
import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';
import ArtisanService from '../models/artisanServiceModel.js';
import Artisan from '../models/artisanModel.js';
import RefundRequest from '../models/refundRequestModel.js';
import Notification from '../models/notificationModel.js';
import { createOrder, verifyPaymentSignature, fetchPayment, refundPayment, verifyWebhookSignature } from '../utils/razorpay.js';
import { createNotification } from '../utils/notificationService.js';
import { sendEmail } from '../utils/email.js';
import { RAZORPAY_CONFIG } from '../config/env.config.js';

const createOrderSchema = z.object({
  // Path 1: Pay for an existing booking (legacy flow)
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID').optional(),
  // Path 2: Pay-first flow — booking created atomically after payment verification
  serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID').optional(),
  artisanId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid artisan ID').optional(),
  start: z.string().optional(), // ISO date string for booking start time
  notes: z.string().max(500).optional(), // Special requests
  // Path 3: Generic payment (consultation, product, etc.)
  amount: z.number().positive('Amount must be positive').max(500000, 'Amount exceeds maximum').optional(),
  purpose: z.enum(['consultation', 'product_purchase', 'service', 'subscription', 'other']),
  recipientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Create payment order
 * POST /api/payments/create-order
 *
 * Three paths:
 *  1. bookingId provided   → legacy flow, amount from booking
 *  2. serviceId + artisanId + start → pay-first flow, booking created after verification
 *  3. amount + recipientId → generic payment (consultation, product, etc.)
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues.map(i => i.message).join(', '),
    });
  }

  const { bookingId, serviceId, artisanId, start, notes,
          amount: clientAmount, purpose, recipientId, description, metadata } = parsed.data;
  const payerId = req.user.id || req.user._id.toString();

  let amount;
  let resolvedRecipientId = recipientId || null;
  // bookingIntent stores data needed to create booking after payment verification
  let bookingIntent = null;

  if (serviceId && artisanId) {
    // PATH 2: Pay-first flow — derive price from service, store booking intent
    if (!start) {
      return res.status(400).json({ success: false, message: 'start is required for service booking' });
    }
    const startTime = new Date(start);
    if (isNaN(startTime.getTime()) || startTime <= new Date()) {
      return res.status(400).json({ success: false, message: 'Start time must be a valid future date' });
    }

    const [service, artisanDoc] = await Promise.all([
      ArtisanService.findById(serviceId).lean(),
      Artisan.findById(artisanId).select('isActive fullName autoAcceptBookings').lean(),
    ]);

    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (!artisanDoc) return res.status(404).json({ success: false, message: 'Artisan not found' });
    if (artisanDoc.isActive === false) {
      return res.status(400).json({ success: false, message: 'This artisan is not currently accepting bookings' });
    }
    if (service.isActive === false) {
      return res.status(400).json({ success: false, message: 'This service is no longer available' });
    }
    if (String(service.artisan) !== String(artisanId)) {
      return res.status(400).json({ success: false, message: 'Service does not belong to this artisan' });
    }
    if (!service.price || service.price <= 0) {
      return res.status(400).json({ success: false, message: 'This service requires contacting the artisan for pricing' });
    }

    amount = service.price;
    resolvedRecipientId = artisanId;

    // Store booking intent in payment metadata — used by verifyPayment to create booking
    bookingIntent = {
      serviceId,
      artisanId,
      userId: payerId,
      start: startTime.toISOString(),
      end: new Date(startTime.getTime() + (service.durationMinutes || 60) * 60000).toISOString(),
      serviceName: service.name || '',
      categoryName: service.categoryName || '',
      notes: notes || '',
      price: amount,
      autoAccept: !!artisanDoc.autoAcceptBookings,
    };

  } else if (bookingId) {
    // PATH 1: Legacy flow — pay for existing booking
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
    // Prevent double payment
    const existingPayment = await Payment.findOne({
      'metadata.bookingId': bookingId,
      status: { $in: ['created', 'captured'] },
    }).lean();
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'A payment already exists for this booking',
        data: { existingPaymentId: existingPayment._id, status: existingPayment.status },
      });
    }
    amount = booking.price;
    resolvedRecipientId = resolvedRecipientId || booking.artisan;
  } else {
    // PATH 3: Generic payment — client-specified amount
    if (!clientAmount) {
      return res.status(400).json({ success: false, message: 'Provide serviceId+artisanId, bookingId, or amount' });
    }
    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'recipientId is required for non-booking payments' });
    }
    if (clientAmount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum payment amount is Rs. 100' });
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

  // Save to database — bookingIntent stored in metadata for atomic creation on verify
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
    metadata: {
      ...metadata,
      ...(bookingId && { bookingId }),
      ...(bookingIntent && { bookingIntent }),
    },
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
 * Verify payment and atomically create booking if booking intent exists.
 * POST /api/payments/verify
 *
 * Pay-first flow: if payment.metadata.bookingIntent is present, this
 * endpoint creates the booking inside a MongoDB transaction after
 * verifying the Razorpay signature. No booking = no orphans.
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

  // Find payment record
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

  const intent = payment.metadata?.bookingIntent;
  let booking = null;

  if (intent) {
    // PAY-FIRST FLOW: Create booking atomically with payment capture
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check for overlapping bookings
      const startTime = new Date(intent.start);
      const endTime = new Date(intent.end);

      const overlap = await Booking.findOne({
        artisan: intent.artisanId,
        status: { $in: ['pending', 'confirmed'] },
        start: { $lt: endTime },
        end: { $gt: startTime },
      }).session(session);

      if (overlap) {
        await session.abortTransaction();
        // Payment was captured by Razorpay but slot is taken — mark for refund
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = 'captured';
        payment.metadata.refundReason = 'slot_conflict';
        await payment.save();

        // Auto-create RefundRequest so admins have visibility
        RefundRequest.create({
          payment: payment._id,
          requestedBy: intent.userId,
          requestedByModel: 'User',
          amount: payment.amount,
          reason: 'Automatic: time slot was booked by another customer during payment. Full refund required.',
        }).catch(() => {}); // Non-blocking — don't fail the response

        return res.status(409).json({
          success: false,
          message: 'This time slot was just booked by someone else. Your payment will be refunded.',
          data: { paymentId: payment._id, requiresRefund: true },
        });
      }

      // Determine initial status: auto-accept if artisan has it enabled
      const initialStatus = intent.autoAccept ? 'confirmed' : 'pending';

      // Create booking atomically
      const [newBooking] = await Booking.create([{
        artisan: intent.artisanId,
        user: intent.userId,
        service: intent.serviceId,
        serviceName: intent.serviceName,
        categoryName: intent.categoryName,
        start: startTime,
        end: endTime,
        notes: intent.notes,
        price: intent.price,
        status: initialStatus,
        depositPaid: true,
      }], { session });

      // Update payment with booking reference
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.status = 'captured';
      payment.metadata.bookingId = newBooking._id.toString();
      // Clear bookingIntent from metadata (no longer needed)
      payment.metadata.bookingIntent = undefined;
      await payment.save({ session });

      await session.commitTransaction();
      booking = newBooking;

      // Non-blocking: notify artisan about new booking
      const startDate = startTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      createNotification({
        ownerId: intent.artisanId,
        ownerType: 'artisan',
        title: intent.autoAccept ? 'New Booking Confirmed' : 'New Booking Request',
        text: intent.autoAccept
          ? `A booking for ${intent.serviceName || 'a service'} on ${startDate} has been confirmed and paid.`
          : `You have a new paid booking request for ${intent.serviceName || 'a service'} on ${startDate}. Please respond to confirm or decline.`,
      }).catch(() => {});

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

  } else {
    // LEGACY FLOW: Just capture payment and update existing booking
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = 'captured';
    await payment.save();

    // Update existing booking's deposit status
    if (payment.metadata?.bookingId) {
      await Booking.findByIdAndUpdate(payment.metadata.bookingId, {
        depositPaid: true,
      });
    }
  }

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
      ...(booking && { bookingId: booking._id, bookingStatus: booking.status }),
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
  // Null-safe: populated refs can be null if the referenced document was deleted
  const payerIdStr = payment.payerId?._id?.toString() || payment.payerId?.toString();
  const recipientIdStr = payment.recipientId?._id?.toString() || payment.recipientId?.toString();
  const isAuthorized = payerIdStr === userId || recipientIdStr === userId;

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
  const { status, type = 'sent', limit: rawLimit = 20, page = 1, bookingId } = req.query;
  const limit = Math.min(Math.max(parseInt(rawLimit) || 20, 1), 100); // Clamp 1-100

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
    .limit(limit)
    .skip((parseInt(page) - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
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
/**
 * Request refund — creates a RefundRequest for admin review.
 * Previously this processed refunds directly via Razorpay, bypassing admin approval.
 * Now all refunds go through the admin-reviewed RefundRequest flow.
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

  if (payment.payerId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Only the payer can request a refund',
    });
  }

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

  const refundAmount = (typeof amount === 'number' && amount > 0) ? amount : payment.amount;
  if (refundAmount > payment.amount) {
    return res.status(400).json({
      success: false,
      message: 'Refund amount cannot exceed original payment amount',
    });
  }

  // Check for existing pending/approved refund requests on this payment
  const existingRefund = await RefundRequest.findOne({
    payment: paymentId,
    status: { $in: ['pending', 'approved', 'processing'] },
  }).lean();
  if (existingRefund) {
    return res.status(409).json({
      success: false,
      message: 'A refund request is already pending for this payment',
    });
  }

  // Create RefundRequest for admin review (do NOT process via Razorpay directly)
  const refundRequest = await RefundRequest.create({
    payment: paymentId,
    booking: payment.metadata?.bookingId || null,
    requestedBy: req.user._id,
    requestedByModel: req.accountType === 'artisan' ? 'Artisan' : 'User',
    amount: refundAmount,
    reason: reason || 'Refund requested by payer',
  });

  // Notify user
  await Notification.create({
    ownerId: req.user._id,
    ownerType: req.accountType === 'artisan' ? 'artisan' : 'user',
    title: 'Refund Request Submitted',
    text: `Your refund request for Rs.${refundAmount} is pending admin review.`,
    url: `/refunds/${refundRequest._id}`,
    read: false,
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Refund request submitted for review',
    data: {
      refundRequestId: refundRequest._id,
      amount: refundAmount,
      status: 'pending',
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

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: paymentData.order_id, status: { $ne: 'captured' } },
    update,
    { new: true }
  );

  // Update booking payment status if linked
  if (payment?.metadata?.bookingId) {
    await Booking.findByIdAndUpdate(payment.metadata.bookingId, {
      depositPaid: true,
    });
  }
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
  // Atomic update to prevent race conditions with concurrent webhook/API refund processing
  const payment = await Payment.findOneAndUpdate(
    { razorpayPaymentId: refundData.payment_id, status: { $ne: 'refunded' } },
    {
      $set: {
        status: 'refunded',
        refundId: refundData.id,
        refundAmount: refundData.amount / 100, // Convert from paise
        refundedAt: new Date(),
      },
    },
    { new: true }
  );

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
