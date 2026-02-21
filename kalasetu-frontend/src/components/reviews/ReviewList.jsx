import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config/env.config.js';

const Star = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill={filled ? '#F59E0B' : 'none'} stroke="#F59E0B"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/></svg>
);

const ReviewList = ({ artisanId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_CONFIG.BASE_URL}/api/reviews/artisan/${artisanId}`);
        const list = res.data?.data || [];
        setReviews(list);
      } catch {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    })();
  }, [artisanId]);

  if (loading) return <div className="p-4 text-gray-500">Loading reviews...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
      {reviews.map(r => (
        <div key={r._id} className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              {r.user?.profileImageUrl ? (
                <img src={r.user.profileImageUrl} alt={r.user?.fullName} className="w-full h-full object-cover" loading="lazy" />
              ) : null}
            </div>
            <div className="font-medium">{r.user?.fullName || 'User'}</div>
            <div className="flex ml-2">{[1,2,3,4,5].map(i => <Star key={i} filled={i <= r.rating} />)}</div>
          </div>
          {r.comment && <div className="mt-2 text-gray-700">{r.comment}</div>}
          {Array.isArray(r.images) && r.images.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {r.images.map((img, idx) => (
                <img key={idx} src={img} className="w-20 h-20 object-cover rounded" loading="lazy" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;


