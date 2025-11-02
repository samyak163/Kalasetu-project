import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';

const BookingsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const getFilterLabel = (status) => {
    const labels = {
      all: 'All',
      pending: 'Pending',
      confirmed: 'Confirmed',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const fetchBookings = async () => {
    try {
      setLoading(false);
      // Placeholder data
      setBookings([
        {
          id: 1,
          service: 'Plumbing Repair',
          customer: 'John Doe',
          phone: '+91-9876543210',
          date: 'Jan 9, 2025',
          time: '9:00 AM - 11:00 AM',
          amount: 800,
          status: 'confirmed',
          address: '123 Main St, Indiranagar'
        }
      ]);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      showToast('Failed to load bookings', 'error');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-blue-100 text-blue-800', text: '🔵 Pending' },
      confirmed: { bg: 'bg-green-100 text-green-800', text: '🟢 Confirmed' },
      inProgress: { bg: 'bg-yellow-100 text-yellow-800', text: '🟡 In Progress' },
      completed: { bg: 'bg-gray-100 text-gray-800', text: '🔴 Completed' },
      cancelled: { bg: 'bg-red-100 text-red-800', text: '⚫ Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings & Schedule</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your appointments and bookings
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'inProgress', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-[#A55233] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {getFilterLabel(status)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {booking.service}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div>👤 Customer: <span className="font-medium text-gray-900 dark:text-white">{booking.customer}</span></div>
                    <div>📞 {booking.phone}</div>
                    <div>📅 {booking.date} | ⏰ {booking.time}</div>
                    <div>📍 {booking.address}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{booking.amount}</div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Start Work
                </button>
                <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  Call Customer
                </button>
                <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  Get Directions
                </button>
                <button className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your upcoming bookings will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
