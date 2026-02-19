/**
 * @file refundRequestModel.js — Refund Request Schema
 * @collection refundrequests
 *
 * Tracks refund requests from users or artisans, processed by admins.
 * Each request references a Payment and optionally a Booking.
 *
 * Refund lifecycle (status flow):
 *  pending → approved → processing → processed   (successful refund)
 *  pending → rejected                              (admin declines)
 *  approved → processing → failed                  (Razorpay refund failed)
 *
 * Polymorphic requester (dual-auth aware):
 *  - requestedBy + requestedByModel — Either 'User' or 'Artisan' via refPath
 *
 * Admin response:
 *  - Embedded subdocument with adminId, action, reason, timestamp
 *
 * Evidence:
 *  - Array of supporting documents (images, PDFs, text descriptions)
 *
 * Razorpay tracking:
 *  - razorpayRefundId, razorpayRefundStatus — Set after Razorpay processes the refund
 *
 * @exports {Model} RefundRequest — Mongoose model
 *
 * @see controllers/refundController.js — Refund request creation and admin processing
 * @see models/paymentModel.js — The payment being refunded
 * @see models/bookingModel.js — The booking that triggered the refund
 */

import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'requestedByModel' },
  requestedByModel: { type: String, required: true, enum: ['User', 'Artisan'] },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true, maxlength: 1000 },
  evidence: [{
    type: { type: String, enum: ['image', 'document', 'text'] },
    url: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'processed', 'failed'],
    default: 'pending',
    index: true
  },
  adminResponse: {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    action: { type: String, enum: ['approved', 'rejected'] },
    reason: String,
    respondedAt: Date
  },
  razorpayRefundId: String,
  razorpayRefundStatus: String,
  processedAt: Date,
  failureReason: String
}, { timestamps: true });

// Compound indexes for performance
refundRequestSchema.index({ status: 1, createdAt: -1 });
refundRequestSchema.index({ payment: 1, status: 1 });
refundRequestSchema.index({ requestedBy: 1, createdAt: -1 });

const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);

export default RefundRequest;
