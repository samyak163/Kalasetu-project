import express from 'express';
import { getArtisanCustomers } from '../controllers/artisanCustomerController.js';

const router = express.Router();

// @route   GET /api/artisan/customers
// @desc    Get artisan's customers with booking statistics
// @access  Private (Artisan only - protect middleware applied in server.js)
router.get('/', getArtisanCustomers);

export default router;
