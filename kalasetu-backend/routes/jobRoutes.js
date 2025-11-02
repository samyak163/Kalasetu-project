import express from 'express';
import { handleJobWebhook } from '../controllers/jobController.js';

const router = express.Router();

// Webhook endpoint for QStash (no auth needed, verified by signature)
router.post('/webhook', handleJobWebhook);

export default router;
