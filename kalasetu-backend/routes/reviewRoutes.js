import express from 'express';
import { createReview, getArtisanReviews, respondToReview, toggleHelpful } from '../controllers/reviewController.js';
import { protect, protectAny } from '../middleware/authMiddleware.js';
import { userProtect } from '../middleware/userProtectMiddleware.js';

const router = express.Router();

router.get('/artisan/:artisanId', getArtisanReviews);
router.post('/', userProtect, createReview);
router.patch('/:id/respond', protect, respondToReview);
router.post('/:id/helpful', protectAny, toggleHelpful);

export default router;


