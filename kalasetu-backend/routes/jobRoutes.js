/**
 * @file jobRoutes.js — Background Job Webhook Routes
 *
 * Receives callbacks from QStash for scheduled background jobs.
 * No auth middleware — QStash requests are verified by signature
 * in the controller before processing.
 *
 * Mounted at: /api/jobs
 *
 * Routes:
 *  POST /webhook — QStash webhook callback (signature-verified)
 *
 * @see controllers/jobController.js — Webhook handler + signature verification
 * @see jobs/jobHandlers.js — Registered job handler functions
 */
import express from 'express';
import { handleJobWebhook } from '../controllers/jobController.js';

const router = express.Router();

// Webhook endpoint for QStash (no auth needed, verified by signature)
router.post('/webhook', handleJobWebhook);

export default router;
