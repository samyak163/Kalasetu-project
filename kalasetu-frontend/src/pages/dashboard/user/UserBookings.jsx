import { useEffect, useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { TabBar, Skeleton, EmptyState, Alert } from '../../../components/ui';
import BookingCard from '../../../components/booking/BookingCard.jsx';
import CancellationSheet from '../../../components/booking/CancellationSheet.jsx';
import ReviewSheet from '../../../components/booking/ReviewSheet.jsx';
import { CalendarDays, Star, CheckCircle, MessageCircle, RotateCcw, XCircle } from 'lucide-react';

const TAB_CONFIG = [
  { key: 'upcoming', label: 'Upcoming', statuses: ['pending', 'confirmed'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled', 'rejected'] },
];

export default function UserBookings() {
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [expandedId, setExpandedId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null); // { id, status }
  const [reviewTarget, setReviewTarget] = useState(null); // booking object or null

  const fetchBookings = async ({ silent = false } = {}) => {
    try {
      if (!silent) setInitialLoading(true);
      setError(null);
      const res = await api.get('/api/bookings/me');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
      showToast(err.response?.data?.message || 'Failed to load bookings', 'error');
    } finally {
      if (!silent) setInitialLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch
  useEffect(() => {
    fetchBookings();
  }, []);

  // Deep link: ?review=bookingId opens ReviewSheet automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reviewBookingId = params.get('review');
    if (reviewBookingId && bookings.length > 0) {
      const target = bookings.find(b => b._id === reviewBookingId && b.status === 'completed' && !b.hasReview);
      if (target) {
        setActiveTab('completed');
        setReviewTarget(target);
        // Only clear param after successfully finding the booking
        const url = new URL(window.location);
        url.searchParams.delete('review');
        window.history.replaceState({}, '', url);
      }
    }
  }, [bookings]);

  // Count bookings per tab for badge display
  const tabs = useMemo(() =>
    TAB_CONFIG.map(({ key, label, statuses }) => ({
      key,
      label,
      count: bookings.filter(b => statuses.includes(b.status)).length,
    })),
    [bookings]
  );

  const activeStatuses = TAB_CONFIG.find(t => t.key === activeTab)?.statuses || [];
  const filtered = bookings.filter(b => activeStatuses.includes(b.status));

  const getActionsForBooking = (booking) => {
    const { status, artisan } = booking;
    const artisanUrl = artisan?.publicId ? `/artisans/${artisan.publicId}` : '/search';

    switch (status) {
      case 'pending':
        return [
          { label: 'Cancel Booking', variant: 'danger', icon: XCircle, onClick: () => setCancelTarget({ id: booking._id, status }) },
        ];
      case 'confirmed':
        return [
          { label: 'Message Artisan', variant: 'outline', icon: MessageCircle, onClick: () => navigate(`/messages?artisan=${artisan?._id}`) },
          { label: 'Cancel Booking', variant: 'danger', icon: XCircle, onClick: () => setCancelTarget({ id: booking._id, status }) },
        ];
      case 'completed': {
        const actions = [];
        if (booking.hasReview) {
          actions.push({ label: 'Reviewed', variant: 'ghost', icon: CheckCircle, disabled: true });
        } else {
          actions.push({ label: 'Leave Review', variant: 'primary', icon: Star, onClick: () => setReviewTarget(booking) });
        }
        actions.push({ label: 'Book Again', variant: 'secondary', icon: RotateCcw, onClick: () => navigate(artisanUrl) });
        return actions;
      }
      case 'cancelled':
      case 'rejected':
        return [
          { label: 'Book Again', variant: 'secondary', icon: RotateCcw, onClick: () => navigate(artisanUrl) },
        ];
      default:
        return [];
    }
  };

  const handleCancelSuccess = () => {
    setCancelTarget(null);
    fetchBookings({ silent: true });
  };

  const handleReviewSuccess = (review) => {
    // Use review.booking from callback (avoids stale closure on reviewTarget)
    const bookingId = review?.booking || reviewTarget?._id;
    setBookings(prev => prev.map(b =>
      b._id === bookingId ? { ...b, hasReview: true } : b
    ));
    setReviewTarget(null);
    fetchBookings({ silent: true });
  };

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" width="200px" height="28px" />
        <Skeleton variant="rect" height="40px" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rect" height="88px" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-gray-900">My Bookings</h2>
        <Link to="/search" className="text-sm text-brand-500 hover:underline font-medium">
          Book a new service
        </Link>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          <p className="text-sm">{error}</p>
          <button onClick={fetchBookings} className="mt-1 text-sm underline hover:no-underline">Try again</button>
        </Alert>
      )}

      {/* Tabs */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Booking list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              perspective="user"
              expanded={expandedId === booking._id}
              onToggle={() => setExpandedId(prev => prev === booking._id ? null : booking._id)}
              actions={getActionsForBooking(booking)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title={
            activeTab === 'upcoming' ? 'No upcoming bookings' :
            activeTab === 'completed' ? 'No completed bookings yet' :
            'No cancelled bookings'
          }
          description={
            activeTab === 'upcoming' ? 'Browse artisans to book a service' :
            activeTab === 'completed' ? 'Your completed services will appear here' :
            'Cancelled and rejected bookings will appear here'
          }
          action={
            activeTab === 'upcoming' ? (
              <Link to="/search" className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-button text-sm font-medium hover:bg-brand-600 transition-colors">
                Find Artisans
              </Link>
            ) : null
          }
        />
      )}

      {/* Cancellation sheet */}
      <CancellationSheet
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        bookingId={cancelTarget?.id}
        bookingStatus={cancelTarget?.status}
        onCancel={handleCancelSuccess}
      />

      {/* Review sheet */}
      <ReviewSheet
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSuccess={handleReviewSuccess}
        booking={reviewTarget}
        artisanName={reviewTarget?.artisan?.fullName || 'Artisan'}
      />
    </div>
  );
}
