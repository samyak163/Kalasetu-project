import { Link } from 'react-router-dom';
import { MapPin, CheckCircle } from 'lucide-react';
import Badge from './Badge';
import Avatar from './Avatar';

/**
 * Standardized artisan listing card for search, homepage, and category browse.
 * Shows: avatar, name, craft, location, rating, verified badge.
 */
export default function ArtisanCard({ artisan, className = '' }) {
  const { publicId, fullName, craft, profileImageUrl, averageRating, totalReviews, location, isVerified } = artisan;

  return (
    <Link
      to={`/artisan/${publicId}`}
      className={`block bg-white rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Portfolio image or avatar */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={fullName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar name={fullName} size="lg" />
          </div>
        )}
      </div>

      <div className="p-3">
        {/* Name + verified */}
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{fullName}</h3>
          {isVerified && <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />}
        </div>

        {/* Craft */}
        {craft && <p className="text-xs text-gray-500 mt-0.5 truncate">{craft}</p>}

        {/* Rating + Location row */}
        <div className="flex items-center justify-between mt-2">
          {averageRating > 0 && (
            <Badge variant="rating" rating={averageRating} count={totalReviews} />
          )}
          {location?.city && (
            <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {location.city}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
