import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Star, ArrowRight, MapPin } from 'lucide-react';
import ArtisanMap from './ArtisanMap';
import api from '../../lib/axios.js';
import { Avatar, Skeleton, Card, Button, Alert, EmptyState } from '../ui';

const SkeletonCard = () => (
  <Card hover={false} padding={false} className="overflow-hidden">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" lines={1} className="w-3/4" />
      <Skeleton variant="text" lines={1} className="w-1/2" />
      <Skeleton variant="text" lines={1} className="w-1/3" />
    </div>
  </Card>
);

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
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (artisans.length === 0) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Nearby Artisans
        </h2>
        <EmptyState
          icon={<MapPin className="w-16 h-16" />}
          title="No artisans found nearby right now."
          description="Check back later or try searching by category."
        />
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
              className="group"
            >
              <Card hover={false} padding={false} className="overflow-hidden border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all">
                {/* Profile Image */}
                {artisan.profileImageUrl || artisan.profileImage ? (
                  <img
                    src={artisan.profileImageUrl || artisan.profileImage}
                    alt={artisan.fullName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                    <Avatar name={artisan.fullName} size="xl" />
                  </div>
                )}

                {/* Card Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {artisan.fullName}
                    </h3>
                    {artisan.isVerified && (
                      <BadgeCheck
                        className="w-4 h-4 text-success-500 flex-shrink-0"
                        aria-label="KalaSetu Verified Artisan"
                      />
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
                    <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {artisan.averageRating.toFixed(1)}
                    </p>
                  )}

                  {artisan.distanceKm != null && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {artisan.distanceKm} km away
                    </p>
                  )}

                  <span className="inline-block mt-3 text-sm font-medium text-brand-500 group-hover:underline">
                    View Profile
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link to="/search">
          <Button variant="outline" className="gap-2">
            View All Artisans
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
