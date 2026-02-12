import express from 'express';
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
  updateTicketStatus
} from '../controllers/adminDashboardController.js';
import { protectAdmin, checkPermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/login', login);
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

router.get('/settings', protectAdmin, checkPermission('settings', 'view'), getSettings);
router.put('/settings', protectAdmin, checkPermission('settings', 'edit'), updateSettings);

router.get('/support/tickets', protectAdmin, checkPermission('users', 'view'), getAllSupportTickets);
router.get('/support/tickets/stats', protectAdmin, checkPermission('users', 'view'), getSupportTicketsStats);
router.get('/support/tickets/:id', protectAdmin, checkPermission('users', 'view'), getTicketById);
router.post('/support/tickets/:id/respond', protectAdmin, checkPermission('users', 'view'), respondToTicket);
router.patch('/support/tickets/:id/status', protectAdmin, checkPermission('users', 'view'), updateTicketStatus);

export default router;


