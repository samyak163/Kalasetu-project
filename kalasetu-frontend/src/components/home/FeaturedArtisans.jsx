import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Star, ArrowRight } from 'lucide-react';
import api from '../../lib/axios.js';
import { Avatar, Skeleton, Button, Card } from '../ui';

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
              className="group"
            >
              <Card hover={false} padding={false} className="overflow-hidden border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all">
                {/* Profile Image */}
                {artisan.profileImageUrl ? (
                  <img
                    src={artisan.profileImageUrl}
                    alt={artisan.fullName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {artisan.averageRating.toFixed(1)}
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
};

export default FeaturedArtisans;
