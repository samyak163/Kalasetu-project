import { MapPin, CheckCircle, MessageCircle, Calendar, Clock, Briefcase, Users, Star, BarChart3 } from 'lucide-react';
import { Avatar, Badge, Button } from '../ui/index.js';
import { optimizeImage } from '../../utils/cloudinary.js';

/**
 * Compact artisan profile header below portfolio hero.
 * Avatar + name + craft + verified badge, quick stats row,
 * tagline, and Chat/Book action buttons.
 *
 * Design: UC-style compact header — visual-first (hero above),
 * info-dense but not cluttered.
 */
export default function ProfileHeader({ artisan, serviceCount = 0, onChat, onBook, className = '' }) {
  const hasLocation = artisan.location?.city && artisan.location?.state;
  const isNewArtisan = !artisan.averageRating && !artisan.totalReviews;

  return (
    <div className={`bg-white rounded-card shadow-card p-4 md:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <Avatar
          src={optimizeImage(artisan.profileImageUrl || artisan.profileImage, { width: 120, height: 120, crop: 'fill' })}
          name={artisan.fullName}
          size="xl"
          className="shrink-0 ring-4 ring-white shadow-md"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + verified */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 truncate">
              {artisan.fullName}
            </h1>
            {artisan.isVerified && (
              <span className="inline-flex items-center gap-1 text-sm text-brand-600 font-medium">
                <CheckCircle className="h-4 w-4 fill-brand-500 text-white" />
                Verified
              </span>
            )}
          </div>

          {/* Craft + tagline */}
          <p className="text-base text-brand-600 font-medium mt-0.5">{artisan.craft || artisan.businessName}</p>
          {artisan.tagline && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{artisan.tagline}</p>
          )}

          {/* Location */}
          {hasLocation && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {artisan.location.city}, {artisan.location.state}
            </p>
          )}

          {/* Quick stats row */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {artisan.averageRating > 0 ? (
              <Badge variant="rating" rating={artisan.averageRating} count={artisan.totalReviews} />
            ) : isNewArtisan ? (
              <StatChip icon={Star} value="New artisan" />
            ) : null}
            {artisan.totalBookings > 0 && (
              <StatChip icon={Calendar} value={`${artisan.totalBookings} bookings`} />
            )}
            {artisan.yearsOfExperience && (
              <StatChip icon={Briefcase} value={`${artisan.yearsOfExperience} exp`} />
            )}
            {artisan.responseRate > 0 && (
              <StatChip icon={BarChart3} value={`${artisan.responseRate}% response rate`} />
            )}
            {artisan.teamSize && (
              <StatChip icon={Users} value={artisan.teamSize} />
            )}
          </div>
        </div>

        {/* Action buttons — desktop: right side, mobile: full width below */}
        <div className="flex sm:flex-col gap-2 sm:self-start shrink-0">
          <Button variant="outline" size="sm" onClick={onChat} className="flex-1 sm:flex-none">
            <MessageCircle className="h-4 w-4" />
            <span className="sm:hidden md:inline">Chat</span>
          </Button>
          {serviceCount > 0 && (
            <Button variant="primary" size="sm" onClick={onBook} className="flex-1 sm:flex-none">
              <Calendar className="h-4 w-4" />
              <span className="sm:hidden md:inline">Book Now</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small inline stat chip for the stats row */
function StatChip({ icon: Icon, value }) { // eslint-disable-line no-unused-vars
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
      <Icon className="h-3 w-3 text-gray-400" />
      {value}
    </span>
  );
}
