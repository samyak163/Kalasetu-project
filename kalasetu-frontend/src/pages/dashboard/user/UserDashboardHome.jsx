import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../lib/axios.js';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
};

const UserDashboardHome = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, paymentsRes] = await Promise.all([
        api.get('/api/bookings/me').catch(() => ({ data: { data: [] } })),
        api.get('/api/payments?type=sent&limit=5').catch(() => ({ data: { data: [] } })),
      ]);
      setBookings(bookingsRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status))
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = payments
    .filter(p => p.status === 'captured')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
        </div>
        <div className="h-40 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.fullName?.split(' ')[0] || 'there'}!
        </h2>
        <p className="text-sm text-gray-500 mt-1">Here's your booking and payment overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Bookings</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{bookings.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{completedCount}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-3xl font-bold text-[#A55233] mt-1">
            {'\u20B9'}{totalSpent.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/search"
          className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors text-sm font-medium"
        >
          Find Artisans
        </Link>
        <Link
          to="/dashboard/bookings"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          View All Bookings
        </Link>
        <Link
          to="/dashboard/payments"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Payment History
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Upcoming Bookings</h3>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No upcoming bookings.</p>
            <Link to="/search" className="text-[#A55233] hover:underline text-sm mt-1 inline-block">
              Browse artisans to book a service
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcomingBookings.map(booking => (
              <li key={booking._id} className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {booking.serviceName || 'Service'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.artisan?.fullName || 'Artisan'} &middot;{' '}
                    {new Date(booking.start).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                  {booking.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Payments</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {payments.slice(0, 5).map(payment => (
              <li key={payment._id} className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {payment.description || payment.purpose || 'Payment'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <div className="font-medium text-gray-900">
                    {'\u20B9'}{(payment.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs ${payment.status === 'captured' ? 'text-green-600' : payment.status === 'refunded' ? 'text-orange-600' : 'text-gray-500'}`}>
                    {payment.status}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDashboardHome;
