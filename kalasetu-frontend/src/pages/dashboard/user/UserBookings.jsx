import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
};

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const UserBookings = () => {
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings/me');
      setBookings(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/api/bookings/${bookingId}/cancel`, { reason: 'Cancelled by user' });
      showToast('Booking cancelled', 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    }
  };

  const filtered = bookings
    .filter(b => activeTab === 'all' || b.status === activeTab)
    .filter(b => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (b.serviceName || '').toLowerCase().includes(q) ||
        (b.artisan?.fullName || '').toLowerCase().includes(q)
      );
    });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
        <Link
          to="/search"
          className="text-sm text-brand-500 hover:underline font-medium"
        >
          Book a new service
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by service or artisan name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
      />

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab} {tab !== 'all' ? `(${bookings.filter(b => b.status === tab).length})` : `(${bookings.length})`}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="font-medium">No bookings found</p>
          {activeTab !== 'all' && (
            <button onClick={() => setActiveTab('all')} className="text-sm text-brand-500 hover:underline mt-1">
              View all bookings
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => (
            <div key={booking._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900">
                    {booking.serviceName || 'Service Booking'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {booking.artisan?.fullName || 'Artisan'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      {new Date(booking.start).toLocaleDateString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    <span>
                      {new Date(booking.start).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(booking.end).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {booking.price > 0 && (
                      <span className="font-medium text-gray-700">
                        {'\u20B9'}{booking.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {booking.notes && (
                    <div className="text-sm text-gray-500 mt-1 italic">"{booking.notes}"</div>
                  )}
                  {booking.rejectionReason && (
                    <div className="text-sm text-red-600 mt-1">Reason: {booking.rejectionReason}</div>
                  )}
                  {booking.cancellationReason && (
                    <div className="text-sm text-red-600 mt-1">Cancellation reason: {booking.cancellationReason}</div>
                  )}
                  {booking.modificationRequest?.status === 'pending' && (
                    <div className="text-sm text-amber-600 mt-1 font-medium">
                      Modification requested — awaiting response
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                    {booking.status}
                  </span>
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
