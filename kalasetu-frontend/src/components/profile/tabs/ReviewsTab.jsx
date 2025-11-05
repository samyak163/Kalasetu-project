import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';

const ReviewsTab = () => {
  const { showToast } = useContext(ToastContext);
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
      setLoading(false);
      // Placeholder data
      setStats({
        averageRating: 4.8,
        totalReviews: 156,
        fiveStar: 120,
        fourStar: 25,
        threeStar: 8,
        twoStar: 2,
        oneStar: 1
      });
      setReviews([
        {
          id: 1,
          USER: 'Sarah Johnson',
          rating: 5,
          comment: 'Excellent work! Very professional and punctual. Highly recommend!',
          service: 'Plumbing Repair',
          date: 'Jan 7, 2025',
          reply: null
        },
        {
          id: 2,
          USER: 'Raj Kumar',
          rating: 4,
          comment: 'Good service, but took slightly longer than expected.',
          service: 'Electrical Work',
          date: 'Jan 5, 2025',
          reply: 'Thank you for your feedback! We appreciate your patience.'
        }
      ]);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      showToast('Failed to load reviews', 'error');
      setLoading(false);
    }
  };

  const handleReply = (reviewId) => {
    if (!replyText.trim()) {
      showToast('Please enter a reply', 'error');
      return;
    }
    showToast('Reply posted successfully!', 'success');
    setReplyingTo(null);
    setReplyText('');
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews & Ratings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          See what USERs are saying about your services
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">USER Reviews</h3>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{review.USER}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">• {review.date}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{review.service}</div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>

                {review.reply ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-[#A55233]">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Your Reply:</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.reply}</p>
                  </div>
                ) : (
                  <>
                    {replyingTo === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#A55233] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(review.id)}
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
                        onClick={() => setReplyingTo(review.id)}
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
