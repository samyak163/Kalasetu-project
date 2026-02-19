/**
 * @file reviewRoutes.js — Review System Routes
 *
 * Artisan review lifecycle: public listing, customer submission, artisan
 * response, and "helpful" voting. Uses all three auth middlewares based
 * on which party performs the action.
 *
 * Mounted at: /api/reviews
 *
 * Public:
 *  GET /artisan/:artisanId — List reviews for an artisan (with pagination)
 *
 * User only (userProtect):
 *  POST / — Create a review (must have completed booking)
 *
 * Artisan only (protect):
 *  PATCH /:id/respond — Add artisan response to a review
 *
 * Either party (protectAny):
 *  POST /:id/helpful — Toggle "helpful" vote on a review
 *
 * @see controllers/reviewController.js — Handler implementations
 * @see models/reviewModel.js — Review schema with response embedding
 */
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


