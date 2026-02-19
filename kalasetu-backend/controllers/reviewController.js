/**
 * @file reviewController.js — Service Reviews & Ratings
 *
 * Handles review creation, listing, and artisan responses.
 * Only CUSTOMERS (Users) can create reviews; artisans can respond.
 *
 * Endpoints:
 *  POST /api/reviews              — Create a review (userProtect — customers only)
 *  GET  /api/reviews/artisan/:id  — Get reviews for an artisan (public)
 *  PATCH /api/reviews/:id/respond — Artisan responds to a review (protect)
 *  POST  /api/reviews/:id/helpful — Vote a review as helpful (protectAny)
 *
 * On review creation, the artisan's averageRating and totalReviews are
 * recalculated via aggregation and denormalized onto the Artisan document.
 *
 * @see models/reviewModel.js — Review schema with partial unique index
 * @see models/artisanModel.js — averageRating, totalReviews (denormalized)
 */

import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';
import Review from '../models/reviewModel.js';
import Artisan from '../models/artisanModel.js';
import Booking from '../models/bookingModel.js';
import { sendEmail } from '../utils/email.js';

// --- Review tag constants (must match frontend constants/reviewTags.js) ---
const POSITIVE_TAGS = [
  'Excellent Craftsmanship', 'On Time', 'True to Photos',
  'Great Communication', 'Exceeded Expectations', 'Patient & Helpful', 'Clean Workshop',
];
const NEGATIVE_TAGS = [
  'Delayed', 'Different from Photos', 'Poor Packaging', 'Unresponsive', 'Overpriced',
];
const ALL_TAGS = [...POSITIVE_TAGS, ...NEGATIVE_TAGS];

function getAllowedTags(rating) {
  if (rating >= 4) return POSITIVE_TAGS;
  if (rating <= 2) return NEGATIVE_TAGS;
  return ALL_TAGS;
}

const createReviewSchema = z.object({
  artisanId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid artisan ID'),
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be under 1000 characters').optional().default(''),
  images: z.array(z.string().url()).max(3).optional(),
  tags: z.array(z.string()).min(1, 'Select at least 1 tag').max(5, 'Maximum 5 tags'),
});

