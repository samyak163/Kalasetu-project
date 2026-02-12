import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderModel: { type: String, enum: ['User', 'Artisan', 'Admin'], required: true },
    senderName: String
  },
  message: { type: String, required: true, maxlength: 5000 },
  attachments: [{
    url: String,
    filename: String,
    type: String
  }],
  internal: { type: Boolean, default: false }
}, { timestamps: true });

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true },
  subject: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  category: {
    type: String,
    enum: ['booking', 'payment', 'refund', 'technical', 'account', 'other'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userModel: { type: String, enum: ['User', 'Artisan'], required: true },
    userName: String,
    userEmail: String
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', index: true },
  messages: [messageSchema],
  relatedEntities: {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    refundRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'RefundRequest' }
  },
  resolvedAt: Date,
  closedAt: Date,
  closedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    userModel: String
  }
}, { timestamps: true });

// Compound indexes for efficient queries
supportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
supportTicketSchema.index({ category: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ 'createdBy.userId': 1, status: 1 });

// Auto-generate ticketNumber before saving
supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now();
    const count = await this.constructor.countDocuments();
    const paddedCount = String(count + 1).padStart(5, '0');
    this.ticketNumber = `TKT-${timestamp}-${paddedCount}`;
  }
  next();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
