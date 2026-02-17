import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArtisanMap from './ArtisanMap';
import api from '../../lib/axios.js';

export default function NearbyArtisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNearbyArtisans();
  }, []);

  const loadNearbyArtisans = async () => {
    setLoading(true);
    setError(null);

    try {
      // Always use MITWPU, Kothrud, Pune as default location to show sample artisans
      const location = { lat: 18.518408915633827, lng: 73.81513915383768 };

      const response = await api.get('/api/artisans/nearby', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radiusKm: 100,
          limit: 50,
        },
      });

      const apiArtisans = Array.isArray(response.data?.artisans) ? response.data.artisans : [];

      if (apiArtisans.length === 0) {
        try {
          const allResponse = await api.get('/api/artisans', {
            params: { limit: 20 }
          });
          const allArtisans = Array.isArray(allResponse.data?.artisans) ? allResponse.data.artisans : Array.isArray(allResponse.data) ? allResponse.data : [];
          setArtisans(allArtisans.slice(0, 10));
        } catch (fallbackErr) {
          console.warn('Fallback fetch failed:', fallbackErr);
          setArtisans([]);
        }
      } else {
        setArtisans(apiArtisans.slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to load nearby artisans:', err);
      try {
        const allResponse = await api.get('/api/artisans', {
          params: { limit: 20 }
        });
        const allArtisans = Array.isArray(allResponse.data?.artisans) ? allResponse.data.artisans : Array.isArray(allResponse.data) ? allResponse.data : [];
        setArtisans(allArtisans.slice(0, 10));
      } catch (fallbackErr) {
        console.error('All fallbacks failed:', fallbackErr);
        setArtisans([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Nearby Artisans
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (artisans.length === 0) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Nearby Artisans
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No artisans found nearby right now.
          </h3>
          <p className="text-gray-600">
            Check back later or try searching by category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Nearby Artisans ({artisans.length})
      </h2>

      <ArtisanMap artisans={artisans} />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {artisans.map((artisan) => {
          const profileLink = `/${artisan.publicId || artisan.slug || artisan._id}`;

          return (
            <Link
              key={artisan._id || artisan.publicId}
              to={profileLink}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Profile Image */}
              {artisan.profileImageUrl || artisan.profileImage ? (
                <img
                  src={artisan.profileImageUrl || artisan.profileImage}
                  alt={artisan.fullName}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
              ) : (
                <div
                  className="w-full h-48 flex items-center justify-center text-white text-4xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #A55233, #C97B5D)',
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
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
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

                {artisan.craft && (
                  <p className="text-sm text-gray-600 truncate">
                    {artisan.craft}
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

                {artisan.distanceKm != null && (
                  <p className="text-xs text-gray-400 mt-1">
                    {artisan.distanceKm} km away
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
