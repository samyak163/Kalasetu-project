import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../lib/axios.js';
import { Card, Skeleton, StarRating, FilterChips, EmptyState, Button, Input } from '../../ui';
import ReviewCard from '../../ui/ReviewCard.jsx';
import { Star, MessageSquare } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'recent', label: 'Recent' },
  { key: 'highest', label: 'Highest' },
  { key: 'lowest', label: 'Lowest' },
  { key: 'needs-reply', label: 'Needs Reply' },
];

const ReviewsTab = () => {
  const { showToast } = useContext(ToastContext);
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!user?._id) return;

      const [reviewsRes, tagsRes] = await Promise.all([
        api.get(`/api/reviews/artisan/${user._id}`),
        api.get(`/api/reviews/artisan/${user._id}/tags`).catch(() => ({ data: { data: [] } })),
      ]);

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data || []);
      }
      setTags(tagsRes.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load reviews', 'error');
      setReviews([]);
      setTags([]);
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
      setReplyLoading(true);
      const res = await api.patch(`/api/reviews/${reviewId}/respond`, { text: replyText.trim() });
      if (res.data.success) {
        setReviews(prev => prev.map(r =>
          r._id === reviewId ? { ...r, response: res.data.data.response } : r
        ));
        showToast('Reply posted successfully!', 'success');
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post reply', 'error');
    } finally {
      setReplyLoading(false);
    }
  };

  // Compute stats from reviews
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating]++;
  }

  // Sort/filter reviews
  const getSortedReviews = () => {
    let sorted = [...reviews];
    switch (sortBy) {
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'needs-reply':
        sorted = sorted.filter(r => !r.response?.text);
        break;
      default: // recent
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  };

  const sortedReviews = getSortedReviews();

  const filterChips = SORT_OPTIONS.map(opt => ({
    key: opt.key,
    label: opt.key === 'needs-reply'
      ? `Needs Reply (${reviews.filter(r => !r.response?.text).length})`
      : opt.label,
    active: sortBy === opt.key,
    onClick: () => setSortBy(opt.key),
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" height="28px" width="200px" />
        <Skeleton variant="rect" height="160px" />
        <Skeleton variant="rect" height="200px" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">Reviews & Ratings</h2>
        <p className="text-sm text-gray-500 mt-1">See what clients are saying about your services</p>
      </div>

      {/* Rating overview */}
      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall rating */}
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900 mb-2">{avgRating.toFixed(1)}</p>
            <div className="flex justify-center mb-2">
              <StarRating value={Math.round(avgRating)} size="md" readOnly showLabel={false} />
            </div>
            <p className="text-sm text-gray-500">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingCounts[star];
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-6 text-right">{star}</span>
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Tag summary */}
      {tags.length > 0 && (
        <Card hover={false}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Common Feedback Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <span
                key={t.tag}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  t.sentiment === 'positive' ? 'bg-success-50 text-success-700'
                    : t.sentiment === 'negative' ? 'bg-error-50 text-error-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t.tag} ({t.count})
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Filter chips */}
      <FilterChips chips={filterChips} />

      {/* Reviews list */}
      {sortedReviews.length > 0 ? (
        <Card hover={false} padding={false}>
          <div className="px-4">
            {sortedReviews.map(review => (
              <div key={review._id}>
                <ReviewCard review={review} />

                {/* Reply form (only for reviews without response) */}
                {!review.response?.text && (
                  <div className="pb-4 pl-4">
                    {replyingTo === review._id ? (
                      <div className="space-y-2">
                        <Input
                          as="textarea"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(review._id)}
                            loading={replyLoading}
                          >
                            Post Reply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingTo(review._id);
                          setReplyText('');
                        }}
                        className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Reply to this review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Star className="h-12 w-12" />}
          title={sortBy === 'needs-reply' ? 'All reviews have replies' : 'No reviews yet'}
          description={sortBy === 'needs-reply' ? 'Great job keeping up with your responses!' : 'Complete bookings to start receiving reviews'}
        />
      )}
    </div>
  );
};

export default ReviewsTab;
