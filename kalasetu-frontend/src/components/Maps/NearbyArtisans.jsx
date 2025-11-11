import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentLocation } from '../../lib/googleMaps';
import ArtisanMap from './ArtisanMap';
import api from '../../lib/axios.js';

export default function NearbyArtisans() {
  const navigate = useNavigate();
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
      // Always use Kothrud, Pune as default location to show sample artisans
      const location = { lat: 18.5083, lng: 73.8070 }; // Kothrud, Pune
      
      const response = await api.get('/api/artisans/nearby', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radiusKm: 50,
          limit: 20,
        },
      });
      
      const apiArtisans = Array.isArray(response.data?.artisans) ? response.data.artisans : [];
      
      // If no artisans found nearby, try to get all artisans as fallback
      if (apiArtisans.length === 0) {
        try {
          const allResponse = await api.get('/api/artisans', {
            params: { limit: 10 }
          });
          const allArtisans = Array.isArray(allResponse.data) ? allResponse.data : [];
          setArtisans(allArtisans.slice(0, 10));
        } catch (fallbackErr) {
          console.warn('Fallback fetch failed:', fallbackErr);
          setArtisans([]);
        }
      } else {
        // Show up to 10 artisans on homepage
        setArtisans(apiArtisans.slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to load nearby artisans:', err);
      // Don't show error, just try to get all artisans
      try {
        const allResponse = await api.get('/api/artisans', {
          params: { limit: 10 }
        });
        const allArtisans = Array.isArray(allResponse.data) ? allResponse.data : [];
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
                <button
                  onClick={() => {
                    if (artisan.publicId) {
                      navigate(`/${artisan.publicId}`);
                    }
                  }}
                  className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  View Profile →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
