import { useState, useEffect, useCallback, useContext } from 'react';
import { Star } from 'lucide-react';
import api from '../../lib/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ToastContext } from '../../context/ToastContext.jsx';
import { ReviewCard, Badge, Skeleton, EmptyState, Alert, Button } from '../ui/index.js';
import TagSummary from './TagSummary.jsx';

/** Number of reviews per page — matches backend default */
const REVIEWS_PER_PAGE = 10;

/**
 * ReviewsTab — Zomato Reviews 2.0 pattern for the artisan profile.
 *
 * Structure:
 *  1. Rating summary bar (average from artisan doc, distribution from loaded reviews)
 *  2. Tag summary chips (Phase 7 — placeholder-ready)
 *  3. Individual reviews via ReviewCard component
 *  4. "Load more" pagination
 *
 * Fetches from GET /api/reviews/artisan/:artisanId
 */
export default function ReviewsTab({ artisanId, averageRating = 0, totalReviews = 0, className = '' }) {
  const { user } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReviews = useCallback(async (pageNum = 1) => {
    try {
      const isFirst = pageNum === 1;
      if (isFirst) { setLoading(true); setError(null); }
      else setLoadingMore(true);

      const res = await api.get(`/api/reviews/artisan/${artisanId}`, {
        params: { page: pageNum, limit: REVIEWS_PER_PAGE },
      });

      const list = res.data?.data || [];
      setReviews(prev => isFirst ? list : [...prev, ...list]);
      setHasMore(list.length === REVIEWS_PER_PAGE);
      setPage(pageNum);
    } catch (err) {
      if (pageNum === 1) {
        setError(err.response?.data?.message || 'Could not load reviews');
        setReviews([]);
      } else {
        showToast('Could not load more reviews', 'error');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [artisanId, showToast]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  const handleHelpful = async (reviewId) => {
    if (!user) { showToast('Log in to vote', 'error'); return; }
    try {
      await api.post(`/api/reviews/${reviewId}/helpful`);
      setReviews(prev => prev.map(r => {
        if (r._id !== reviewId) return r;
        const votes = r.helpfulVotes || [];
        const userId = user._id || user.id;
        const already = votes.includes(userId);
        return {
          ...r,
          helpfulVotes: already ? votes.filter(id => id !== userId) : [...votes, userId],
        };
      }));
    } catch {
      showToast('Could not update vote', 'error');
    }
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton variant="rect" height="80px" className="rounded-card" />
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rect" height="120px" className="rounded-card" />)}
      </div>
    );
  }

  // ---------- Error ----------
  if (error) {
    return (
      <Alert type="error" className={className}>
        <p>{error}</p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => fetchReviews(1)}>
          Retry
        </Button>
      </Alert>
    );
  }

  // ---------- Empty ----------
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Be the first to share your experience after a booking."
        className={className}
      />
    );
  }

  // Distribution computed from loaded reviews — only show when all reviews are loaded
  // to avoid misleading partial data
  const allLoaded = reviews.length >= totalReviews;
  const distribution = allLoaded
    ? [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
      }))
    : null;
  const maxCount = distribution ? Math.max(...distribution.map(d => d.count), 1) : 1;
  const userId = user?._id || user?.id;

  return (
    <div className={className}>
      {/* Rating summary */}
      <div className="bg-white rounded-card p-4 mb-4 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Average (from artisan doc — always accurate) */}
        <div className="text-center shrink-0">
          <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <Badge variant="rating" rating={averageRating} className="mt-1" />
          <p className="text-xs text-gray-500 mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
        </div>

        {/* Distribution bars — only when all reviews are loaded (avoids misleading partial data) */}
        {distribution ? (
          <div className="flex-1 w-full space-y-1.5">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right text-gray-600 font-medium">{star}</span>
                <Star className="h-3 w-3 text-gray-400" />
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
            Load all reviews to see rating breakdown
          </div>
        )}
      </div>

      {/* Tag summary chips — only rendered when artisan has 3+ reviews */}
      <TagSummary artisanId={artisanId} totalReviews={totalReviews} className="mb-4" />

      {/* Individual reviews */}
      <div className="bg-white rounded-card px-4">
        {reviews.map(review => (
          <ReviewCard
            key={review._id}
            review={review}
            onHelpful={() => handleHelpful(review._id)}
            isHelpful={userId && review.helpfulVotes?.includes(userId)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            loading={loadingMore}
            onClick={() => fetchReviews(page + 1)}
          >
            Load more reviews
          </Button>
        </div>
      )}
    </div>
  );
}
