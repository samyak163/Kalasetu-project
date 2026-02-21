/**
 * @file paymentModel.js — Razorpay Payment Transaction Schema
 * @collection payments
 *
 * Tracks every payment transaction processed through Razorpay.
 * Created when a user initiates checkout, updated by Razorpay webhooks
 * as the payment progresses through its lifecycle.
 *
 * Payment lifecycle (status flow):
 *  created → pending → authorized → captured   (successful payment)
 *  created → failed                              (payment failed)
 *  captured → refunded                           (full/partial refund)
 *
 * Polymorphic references (dual-auth aware):
 *  - payerId + payerModel       — Who paid (User or Artisan via refPath)
 *  - recipientId + recipientModel — Who receives (typically Artisan)
 *  This pattern lets both User and Artisan models be payer/recipient
 *  without separate foreign key fields for each.
 *
 * Razorpay fields:
 *  - razorpayOrderId   — Razorpay's order ID (created server-side)
 *  - razorpayPaymentId — Razorpay's payment ID (set after checkout)
 *  - webhookEventId    — Idempotency key to prevent duplicate webhook processing
 *
 * Refund tracking:
 *  - refundId, refundAmount, refundedAt — Set when a refund is processed
 *
 * @exports {Model} Payment — Mongoose model
 *
 * @see controllers/paymentController.js — Order creation, verification, webhooks
 * @see models/refundRequestModel.js — Refund requests reference this model
 * @see utils/razorpay.js — Razorpay SDK instance
 *
 * @security Webhook signatures MUST be verified before updating payment status.
 *           Never log razorpayPaymentId or payment details.
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'authorized', 'captured', 'refunded', 'failed'],
      default: 'created',
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'payerModel',
    },
    payerModel: {
      type: String,
      required: true,
      enum: ['Artisan', 'User'],
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipientModel',
    },
    recipientModel: {
      type: String,
      enum: ['Artisan', 'User'],
    },
    purpose: {
      type: String,
      enum: ['consultation', 'product_purchase', 'service', 'subscription', 'other'],
      required: true,
    },
    description: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    refundId: {
      type: String,
    },
    refundAmount: {
      type: Number,
    },
    refundedAt: {
      type: Date,
    },
    webhookEventId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ payerId: 1, status: 1 });
paymentSchema.index({ recipientId: 1, status: 1 });
paymentSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ webhookEventId: 1 }, { sparse: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
