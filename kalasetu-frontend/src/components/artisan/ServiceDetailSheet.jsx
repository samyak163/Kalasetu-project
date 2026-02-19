import { useState, useEffect } from 'react';
import { Star, Clock, IndianRupee, Users, Sparkles } from 'lucide-react';
import { BottomSheet, Button, Skeleton, Badge } from '../ui/index.js';
import ImageCarousel from '../ui/ImageCarousel.jsx';
import { optimizeImage } from '../../utils/cloudinary.js';
import api from '../../lib/axios.js';

/**
 * Swiggy/Zomato-style detail sheet for a service.
 * Opens as a BottomSheet with full images, description, stats, and Book CTA.
 *
 * Stats (bookingCount, averageRating, reviewCount) are fetched lazily from
 * GET /api/services/:serviceId/stats when the sheet opens.
 */
export default function ServiceDetailSheet({ service, artisan, open, onClose, onBook }) {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch per-service stats when sheet opens
  useEffect(() => {
    if (!open || !service?._id) return;
    let cancelled = false;
    setStatsLoading(true);
    api.get(`/api/services/${service._id}/stats`)
      .then((res) => {
        if (!cancelled) setStats(res.data?.data || res.data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, service?._id]);

  // Reset stats when sheet closes
  useEffect(() => {
    if (!open) setStats(null);
  }, [open]);

  if (!service) return null;

  const hasImages = service.images?.length > 0;
  const optimizedImages = hasImages
    ? service.images.map((url) => optimizeImage(url, { width: 600, height: 450, crop: 'fill' }))
    : [];

  const hasStats = stats && (stats.bookingCount > 0 || stats.reviewCount > 0);

  const handleBook = () => {
    onBook(service);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Service Details">
      {/* 1. Image carousel or category-colored fallback */}
      {hasImages ? (
        <ImageCarousel images={optimizedImages} aspectRatio="4/3" className="rounded-lg overflow-hidden -mx-4 -mt-4 mb-4" />
      ) : (
        <div
          className="rounded-lg bg-brand-50 flex items-center justify-center -mx-4 -mt-4 mb-4"
          style={{ aspectRatio: '4/3' }}
        >
          <span className="text-brand-400 font-display text-lg">{service.categoryName || 'Service'}</span>
        </div>
      )}

      {/* 2. Service name */}
      <h3 className="text-xl font-semibold font-display text-gray-900">{service.name}</h3>

      {/* 3. Category + Duration */}
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
        {service.categoryName && <span>{service.categoryName}</span>}
        {service.categoryName && service.durationMinutes > 0 && <span>&middot;</span>}
        {service.durationMinutes > 0 && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(service.durationMinutes)}
          </span>
        )}
      </div>

      {/* 4. Price */}
      <div className="mt-3">
        {service.price > 0 ? (
          <span className="inline-flex items-center gap-1 text-2xl font-bold text-gray-900" aria-label={`Price: ${service.price} rupees`}>
            <IndianRupee className="h-5 w-5" />
            {service.price.toLocaleString('en-IN')}
          </span>
        ) : (
          <span className="text-lg font-medium text-gray-600">Contact for pricing</span>
        )}
      </div>

      {/* 5. Stats row — fetched from API */}
      <div className="mt-3">
        {statsLoading ? (
          <div className="flex gap-4">
            <Skeleton variant="text" className="w-24 h-5" />
            <Skeleton variant="text" className="w-20 h-5" />
          </div>
        ) : hasStats ? (
          <div className="flex items-center gap-3 text-sm">
            {stats.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {stats.averageRating}
                <span className="text-gray-500 font-normal">({stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'})</span>
              </span>
            )}
            {stats.bookingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-gray-600">
                <Users className="h-4 w-4" />
                {stats.bookingCount} booked
              </span>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            New service
          </Badge>
        )}
      </div>

      {/* 6. Description */}
      {service.description && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">About this service</h4>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{service.description}</p>
        </div>
      )}

      {/* 7. Book CTA */}
      <Button variant="primary" className="w-full mt-6" onClick={handleBook}>
        {service.price > 0
          ? `Book This Service \u2014 \u20B9${service.price.toLocaleString('en-IN')}`
          : 'Book This Service'}
      </Button>
    </BottomSheet>
  );
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
