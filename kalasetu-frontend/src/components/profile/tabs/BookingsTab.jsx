import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { LoadingState, Badge, Alert, EmptyState } from '../../ui';
import { Calendar, Phone, Mail, FileText, Clock, IndianRupee } from 'lucide-react';

const filterTabs = ['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled'];

const BookingsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/bookings/artisan');
      if (response.data.success) {
        setBookings(response.data.data || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
      showToast(err.response?.data?.message || 'Failed to load bookings', 'error');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToBooking = async (bookingId, action, reason = '') => {
    try {
      setActionLoading(bookingId);
      const response = await api.patch(`/api/bookings/${bookingId}/respond`, { action, reason });
      if (response.data.success) {
        showToast(`Booking ${action}ed successfully`, 'success');
        await fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} booking`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      const response = await api.patch(`/api/bookings/${bookingId}/complete`);
      if (response.data.success) {
        showToast('Booking marked as completed', 'success');
        await fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      const response = await api.patch(`/api/bookings/${bookingId}/respond`, { action: 'reject', reason: 'Cancelled by artisan' });
      if (response.data.success) {
        showToast('Booking cancelled', 'success');
        await fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return <LoadingState message="Loading bookings..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bookings & Schedule</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your appointments and bookings
        </p>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchBookings} className="mt-1 text-sm underline hover:no-underline">Try again</button>
        </Alert>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist">
        {filterTabs.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            role="tab"
            aria-selected={filter === status}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({bookings.filter(b => b.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking._id || booking.id} className="bg-white border border-gray-200 rounded-card p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.serviceName || booking.service?.name || 'Service'}
                    </h3>
                    <Badge status={booking.status} />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{booking.user?.fullName || booking.userName || 'Customer'}</span>
                    </div>
                    {booking.user?.phoneNumber && (
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {booking.user.phoneNumber}</div>
                    )}
                    {booking.user?.email && (
                      <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {booking.user.email}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(booking.start || booking.scheduledDate).toLocaleDateString()}
                      {(booking.start || booking.scheduledDate) && (
                        <>
                          <Clock className="h-3.5 w-3.5 ml-2" />
                          {new Date(booking.start || booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {booking.end && (
                            <> - {new Date(booking.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                        </>
                      )}
                    </div>
                    {booking.notes && (
                      <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> {booking.notes}</div>
                    )}
                    {booking.rejectionReason && (
                      <div className="text-error-600">Reason: {booking.rejectionReason}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-2xl font-bold text-gray-900">
                    <IndianRupee className="h-5 w-5" />{booking.price || 0}
                  </div>
                </div>
              </div>

              {/* Pending: Accept / Reject */}
              {booking.status === 'pending' && (
                <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleRespondToBooking(booking._id, 'accept')}
                    disabled={actionLoading === booking._id}
                    className="px-4 py-2 text-sm bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === booking._id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      if (reason !== null) handleRespondToBooking(booking._id, 'reject', reason);
                    }}
                    disabled={actionLoading === booking._id}
                    className="px-4 py-2 text-sm border border-error-300 text-error-600 rounded-lg hover:bg-error-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === booking._id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}

              {/* Confirmed: Mark as Completed / Call Customer / Cancel */}
              {booking.status === 'confirmed' && (
                <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleCompleteBooking(booking._id)}
                    disabled={actionLoading === booking._id}
                    className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === booking._id ? 'Processing...' : 'Mark as Completed'}
                  </button>
                  {booking.user?.phoneNumber && (
                    <a
                      href={`tel:${booking.user.phoneNumber}`}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call Customer
                    </a>
                  )}
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={actionLoading === booking._id}
                    className="px-4 py-2 text-sm text-error-600 border border-error-300 rounded-lg hover:bg-error-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title={`No ${filter !== 'all' ? filter : ''} bookings`}
          description={
            filter !== 'all'
              ? 'Try selecting a different filter to see other bookings'
              : 'Your bookings will appear here when customers book your services'
          }
        />
      )}
    </div>
  );
};

export default BookingsTab;
