/**
 * @file supportRoutes.js — Support Ticket Routes (User-Facing)
 *
 * User/artisan-facing support ticket endpoints. Both artisans and
 * customers can create and manage tickets (protectAny). Admin-side
 * ticket management is handled via adminRoutes.js.
 *
 * Mounted at: /api/support
 *
 * Routes (all protectAny):
 *  POST /              — Create a new support ticket
 *  GET  /              — List user's own tickets (paginated)
 *  GET  /:id           — Get ticket with messages (internal notes filtered out)
 *  POST /:id/messages  — Add a message to a ticket thread
 *
 * @see controllers/supportController.js — Handler implementations
 * @see routes/adminRoutes.js — Admin ticket management
 * @see models/supportTicketModel.js — Ticket schema with embedded messages
 */
import express from 'express';
import { protectAny } from '../middleware/authMiddleware.js';
import { createTicket, getUserTickets, getTicketById, addMessage } from '../controllers/supportController.js';

const router = express.Router();

router.post('/', protectAny, createTicket);
router.get('/', protectAny, getUserTickets);
router.get('/:id', protectAny, getTicketById);
router.post('/:id/messages', protectAny, addMessage);

export default router;
