import express from 'express';
import { getDashboardStats } from '../controllers/artisanDashboardController.js';

const router = express.Router();

// @route   GET /api/artisan/dashboard/stats
// @desc    Get artisan dashboard statistics
// @access  Private (Artisan only - protect middleware applied in server.js)
router.get('/stats', getDashboardStats);

export default router;
