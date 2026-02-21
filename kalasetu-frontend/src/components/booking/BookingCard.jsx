import { Calendar, Clock, IndianRupee, ChevronDown, ChevronUp, Phone, Mail, FileText, AlertCircle } from 'lucide-react';
import { Card, StatusBadge, Button, Avatar } from '../ui';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

/**
 * Shared expandable booking card for both user and artisan views.
 *
 * @param {object}  booking      - Booking data from API
 * @param {'user'|'artisan'} perspective - Who is viewing: shows artisan info for 'user', customer info for 'artisan'
 * @param {boolean} expanded     - Whether card shows full details
 * @param {function} onToggle    - Toggle expand/collapse
 * @param {Array}   actions      - [{ label, variant, onClick, icon?, loading? }]
 */
export default function BookingCard({ booking, perspective = 'user', expanded = false, onToggle, actions = [] }) {
  const isUser = perspective === 'user';
  const personName = isUser
    ? (booking.artisan?.fullName || 'Artisan')
    : (booking.user?.fullName || 'Customer');
  const personImage = isUser ? booking.artisan?.profileImageUrl : null;

  return (
    <Card compact hover={false} className="overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left flex items-center gap-3"
        aria-expanded={expanded}
        aria-controls={`booking-details-${booking._id}`}
      >
        <Avatar src={personImage} name={personName} size="md" className="shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate text-sm">
              {booking.serviceName || 'Service Booking'}
            </span>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{personName}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(booking.start)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(booking.start)}
            </span>
          </div>
        </div>

        {expanded
          ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div id={`booking-details-${booking._id}`} className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {/* Price + duration row */}
          <div className="flex items-center gap-4 text-sm">
            {booking.price > 0 && (
              <span className="inline-flex items-center gap-0.5 font-semibold text-gray-900">
                <IndianRupee className="h-3.5 w-3.5" />
                {booking.price.toLocaleString('en-IN')}
              </span>
            )}
            {booking.end && (
              <span className="text-gray-500">
                {formatTime(booking.start)} – {formatTime(booking.end)}
              </span>
            )}
          </div>

          {/* Booking ID */}
          <p className="text-xs text-gray-400">
            Booking ID: #{(booking._id || '').slice(-8).toUpperCase()}
          </p>

          {/* Contact info (artisan perspective) */}
          {!isUser && booking.user?.phoneNumber && (
            <a href={`tel:${booking.user.phoneNumber}`} className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline">
              <Phone className="h-3 w-3" /> {booking.user.phoneNumber}
            </a>
          )}
          {!isUser && booking.user?.email && (
            <p className="inline-flex items-center gap-1.5 text-xs text-gray-500 ml-3">
              <Mail className="h-3 w-3" /> {booking.user.email}
            </p>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <FileText className="h-3 w-3 mt-0.5 shrink-0" />
              <span className="italic">"{booking.notes}"</span>
            </div>
          )}

          {/* Rejection / cancellation reason */}
          {booking.rejectionReason && (
            <p className="text-xs text-error-600">Reason: {booking.rejectionReason}</p>
          )}
          {booking.cancellationReason && (
            <p className="text-xs text-error-600">Cancellation: {booking.cancellationReason}</p>
          )}

          {/* Modification request */}
          {booking.modificationRequest?.status === 'pending' && (
            <div className="flex items-center gap-1.5 text-xs text-warning-700 font-medium">
              <AlertCircle className="h-3 w-3" />
              Modification requested — awaiting response
            </div>
          )}

          {/* Action buttons */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {actions.map(({ label, variant = 'secondary', onClick, icon: Icon, loading }) => (
                <Button
                  key={label}
                  variant={variant}
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onClick(); }}
                  loading={loading}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 mr-1" />}
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
