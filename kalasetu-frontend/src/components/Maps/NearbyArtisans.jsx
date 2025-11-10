import { useState, useEffect } from 'react';
import { getCurrentLocation } from '../../lib/googleMaps';
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
      const location = await getCurrentLocation();
      const response = await api.get('/api/artisans/nearby', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radiusKm: 50,
          limit: 5,
        },
      });
      const apiArtisans = Array.isArray(response.data?.artisans) ? response.data.artisans : [];
      setArtisans(apiArtisans.slice(0, 5));
      if (apiArtisans.length === 0) {
        setError('No artisans found nearby at the moment.');
      }
    } catch (err) {
      console.error('Failed to load nearby artisans:', err);
      setError(err.response?.data?.message || 'Failed to load nearby artisans.');
      setArtisans([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding nearby artisans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (artisans.length === 0) {
    return (
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
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Nearby Artisans ({artisans.length})
        </h2>
      </div>

      <ArtisanMap artisans={artisans} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artisans.map((artisan) => (
          <div
            key={artisan._id || artisan.publicId}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3">
              {(artisan.profileImage || artisan.profileImageUrl) && (
                <img
                  src={artisan.profileImage || artisan.profileImageUrl}
                  alt={artisan.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {artisan.fullName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{artisan.craft}</p>
                {artisan.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {artisan.location.city || 'Nearby'}
                  </p>
                )}
                <a
                  href={artisan.publicId ? `/artisan/${artisan.publicId}` : '#'}
                  className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Profile →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
