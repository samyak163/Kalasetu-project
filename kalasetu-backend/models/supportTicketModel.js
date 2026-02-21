/**
 * @file supportTicketModel.js — Support Ticket Schema
 * @collection supporttickets
 *
 * Help desk system for users and artisans to report issues,
 * ask questions, and request assistance. Managed by admins.
 *
 * Two sub-schemas:
 *  1. messageSchema       — Individual messages within a ticket thread
 *  2. supportTicketSchema — The ticket itself with metadata and message history
 *
 * Ticket lifecycle (status flow):
 *  open → in_progress → resolved → closed
 *
 * Polymorphic creator (dual-auth aware):
 *  - createdBy.userId + createdBy.userModel — Either 'User' or 'Artisan'
 *
 * Message thread:
 *  - Each ticket has an embedded messages array (not a separate collection)
 *  - Messages can have attachments (images, documents)
 *  - internal:true messages are admin-only notes (not visible to the ticket creator)
 *
 * Related entities:
 *  - Optional references to Booking, Payment, RefundRequest for context
 *
 * Auto-generated ticket numbers: TKT-{timestamp}-{00001} via pre('save') hook
 *
 * @exports {Model} SupportTicket — Mongoose model
 *
 * @see controllers/supportController.js — Ticket creation and management
 * @see pages/admin/AdminSupport.jsx — Admin ticket management UI
 */

import mongoose from 'mongoose';
import crypto from 'crypto';

/** Sub-schema for individual messages within a support ticket thread */
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
// Uses crypto.randomBytes instead of countDocuments to avoid race conditions
// when two tickets are created simultaneously
supportTicketSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now();
    const rand = crypto.randomBytes(3).toString('hex');
    this.ticketNumber = `TKT-${timestamp}-${rand}`;
  }
  next();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
