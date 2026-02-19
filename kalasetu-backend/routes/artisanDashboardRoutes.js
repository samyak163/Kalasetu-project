/**
 * @file artisanDashboardRoutes.js — Artisan Dashboard Routes
 *
 * Serves artisan-facing analytics: booking stats, income reports, and
 * profile verification checklist. Auth (protect) is applied at mount
 * level in server.js, not repeated here.
 *
 * Mounted at: /api/artisan/dashboard (protect applied in server.js)
 *
 * Routes:
 *  GET /stats               — Dashboard statistics (bookings, revenue, ratings)
 *  GET /income-report       — Income grouped by period (?period=monthly|weekly)
 *  GET /verification-status — Profile completeness checklist
 *
 * @see controllers/artisanDashboardController.js — Handler implementations
 */
import express from 'express';
import { getDashboardStats, getIncomeReport, getProfileVerificationStatus } from '../controllers/artisanDashboardController.js';

const router = express.Router();

// @route   GET /api/artisan/dashboard/stats
// @desc    Get artisan dashboard statistics
// @access  Private (Artisan only - protect middleware applied in server.js)
router.get('/stats', getDashboardStats);

// @route   GET /api/artisan/dashboard/income-report?period=monthly|weekly
// @desc    Get artisan income report grouped by time period
// @access  Private (Artisan only)
router.get('/income-report', getIncomeReport);

// @route   GET /api/artisan/dashboard/verification-status
// @desc    Get artisan profile completeness checklist
// @access  Private (Artisan only)
router.get('/verification-status', getProfileVerificationStatus);

export default router;
