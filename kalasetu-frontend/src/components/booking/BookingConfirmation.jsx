import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MessageCircle, CalendarDays, Home } from 'lucide-react';
import { Button } from '../ui/index.js';

/**
 * Full-screen booking confirmation with checkmark animation.
 * Shown after successful payment + booking creation.
 *
 * Props:
 *  - service: ArtisanService object
 *  - artisan: Artisan object
 *  - bookingData: { date, time, notes }
 *  - bookingId: MongoDB booking ID
 *  - bookingStatus: 'pending' | 'confirmed'
 *  - onClose: () => void — returns to artisan profile
 */
export default function BookingConfirmation({ service, artisan, bookingData, bookingId, bookingStatus, onClose }) {
  const navigate = useNavigate();
  const [showCheck, setShowCheck] = useState(false);

  // Trigger animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formattedDate = bookingData?.date
    ? new Date(`${bookingData.date}T00:00:00`).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';
  const formattedTime = bookingData?.time ? formatSlotTime(bookingData.time) : '';
  const isAutoConfirmed = bookingStatus === 'confirmed';

  return (
    <div className="fixed inset-0 z-modal bg-white flex flex-col items-center justify-center px-6 animate-fade-in">
      {/* Checkmark animation */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
        showCheck ? 'bg-success-500 scale-100' : 'bg-success-500/30 scale-75'
      }`}>
        <Check className={`h-12 w-12 text-white transition-all duration-500 delay-200 ${
          showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`} />
      </div>

      {/* Status message */}
      <h2 className="text-2xl font-display font-bold text-gray-900 text-center">
        {isAutoConfirmed ? 'Booking Confirmed!' : 'Booking Requested!'}
      </h2>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
        {isAutoConfirmed
          ? `Your booking with ${artisan?.fullName || 'the artisan'} is confirmed. Payment received.`
          : `Your booking request has been sent to ${artisan?.fullName || 'the artisan'}. You\u2019ll be notified when they confirm.`}
      </p>

      {/* Booking details card */}
      <div className="bg-surface-muted rounded-xl p-4 mt-6 w-full max-w-sm space-y-2">
        <DetailRow label="Service" value={service?.name} />
        <DetailRow label="Artisan" value={artisan?.fullName} />
        <DetailRow label="Date" value={formattedDate} />
        <DetailRow label="Time" value={formattedTime} />
        {bookingId && (
          <DetailRow label="Booking ID" value={bookingId.slice(-8).toUpperCase()} />
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => artisan?._id && navigate(`/messages?artisan=${artisan._id}`)}
        >
          <MessageCircle className="h-4 w-4" />
          Message Artisan
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/dashboard/bookings')}
        >
          <CalendarDays className="h-4 w-4" />
          View My Bookings
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={onClose}
        >
          <Home className="h-4 w-4" />
          Back to Profile
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function formatSlotTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
