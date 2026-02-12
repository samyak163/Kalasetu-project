import { z } from 'zod';
import SupportTicket from '../models/supportTicketModel.js';
import Notification from '../models/notificationModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// Zod schemas for validation
const createTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be at most 5000 characters'),
  category: z.enum(['booking', 'payment', 'refund', 'technical', 'account', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  relatedEntities: z.object({
    booking: z.string().optional(),
    payment: z.string().optional(),
    refundRequest: z.string().optional()
  }).optional()
});

const addMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message must be at most 5000 characters')
});

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Protected (User or Artisan)
export const createTicket = asyncHandler(async (req, res) => {
  const validation = createTicketSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400);
    throw new Error(validation.error.errors[0].message);
  }

  const { subject, description, category, priority, relatedEntities } = validation.data;

  const ticket = await SupportTicket.create({
    subject,
    description,
    category,
    priority: priority || 'medium',
    createdBy: {
      userId: req.user._id,
      userModel: req.accountType === 'artisan' ? 'Artisan' : 'User',
      userName: req.user.fullName,
      userEmail: req.user.email
    },
    relatedEntities: relatedEntities || {}
  });

  // Create in-app notification for user confirming ticket creation
  try {
    await Notification.create({
      ownerId: req.user._id,
      ownerType: req.accountType === 'artisan' ? 'artisan' : 'user',
      title: 'Support Ticket Created',
      text: `Your support ticket "${subject}" has been created. Ticket number: ${ticket.ticketNumber}`,
      url: `/support/tickets/${ticket._id}`,
      read: false
    });
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
    // Non-blocking - continue
  }

  res.status(201).json({
    success: true,
    message: 'Support ticket created successfully',
    data: ticket
  });
});

// @desc    Get all tickets for the authenticated user
// @route   GET /api/support
// @access  Protected (User or Artisan)
export const getUserTickets = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = { 'createdBy.userId': req.user._id };

  if (status && status !== 'all') {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await SupportTicket.countDocuments(query);

  const tickets = await SupportTicket.find(query)
    .select('-messages') // Exclude messages from list for performance
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: tickets,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get a single ticket by ID with all messages
// @route   GET /api/support/:id
// @access  Protected (User or Artisan)
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('assignedTo', 'fullName');

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Verify ownership
  if (ticket.createdBy.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this ticket');
  }

  // Filter out internal notes (admin-only)
  const filteredTicket = ticket.toObject();
  filteredTicket.messages = filteredTicket.messages.filter(msg => !msg.internal);

  res.status(200).json({
    success: true,
    data: filteredTicket
  });
});

// @desc    Add a message to a ticket
// @route   POST /api/support/:id/messages
// @access  Protected (User or Artisan)
export const addMessage = asyncHandler(async (req, res) => {
  const validation = addMessageSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400);
    throw new Error(validation.error.errors[0].message);
  }

  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Verify ownership
  if (ticket.createdBy.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this ticket');
  }

  // Check if ticket is resolved or closed
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    res.status(400);
    throw new Error(`Cannot add messages to a ${ticket.status} ticket`);
  }

  // Check message limit (soft limit)
  if (ticket.messages.length >= 100) {
    res.status(400);
    throw new Error('Message limit reached for this ticket. Please create a new ticket.');
  }

  const newMessage = {
    sender: {
      senderId: req.user._id,
      senderModel: req.accountType === 'artisan' ? 'Artisan' : 'User',
      senderName: req.user.fullName
    },
    message: validation.data.message,
    internal: false
  };

  ticket.messages.push(newMessage);
  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Message added successfully',
    data: newMessage
  });
});

// @desc    Helper function to create a ticket programmatically (for stub wiring)
// @param   {Object} userData - User data object with _id, fullName, email
// @param   {String} subject - Ticket subject
// @param   {String} description - Ticket description
// @param   {String} category - Ticket category
// @returns {Promise<Object>} Created ticket
export const createTicketFromStub = async (userData, subject, description, category) => {
  const ticket = await SupportTicket.create({
    subject,
    description,
    category,
    priority: 'medium',
    createdBy: {
      userId: userData._id,
      userModel: 'User',
      userName: userData.fullName,
      userEmail: userData.email
    }
  });

  return ticket;
};
