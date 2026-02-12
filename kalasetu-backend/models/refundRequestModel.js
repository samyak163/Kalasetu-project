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
