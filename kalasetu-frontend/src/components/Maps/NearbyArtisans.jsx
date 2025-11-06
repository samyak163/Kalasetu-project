import { useState, useEffect } from 'react';
import { getCurrentLocation } from '../../lib/googleMaps';
import ArtisanMap from './ArtisanMap';
import api from '../../lib/axios';

export default function NearbyArtisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(50); // km

  useEffect(() => {
    loadNearbyArtisans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  const loadNearbyArtisans = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user location
      const location = await getCurrentLocation();

      // Fetch nearby artisans from backend
      const response = await api.get('/api/artisans/nearby', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radiusKm: radius, // km
        },
      });

      setArtisans(response.data.data || []);
    } catch (err) {
      console.error('Failed to load nearby artisans:', err);
      setError(err.message || 'Failed to load nearby artisans');
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (e) => {
    setRadius(parseInt(e.target.value, 10));
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadNearbyArtisans}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Nearby Artisans ({artisans.length})
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="radius" className="text-sm text-gray-600">
            Within:
          </label>
          <select
            id="radius"
            value={radius}
            onChange={handleRadiusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={200}>200 km</option>
          </select>
        </div>
      </div>

      {artisans.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No artisans found nearby
          </h3>
          <p className="text-gray-600">
            Try increasing the search radius or check back later
          </p>
        </div>
      ) : (
        <>
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
                        {typeof artisan.distance === 'number'
                          ? `${(artisan.distance / 1000).toFixed(1)} km away`
                          : artisan.location.city || 'Unknown'}
                      </p>
                    )}
                    <a
                      href={`/artisans/${artisan.publicId}`}
                      className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Profile →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
