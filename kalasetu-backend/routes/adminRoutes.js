/**
 * @file adminRoutes.js — Admin Panel Routes
 *
 * The largest route file — maps all admin dashboard, moderation, and
 * analytics endpoints. Every route requires protectAdmin (reads admin_token
 * cookie) plus a permission check via checkPermission(resource, action).
 *
 * Mounted at: /api/admin
 *
 * Auth routes (protectAdmin only):
 *  POST /auth/login           — Admin login (10/15min rate limit)
 *  GET  /auth/me              — Get admin profile
 *  POST /auth/logout          — Clear admin_token cookie
 *  PUT  /auth/change-password — Change admin password
 *  PUT  /auth/profile         — Update admin profile
 *
 * Dashboard:
 *  GET /dashboard/stats — Platform-wide statistics (analytics:view)
 *
 * Artisan management (artisans:*):
 *  GET    /artisans          — List all artisans with filters
 *  PUT    /artisans/:id/verify — Verify artisan identity
 *  PUT    /artisans/:id/status — Suspend/activate artisan
 *  DELETE /artisans/:id       — Delete artisan account
 *
 * User management:
 *  GET /users — List all users (users:view)
 *
 * Review moderation (reviews:*):
 *  GET    /reviews             — List all reviews
 *  GET    /reviews/stats       — Review statistics
 *  PUT    /reviews/:id/moderate — Flag/unflag review
 *  DELETE /reviews/:id          — Soft-delete review
 *  PATCH  /reviews/:id/restore  — Restore deleted review
 *
 * Payment management (payments:*):
 *  GET  /payments          — List all payments
 *  GET  /payments/stats    — Payment statistics
 *  POST /payments/:id/refund — Process admin-initiated refund
 *
 * Refund management (payments:*):
 *  GET  /refunds          — List refund requests
 *  GET  /refunds/stats    — Refund statistics
 *  POST /refunds/:id/approve — Approve refund request
 *  POST /refunds/:id/reject  — Reject refund request
 *
 * Booking management (bookings:*):
 *  GET   /bookings          — List all bookings
 *  GET   /bookings/stats    — Booking statistics
 *  PATCH /bookings/:id/cancel — Admin-cancel a booking
 *
 * Analytics (analytics:view):
 *  GET /analytics/revenue  — Revenue over time
 *  GET /analytics/users    — User growth analytics
 *  GET /analytics/bookings — Booking volume analytics
 *
 * Settings (settings:*):
 *  GET /settings — Get platform settings
 *  PUT /settings — Update platform settings
 *
 * Support (users:view):
 *  GET  /support/tickets          — List all tickets
 *  GET  /support/tickets/stats    — Ticket statistics
 *  GET  /support/tickets/:id      — Get ticket detail
 *  POST /support/tickets/:id/respond — Add admin response
 *  PATCH /support/tickets/:id/status — Change ticket status
 *
 * @see controllers/adminAuthController.js — Auth handlers
 * @see controllers/adminDashboardController.js — Dashboard handlers
 * @see middleware/authMiddleware.js — protectAdmin, checkPermission
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, logout, changePassword, updateProfile } from '../controllers/adminAuthController.js';
import {
  getDashboardStats,
  getAllArtisans,
  getAllUsers,
  verifyArtisan,
  updateArtisanStatus,
  deleteArtisan,
  getAllReviews,
  getReviewsStats,
  moderateReview,
  deleteReview,
  restoreReview,
  getAllPayments,
  getPaymentsStats,
  processRefund,
  getAllBookings,
  getBookingsStats,
  cancelBooking,
  getSettings,
  updateSettings,
  getAllRefundRequests,
  getRefundRequestsStats,
  approveRefundRequest,
  rejectRefundRequest,
  getAllSupportTickets,
  getSupportTicketsStats,
  getTicketById,
  respondToTicket,
  updateTicketStatus,
  getRevenueAnalytics,
  getUserAnalytics,
  getBookingAnalytics
} from '../controllers/adminDashboardController.js';
import { protectAdmin, checkPermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict rate limit on admin login to prevent brute-force
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/auth/login', adminLoginLimiter, login);
router.get('/auth/me', protectAdmin, getMe);
router.post('/auth/logout', protectAdmin, logout);
router.put('/auth/change-password', protectAdmin, changePassword);
router.put('/auth/profile', protectAdmin, updateProfile);

router.get('/dashboard/stats', protectAdmin, checkPermission('analytics', 'view'), getDashboardStats);

router.get('/artisans', protectAdmin, checkPermission('artisans', 'view'), getAllArtisans);
router.put('/artisans/:id/verify', protectAdmin, checkPermission('artisans', 'verify'), verifyArtisan);
router.put('/artisans/:id/status', protectAdmin, checkPermission('artisans', 'suspend'), updateArtisanStatus);
router.delete('/artisans/:id', protectAdmin, checkPermission('artisans', 'delete'), deleteArtisan);

router.get('/users', protectAdmin, checkPermission('users', 'view'), getAllUsers);

router.get('/reviews', protectAdmin, checkPermission('reviews', 'view'), getAllReviews);
router.get('/reviews/stats', protectAdmin, checkPermission('reviews', 'view'), getReviewsStats);
router.put('/reviews/:id/moderate', protectAdmin, checkPermission('reviews', 'moderate'), moderateReview);
router.delete('/reviews/:id', protectAdmin, checkPermission('reviews', 'delete'), deleteReview);
router.patch('/reviews/:id/restore', protectAdmin, checkPermission('reviews', 'moderate'), restoreReview);

router.get('/payments', protectAdmin, checkPermission('payments', 'view'), getAllPayments);
router.get('/payments/stats', protectAdmin, checkPermission('payments', 'view'), getPaymentsStats);
router.post('/payments/:id/refund', protectAdmin, checkPermission('payments', 'refund'), processRefund);

router.get('/refunds', protectAdmin, checkPermission('payments', 'view'), getAllRefundRequests);
router.get('/refunds/stats', protectAdmin, checkPermission('payments', 'view'), getRefundRequestsStats);
router.post('/refunds/:id/approve', protectAdmin, checkPermission('payments', 'refund'), approveRefundRequest);
router.post('/refunds/:id/reject', protectAdmin, checkPermission('payments', 'refund'), rejectRefundRequest);

router.get('/bookings', protectAdmin, checkPermission('bookings', 'view'), getAllBookings);
router.get('/bookings/stats', protectAdmin, checkPermission('bookings', 'view'), getBookingsStats);
router.patch('/bookings/:id/cancel', protectAdmin, checkPermission('bookings', 'cancel'), cancelBooking);

router.get('/analytics/revenue', protectAdmin, checkPermission('analytics', 'view'), getRevenueAnalytics);
router.get('/analytics/users', protectAdmin, checkPermission('analytics', 'view'), getUserAnalytics);
router.get('/analytics/bookings', protectAdmin, checkPermission('analytics', 'view'), getBookingAnalytics);

router.get('/settings', protectAdmin, checkPermission('settings', 'view'), getSettings);
router.put('/settings', protectAdmin, checkPermission('settings', 'edit'), updateSettings);

router.get('/support/tickets', protectAdmin, checkPermission('users', 'view'), getAllSupportTickets);
router.get('/support/tickets/stats', protectAdmin, checkPermission('users', 'view'), getSupportTicketsStats);
router.get('/support/tickets/:id', protectAdmin, checkPermission('users', 'view'), getTicketById);
// Write operations on tickets require 'edit' permission, not just 'view'
router.post('/support/tickets/:id/respond', protectAdmin, checkPermission('users', 'edit'), respondToTicket);
router.patch('/support/tickets/:id/status', protectAdmin, checkPermission('users', 'edit'), updateTicketStatus);

export default router;


