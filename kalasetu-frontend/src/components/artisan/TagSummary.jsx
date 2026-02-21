import { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import { Skeleton } from '../ui/index.js';

/**
 * Displays aggregated review tags at the top of ReviewsTab.
 * Fetches from GET /api/reviews/artisan/:id/tags.
 * Only shown when artisan has 3+ reviews.
 *
 * @param {string} artisanId
 * @param {number} totalReviews — Skip render if < 3
 */
export default function TagSummary({ artisanId, totalReviews = 0, className = '' }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (totalReviews < 3) { setLoading(false); return; }

    let cancelled = false;
    api.get(`/api/reviews/artisan/${artisanId}/tags`)
      .then(res => {
        if (!cancelled) setTags(res.data?.data || []);
      })
      .catch(() => { /* non-critical — silently hide */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [artisanId, totalReviews]);

  if (totalReviews < 3) return null;

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rect" width="100px" height="28px" className="rounded-full" />)}
      </div>
    );
  }

  if (tags.length === 0) return null;

  // Show top 6 tags
  const display = tags.slice(0, 6);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {display.map(({ tag, count, sentiment }) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            sentiment === 'positive'
              ? 'bg-success-50 text-success-700 border border-success-200'
              : sentiment === 'negative'
              ? 'bg-error-50 text-error-700 border border-error-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {tag} <span className="text-[10px] opacity-70">({count})</span>
        </span>
      ))}
    </div>
  );
}
