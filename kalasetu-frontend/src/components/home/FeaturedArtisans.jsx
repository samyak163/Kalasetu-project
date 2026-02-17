import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios.js';

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

const FeaturedArtisans = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/api/artisans/featured');
        if (!cancelled) {
          const list = data.data || data.artisans || data;
          const resolved = Array.isArray(list) ? list : [];
          if (resolved.length > 0) {
            setArtisans(resolved);
          } else {
            // Fallback: fetch from general artisan list
            const fallback = await api.get('/api/artisans', { params: { limit: 8 } });
            const fallbackList = Array.isArray(fallback.data?.artisans) ? fallback.data.artisans : Array.isArray(fallback.data) ? fallback.data : [];
            if (!cancelled) setArtisans(fallbackList.slice(0, 8));
          }
        }
      } catch {
        // Fallback on error: try general artisan list
        try {
          const fallback = await api.get('/api/artisans', { params: { limit: 8 } });
          const fallbackList = Array.isArray(fallback.data?.artisans) ? fallback.data.artisans : Array.isArray(fallback.data) ? fallback.data : [];
          if (!cancelled) setArtisans(fallbackList.slice(0, 8));
        } catch {
          if (!cancelled) setArtisans([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFeatured();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Featured Artisans
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (artisans.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Featured Artisans
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {artisans.map((artisan) => {
          const profileLink = `/artisan/${artisan.publicId || artisan.slug || artisan._id}`;

          return (
            <Link
              key={artisan._id || artisan.publicId}
              to={profileLink}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Profile Image */}
              {artisan.profileImageUrl ? (
                <img
                  src={artisan.profileImageUrl}
                  alt={artisan.fullName}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className="w-full h-48 flex items-center justify-center text-white text-4xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, #A55233, #C97B5D)`,
                  }}
                >
                  {artisan.fullName
                    ? artisan.fullName.charAt(0).toUpperCase()
                    : '?'}
                </div>
              )}

              {/* Card Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {artisan.fullName}
                  </h3>
                  {artisan.isVerified && (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 flex-shrink-0"
                      title="KalaSetu Verified Artisan"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>

                {(artisan.craft || artisan.category) && (
                  <p className="text-sm text-gray-600 truncate">
                    {artisan.craft || artisan.category}
                  </p>
                )}

                {artisan.location?.city && (
                  <p className="text-sm text-gray-500 truncate">
                    {artisan.location.city}
                  </p>
                )}

                {artisan.averageRating > 0 && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="text-yellow-500">&#11088;</span>{' '}
                    {artisan.averageRating.toFixed(1)}
                  </p>
                )}

                <span className="inline-block mt-3 text-sm font-medium text-brand-500 group-hover:underline">
                  View Profile
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-brand-500 border border-brand-500 rounded-lg hover:bg-brand-500 hover:text-white transition-colors"
        >
          View All Artisans
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedArtisans;
