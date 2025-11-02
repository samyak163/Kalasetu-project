import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';

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

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-2xl">
            {i < full ? '★' : i === full && hasHalf ? '☆' : '☆'}
          </span>
        ))}
        <span className="ml-2 text-gray-600 dark:text-gray-400">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading ratings...</div>;
  }

  const overallRating = ratings?.overallRating || 0;
  const ratingsCount = ratings?.ratingsCount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Rating</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          See how artisans rate your interactions
        </p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-r from-[#F3E9E5] to-[#E6D4CD] dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-[#A55233] dark:text-white mb-2">
            {overallRating > 0 ? overallRating.toFixed(1) : '—'}
          </div>
          {renderStars(overallRating)}
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Based on {ratingsCount} {ratingsCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Rating Breakdown
        </h3>
        <div className="space-y-4">
          {[
            { key: 'punctuality', label: 'Punctuality' },
            { key: 'courtesy', label: 'Courtesy & Behavior' },
            { key: 'generosity', label: 'Generosity' },
            { key: 'communication', label: 'Communication' },
            { key: 'propertyCare', label: 'Property Care' },
          ].map(category => {
            const rating = ratings?.categories?.[category.key] || 0;
            return (
              <div key={category.key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {category.label}
                  </span>
                  <span className="text-lg font-semibold text-[#A55233] dark:text-[#D4A574]">
                    {rating > 0 ? rating.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#A55233] dark:bg-[#D4A574] h-2 rounded-full transition-all"
                    style={{ width: `${(rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Understanding Your Rating */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
          Understanding Your Rating
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li>• Your rating is based on feedback from artisans you've hired</li>
          <li>• Each category is weighted equally</li>
          <li>• Minimum 3 completed bookings required for accurate rating</li>
          <li>• Recent reviews (last 6 months) have more weight</li>
          <li>• Ratings are updated after each completed service</li>
        </ul>
      </div>

      {/* Recent Reviews */}
      {ratings?.recentReviews && ratings.recentReviews.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Reviews
          </h3>
          <div className="space-y-4">
            {ratings.recentReviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.artisanName || 'Artisan'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>{renderStars(review.rating)}</div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No ratings yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Complete your first booking to receive ratings from artisans!
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingsTab;
