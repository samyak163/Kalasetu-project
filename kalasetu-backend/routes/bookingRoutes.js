import express from 'express';
import { protect, protectAny } from '../middleware/authMiddleware.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createBooking, getMyBookings, getArtisanBookings, cancelBooking, respondToBooking, completeBooking, requestModification, respondToModification } from '../controllers/bookingController.js';

const router = express.Router();

// User creates a booking and views their bookings
router.post('/', userProtect, asyncHandler(createBooking));
router.get('/me', userProtect, asyncHandler(getMyBookings));

// Artisan views bookings
router.get('/artisan', protect, asyncHandler(getArtisanBookings));

// Artisan responds to booking
router.patch('/:id/respond', protect, asyncHandler(respondToBooking));

// Artisan marks booking as completed
router.patch('/:id/complete', protect, asyncHandler(completeBooking));

// Modification requests (either party can request, the other responds)
router.post('/:id/modify', protectAny, asyncHandler(requestModification));
router.patch('/:id/modify/respond', protectAny, asyncHandler(respondToModification));

// Cancel booking (user or artisan who owns it)
router.post('/:id/cancel', protectAny, asyncHandler(cancelBooking));

export default router;


