/**
 * @file bookingRoutes.js — Booking Lifecycle Routes
 *
 * Full booking lifecycle from creation through completion/cancellation,
 * including modification request negotiation. Uses all three auth
 * middlewares depending on which party (user, artisan, or either) acts.
 *
 * Mounted at: /api/bookings
 *
 * User routes (userProtect):
 *  POST /     — Create a new booking
 *  GET  /me   — List user's bookings
 *
 * Artisan routes (protect):
 *  GET   /artisan       — List artisan's bookings
 *  PATCH /:id/respond   — Accept/reject booking request
 *  PATCH /:id/complete  — Mark booking as completed
 *
 * Shared routes (protectAny — either user or artisan):
 *  POST  /:id/modify          — Request modification (reschedule, etc.)
 *  PATCH /:id/modify/respond  — Accept/reject modification request
 *  POST  /:id/cancel          — Cancel booking (owner only)
 *
 * @see controllers/bookingController.js — Handler implementations
 * @see models/bookingModel.js — Booking schema with status flow
 */
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


