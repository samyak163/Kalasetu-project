/**
 * @file reviewModel.js — Service Review & Rating Schema
 * @collection reviews
 *
 * Customer reviews of artisan services. Only customers (Users) can create reviews;
 * artisans can respond to reviews with a single reply.
 *
 * Key fields:
 *  - rating (1-5)      — Numeric star rating (required)
 *  - comment           — Review text (optional, max 1000 chars, default '')
 *  - images            — Optional photo evidence
 *  - tags              — Up to 5 short descriptor tags (e.g. "on-time", "skilled")
 *  - response          — Artisan's reply (text + timestamp)
 *  - helpfulVotes      — Array of User IDs who found this review helpful
 *  - isVerified        — Whether the review is from a verified purchase/booking
 *  - status            — Moderation state (active/flagged/removed)
 *
 * Uniqueness constraint:
 *  - Partial unique index on (user + booking) — One review per booking per user.
 *    The partial filter ensures the index only applies when booking is an ObjectId
 *    (allows reviews without a booking reference for backward-compat).
 *
 * @exports {Model} Review — Mongoose model
 *
 * @see controllers/reviewController.js — Review CRUD and moderation
 * @see models/artisanModel.js — averageRating and totalReviews (denormalized stats)
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  // Per-service reference — auto-populated from booking.service when creating a review.
  // Enables per-service rating aggregation without joining through bookings.
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtisanService' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxLength: 1000, trim: true, default: '' },
  images: [{ type: String }],
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: arr => arr.length >= 1 && arr.length <= 5,
      message: 'Select 1 to 5 tags',
    },
  },
  response: {
    text: { type: String, maxLength: 500 },
    createdAt: Date
  },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'flagged', 'removed'], default: 'active' }
}, { timestamps: true });

reviewSchema.index({ user: 1, booking: 1 }, { unique: true, partialFilterExpression: { booking: { $type: 'objectId' } } });
reviewSchema.index({ artisan: 1, status: 1 });
reviewSchema.index({ service: 1, status: 1 });

// Recalculate artisan's averageRating and totalReviews after review save
reviewSchema.post('save', async function () {
  try {
    const Review = this.constructor;
    const stats = await Review.aggregate([
      { $match: { artisan: this.artisan, status: 'active' } },
      {
        $group: {
          _id: '$artisan',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const Artisan = (await import('./artisanModel.js')).default;
    if (stats.length > 0) {
      await Artisan.findByIdAndUpdate(this.artisan, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await Artisan.findByIdAndUpdate(this.artisan, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    console.error('Failed to update artisan rating stats:', err.message);
  }
});

// Also recalculate after review update (status change, removal)
reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return;
  try {
    const Review = doc.constructor;
    const stats = await Review.aggregate([
      { $match: { artisan: doc.artisan, status: 'active' } },
      {
        $group: {
          _id: '$artisan',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const Artisan = (await import('./artisanModel.js')).default;
    if (stats.length > 0) {
      await Artisan.findByIdAndUpdate(doc.artisan, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await Artisan.findByIdAndUpdate(doc.artisan, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    console.error('Failed to update artisan rating stats:', err.message);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;