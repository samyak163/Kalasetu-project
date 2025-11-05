import express from 'express';
import { createReview, getArtisanReviews, toggleHelpful } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/artisan/:artisanId', getArtisanReviews);
router.post('/', protect, createReview);
router.post('/:id/helpful', protect, toggleHelpful);

export default router;


