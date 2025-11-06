import express from 'express';
import { login, getMe, logout, changePassword } from '../controllers/adminAuthController.js';
import {
  getDashboardStats,
  getAllArtisans,
  getAllUsers,
  verifyArtisan,
  updateArtisanStatus,
  deleteArtisan,
  getAllReviews,
  moderateReview,
  deleteReview
} from '../controllers/adminDashboardController.js';
import { protectAdmin, checkPermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/login', login);
router.get('/auth/me', protectAdmin, getMe);
router.post('/auth/logout', protectAdmin, logout);
router.put('/auth/change-password', protectAdmin, changePassword);

router.get('/dashboard/stats', protectAdmin, checkPermission('analytics', 'view'), getDashboardStats);

router.get('/artisans', protectAdmin, checkPermission('artisans', 'view'), getAllArtisans);
router.put('/artisans/:id/verify', protectAdmin, checkPermission('artisans', 'verify'), verifyArtisan);
router.put('/artisans/:id/status', protectAdmin, checkPermission('artisans', 'suspend'), updateArtisanStatus);
router.delete('/artisans/:id', protectAdmin, checkPermission('artisans', 'delete'), deleteArtisan);

router.get('/users', protectAdmin, checkPermission('users', 'view'), getAllUsers);

router.get('/reviews', protectAdmin, checkPermission('reviews', 'view'), getAllReviews);
router.put('/reviews/:id/moderate', protectAdmin, checkPermission('reviews', 'moderate'), moderateReview);
router.delete('/reviews/:id', protectAdmin, checkPermission('reviews', 'delete'), deleteReview);

export default router;


