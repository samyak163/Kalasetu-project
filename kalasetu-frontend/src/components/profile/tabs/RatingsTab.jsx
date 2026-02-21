import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import { Card, Badge, Alert, EmptyState, Skeleton, StarRating } from '../../ui';
import { Star, Info } from 'lucide-react';

const RatingsTab = ({ user }) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await api.get('/api/users/ratings');
      setRatings(res.data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" height="28px" width="200px" />
        <Skeleton variant="rect" height="160px" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rect" height="64px" />)}
        </div>
      </div>
    );
  }

  const overallRating = ratings?.overallRating || 0;
  const ratingsCount = ratings?.ratingsCount || 0;

  const categories = [
    { key: 'punctuality', label: 'Punctuality' },
    { key: 'courtesy', label: 'Courtesy & Behavior' },
    { key: 'generosity', label: 'Generosity' },
    { key: 'communication', label: 'Communication' },
    { key: 'propertyCare', label: 'Property Care' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Your Rating</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          See how artisans rate your interactions
        </p>
      </div>

      {/* Overall Rating */}
      <Card className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-gray-800 dark:to-gray-700 border-brand-100">
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-brand-600 dark:text-white mb-2">
            {overallRating > 0 ? overallRating.toFixed(1) : '—'}
          </div>
          {overallRating > 0 && (
            <StarRating value={Math.round(overallRating)} size="lg" readOnly />
          )}
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Based on {ratingsCount} {ratingsCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </Card>

      {/* Rating Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Rating Breakdown
        </h3>
        <div className="space-y-3">
          {categories.map(category => {
            const rating = ratings?.categories?.[category.key] || 0;
            const badgeStatus = rating >= 4 ? 'completed' : rating >= 3 ? 'pending' : rating > 0 ? 'cancelled' : undefined;
            return (
              <Card key={category.key} hover={false} compact>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.label}
                  </span>
                  <Badge status={badgeStatus}>
                    {rating > 0 ? rating.toFixed(1) : '—'}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-brand-500 dark:bg-brand-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(rating / 5) * 100}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Understanding Your Rating */}
      <Alert variant="info">
        <h3 className="font-semibold mb-2">Understanding Your Rating</h3>
        <ul className="space-y-1 text-sm">
          <li>Your rating is based on feedback from artisans you've hired</li>
          <li>Each category is weighted equally</li>
          <li>Minimum 3 completed bookings required for accurate rating</li>
          <li>Recent reviews (last 6 months) have more weight</li>
          <li>Ratings are updated after each completed service</li>
        </ul>
      </Alert>

      {/* Recent Reviews */}
      {ratings?.recentReviews && ratings.recentReviews.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Recent Reviews
          </h3>
          <div className="space-y-3">
            {ratings.recentReviews.map((review, idx) => (
              <Card key={idx} hover={false}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {review.artisanName || 'Artisan'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <StarRating value={review.rating} size="sm" readOnly />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Star className="h-12 w-12" />}
          title="No ratings yet"
          description="Complete your first booking to receive ratings from artisans!"
        />
      )}
    </div>
  );
};

export default RatingsTab;
