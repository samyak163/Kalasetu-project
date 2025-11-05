import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createBooking, getMyBookings, getArtisanBookings, cancelBooking } from '../controllers/bookingController.js';

const router = express.Router();

// User creates a booking and views their bookings
router.post('/', protect, asyncHandler(createBooking));
router.get('/me', protect, asyncHandler(getMyBookings));

// Artisan views bookings
router.get('/artisan', protect, asyncHandler(getArtisanBookings));

// Cancel booking (user or artisan who owns it)
router.post('/:id/cancel', protect, asyncHandler(cancelBooking));

export default router;


