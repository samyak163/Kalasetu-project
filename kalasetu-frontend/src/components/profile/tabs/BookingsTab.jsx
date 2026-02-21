import { useEffect, useState, useContext, useMemo } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { FilterChips, BottomSheet, Button, Input, Skeleton, EmptyState, Alert } from '../../ui';
import BookingCard from '../../booking/BookingCard.jsx';
import CancellationSheet from '../../booking/CancellationSheet.jsx';
import { Calendar, CheckCircle, Phone, XCircle } from 'lucide-react';

const FILTER_CONFIG = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' }, // includes rejected
];

const BookingsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Reject sheet state
  const [rejectTarget, setRejectTarget] = useState(null); // booking ID
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Cancel sheet state
  const [cancelTarget, setCancelTarget] = useState(null); // { id, status }

  useEffect(() => {
    fetchBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async ({ silent = false } = {}) => {
    try {
      if (!silent) setInitialLoading(true);
      setError(null);
      const res = await api.get('/api/bookings/artisan');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
      showToast(err.response?.data?.message || 'Failed to load bookings', 'error');
      setBookings([]);
    } finally {
      if (!silent) setInitialLoading(false);
    }
  };

  // Build filter chips with counts
  const chips = useMemo(() =>
    FILTER_CONFIG.map(({ key, label }) => {
      const count = key === 'all'
        ? bookings.length
        : key === 'cancelled'
          ? bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length
          : bookings.filter(b => b.status === key).length;
      return {
        key,
        label: key === 'all' ? label : `${label} (${count})`,
        active: filter === key,
        onClick: () => setFilter(key),
      };
    }),
    [bookings, filter]
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return bookings;
    if (filter === 'cancelled') return bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  // --- Action handlers ---

  const handleAccept = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.patch(`/api/bookings/${bookingId}/respond`, { action: 'accept' });
      showToast('Booking accepted', 'success');
      await fetchBookings({ silent: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    try {
      setRejectSubmitting(true);
      await api.patch(`/api/bookings/${rejectTarget}/respond`, { action: 'reject', reason: rejectReason.trim() });
      showToast('Booking rejected', 'success');
      setRejectTarget(null);
      setRejectReason('');
      await fetchBookings({ silent: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject booking', 'error');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.patch(`/api/bookings/${bookingId}/complete`);
      showToast('Booking marked as completed', 'success');
      await fetchBookings({ silent: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSuccess = () => {
    setCancelTarget(null);
    fetchBookings({ silent: true });
  };

  // Build per-booking actions for artisan perspective
  const getActionsForBooking = (booking) => {
    const isLoading = actionLoading === booking._id;

    switch (booking.status) {
      case 'pending':
        return [
          { label: 'Accept', variant: 'primary', icon: CheckCircle, onClick: () => handleAccept(booking._id), loading: isLoading },
          { label: 'Reject', variant: 'danger', icon: XCircle, onClick: () => setRejectTarget(booking._id) },
        ];
      case 'confirmed':
        return [
          { label: 'Mark Complete', variant: 'primary', icon: CheckCircle, onClick: () => handleComplete(booking._id), loading: isLoading },
          ...(booking.user?.phoneNumber ? [{
            label: 'Call Customer', variant: 'secondary', icon: Phone,
            onClick: () => { window.location.href = `tel:${booking.user.phoneNumber}`; },
          }] : []),
          { label: 'Cancel', variant: 'danger', icon: XCircle, onClick: () => setCancelTarget({ id: booking._id, status: booking.status }) },
        ];
      default:
        return [];
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" width="240px" height="28px" />
        <Skeleton variant="rect" height="36px" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rect" height="88px" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">Bookings & Schedule</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your appointments and bookings</p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          <p className="text-sm">{error}</p>
          <button onClick={fetchBookings} className="mt-1 text-sm underline hover:no-underline">Try again</button>
        </Alert>
      )}

      {/* Filter chips */}
      <FilterChips chips={chips} />

      {/* Booking list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              perspective="artisan"
              expanded={expandedId === booking._id}
              onToggle={() => setExpandedId(prev => prev === booking._id ? null : booking._id)}
              actions={getActionsForBooking(booking)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title={filter !== 'all' ? `No ${filter} bookings` : 'No bookings yet'}
          description={
            filter !== 'all'
              ? 'Try selecting a different filter to see other bookings'
              : 'Your bookings will appear here when customers book your services'
          }
        />
      )}

      {/* Reject sheet */}
      <BottomSheet
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectReason(''); }}
        title="Reject Booking"
      >
        <div className="space-y-4">
          <Input
            as="textarea"
            label="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Let the customer know why you can't take this booking..."
            rows={3}
          />
          <Button
            variant="danger"
            className="w-full"
            onClick={handleRejectSubmit}
            loading={rejectSubmitting}
          >
            Confirm Rejection
          </Button>
        </div>
      </BottomSheet>

      {/* Cancellation sheet */}
      <CancellationSheet
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        bookingId={cancelTarget?.id}
        bookingStatus={cancelTarget?.status}
        onCancel={handleCancelSuccess}
      />
    </div>
  );
};

export default BookingsTab;