export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
  }
  const { artisanId, bookingId, rating, comment, images = [], tags } = parsed.data;

  // Validate tags against rating-dependent allowed list
  const allowed = getAllowedTags(rating);
  const invalidTags = tags.filter(t => !allowed.includes(t));
  if (invalidTags.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid tags for ${rating}-star rating: ${invalidTags.join(', ')}`,
    });
  }

  // Check if user has a completed booking with this artisan (required for review)
  const bookingQuery = {
    artisan: artisanId,
    user: userId,
    status: 'completed',
  };

  // If bookingId is provided, verify it belongs to the user and artisan
  if (bookingId) {
    bookingQuery._id = bookingId;
  }

  const validBooking = await Booking.findOne(bookingQuery).lean();

  if (!validBooking) {
    return res.status(403).json({
      success: false,
      message: 'You can only leave a review for artisans you have booked and completed services with.',
    });
  }

  // Check if user already reviewed this artisan for this booking
  const existingReview = await Review.findOne({
    artisan: artisanId,
    user: userId,
    booking: bookingId || validBooking._id,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this booking.',
    });
  }

  // Create review with verified booking (mark as verified since booking exists)
  // Auto-populate service from booking for per-service rating aggregation
  const review = await Review.create({
    artisan: artisanId,
    user: userId,
    booking: bookingId || validBooking._id,
    service: validBooking.service || undefined,
    rating,
    comment,
    images,
    tags,
    isVerified: true, // Verified purchase - user has completed booking
  });

  await recomputeRating(artisanId);
  
  // Send email notification to artisan (non-blocking, errors won't crash the request)
  try {
    const artisan = await Artisan.findById(artisanId).select('email fullName').lean();
    if (artisan?.email) {
      await sendEmail({
        to: artisan.email,
        subject: 'You received a new review on KalaSetu',
        text: `You have a new review: ${rating}★\n\n${comment || ''}`,
      });
    }
  } catch (emailError) {
    // Log error but don't fail the review creation
    console.error('Failed to send review notification email:', emailError);
  }
  
  res.status(201).json({ success: true, data: review });
});

export const getArtisanReviews = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(artisanId)) {
    return res.status(400).json({ success: false, message: 'Invalid artisan ID' });
  }
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const sort = req.query.sort || 'recent';
  const star = req.query.star ? Number(req.query.star) : null;
  const filter = { artisan: artisanId, status: 'active' };
  if (star && star >= 1 && star <= 5) filter.rating = star;

  // "helpful" sort requires aggregation to sort by array length, not first element
  if (sort === 'helpful') {
    const objectId = new mongoose.Types.ObjectId(artisanId);
    const matchStage = { artisan: objectId, status: 'active' };
    if (star && star >= 1 && star <= 5) matchStage.rating = star;
    const reviews = await Review.aggregate([
      { $match: matchStage },
      { $addFields: { helpfulCount: { $size: { $ifNull: ['$helpfulVotes', []] } } } },
      { $sort: { helpfulCount: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
    // Populate user fields on aggregation results
    await Review.populate(reviews, { path: 'user', select: 'fullName profileImageUrl' });
    const count = await Review.countDocuments(filter);
    return res.json({ success: true, data: reviews, count });
  }

  const sortMap = { recent: { createdAt: -1 }, rating: { rating: -1 } };
  const reviews = await Review.find(filter)
    .populate('user', 'fullName profileImageUrl')
    .sort(sortMap[sort] || sortMap.recent)
    .skip((page - 1) * limit)
    .limit(limit);
  const count = await Review.countDocuments(filter);
  res.json({ success: true, data: reviews, count });
});

/**
 * GET /api/reviews/artisan/:artisanId/tags
 * Returns aggregated tag counts for an artisan — public endpoint.
 */
export const getArtisanTags = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(artisanId)) {
    return res.status(400).json({ success: false, message: 'Invalid artisan ID' });
  }
  const objectId = new mongoose.Types.ObjectId(artisanId);

  const tags = await Review.aggregate([
    { $match: { artisan: objectId, status: 'active', tags: { $exists: true, $ne: [] } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: {
      _id: 0,
      tag: '$_id',
      count: 1,
      sentiment: {
        $cond: {
          if: { $in: ['$_id', POSITIVE_TAGS] },
          then: 'positive',
          else: { $cond: { if: { $in: ['$_id', NEGATIVE_TAGS] }, then: 'negative', else: 'neutral' } },
        },
      },
    }},
  ]);

  res.json({ success: true, data: tags });
});

// Artisan responds to a review on their profile
const respondToReviewSchema = z.object({
  text: z.string().trim().min(1, 'Response cannot be empty').max(500, 'Response must be under 500 characters'),
});

export const respondToReview = asyncHandler(async (req, res) => {
  const artisanId = req.user._id || req.user.id;
  const { id } = req.params;

  const parsed = respondToReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
  }

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  // Only the reviewed artisan can respond
  if (String(review.artisan) !== String(artisanId)) {
    return res.status(403).json({ success: false, message: 'You can only respond to reviews on your profile' });
  }

  if (review.response?.text) {
    return res.status(400).json({ success: false, message: 'You have already responded to this review' });
  }

  review.response = { text: parsed.data.text, createdAt: new Date() };
  await review.save();

  res.json({ success: true, data: review });
});

export const toggleHelpful = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;
  const r = await Review.findById(id);
  if (!r) return res.status(404).json({ success: false, message: 'Not found' });
  const has = r.helpfulVotes.some(u => String(u) === String(userId));
  r.helpfulVotes = has ? r.helpfulVotes.filter(u => String(u) !== String(userId)) : [...r.helpfulVotes, userId];
  await r.save();
  res.json({ success: true });
});

async function recomputeRating(artisanId) {
  // Convert to ObjectId for aggregation pipeline (string IDs won't match)
  const objectId = new mongoose.Types.ObjectId(artisanId);
  const result = await Review.aggregate([
    { $match: { artisan: objectId, status: 'active' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const average = result.length ? Number(result[0].avg.toFixed(1)) : 0;
  const count = result.length ? result[0].count : 0;

  await Artisan.findByIdAndUpdate(artisanId, { $set: { averageRating: average, totalReviews: count } });
}


