/**
 * @file artisanCustomerRoutes.js — Artisan Customer Management Routes
 *
 * Single endpoint that returns the artisan's customers with booking
 * statistics (total bookings, total spent, last booking date).
 * Auth (protect) is applied at mount level in server.js.
 *
 * Mounted at: /api/artisan/customers (protect applied in server.js)
 *
 * Routes:
 *  GET / — List artisan's customers with booking stats
 *
 * @see controllers/artisanCustomerController.js — Handler implementation
 */
import express from 'express';
import { getArtisanCustomers } from '../controllers/artisanCustomerController.js';

const router = express.Router();

// @route   GET /api/artisan/customers
// @desc    Get artisan's customers with booking statistics
// @access  Private (Artisan only - protect middleware applied in server.js)
router.get('/', getArtisanCustomers);

export default router;
