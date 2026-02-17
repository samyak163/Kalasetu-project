import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../lib/axios.js';
import { LoadingState } from '../../ui';

const ReviewsTab = () => {
  const { showToast } = useContext(ToastContext);
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      if (!user?._id) {
        throw new Error('User not authenticated');
      }
      
      // Fetch real reviews from backend
      const response = await api.get(`/api/reviews/artisan/${user._id}`);
      if (response.data.success) {
        const fetchedReviews = response.data.data || [];
        setReviews(fetchedReviews);
        
        // Calculate stats from reviews
        const totalReviews = fetchedReviews.length;
        if (totalReviews > 0) {
          const avgRating = fetchedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
          const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          for (const r of fetchedReviews) {
            if (r.rating >= 1 && r.rating <= 5) {
              ratingCounts[r.rating]++;
            }
          }
          
          setStats({
            averageRating: avgRating,
            totalReviews,
            oneStar: ratingCounts[1],
            twoStar: ratingCounts[2],
            threeStar: ratingCounts[3],
            fourStar: ratingCounts[4],
            fiveStar: ratingCounts[5]
          });
        } else {
          setStats({
            averageRating: 0,
            totalReviews: 0,
            oneStar: 0,
            twoStar: 0,
            threeStar: 0,
            fourStar: 0,
            fiveStar: 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      showToast(error.response?.data?.message || 'Failed to load reviews', 'error');
      setReviews([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      showToast('Please enter a reply', 'error');
      return;
    }
    try {
      const res = await api.patch(`/api/reviews/${reviewId}/respond`, { text: replyText.trim() });
      if (res.data.success) {
        // Update the review in local state with the response
        setReviews(prev => prev.map(r =>
          r._id === reviewId ? { ...r, response: res.data.data.response } : r
        ));
        showToast('Reply posted successfully!', 'success');
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to post reply', 'error');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const getRatingPercentage = (count) => {
    return stats ? Math.round((count / stats.totalReviews) * 100) : 0;
  };

  if (loading) {
    return <LoadingState message="Loading reviews..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
        <p className="text-sm text-gray-500 mt-1">
          See what clients are saying about your services
        </p>
      </div>

      {/* Rating Overview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {stats?.averageRating?.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">{renderStars(Math.round(stats?.averageRating))}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Based on {stats?.totalReviews} reviews
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats?.[`${['oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar'][star - 1]}`] || 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                    {star} ⭐
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${getRatingPercentage(count)}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Reviews</h3>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id || review.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{review.user?.fullName || 'Anonymous'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {review.isVerified && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Verified</div>
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>

                {review.response?.text ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-[#A55233]">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Your Reply:</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.response.text}</p>
                  </div>
                ) : (
                  <>
                    {replyingTo === review._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#A55233] bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(review._id)}
                            className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8a4329] text-sm"
                          >
                            Post Reply
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(review._id)}
                        className="text-sm text-[#A55233] hover:underline"
                      >
                        Reply to this review
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete bookings to start receiving reviews
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
