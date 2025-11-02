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
    razorpaySignature: {
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

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
