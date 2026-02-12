import express from 'express';
import { protectAny } from '../middleware/authMiddleware.js';
import { createTicket, getUserTickets, getTicketById, addMessage } from '../controllers/supportController.js';

const router = express.Router();

router.post('/', protectAny, createTicket);
router.get('/', protectAny, getUserTickets);
router.get('/:id', protectAny, getTicketById);
router.post('/:id/messages', protectAny, addMessage);

export default router;
