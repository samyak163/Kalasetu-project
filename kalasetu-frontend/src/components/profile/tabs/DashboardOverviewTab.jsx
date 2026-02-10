import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { LoadingState } from '../../ui';

const DashboardOverviewTab = () => {
  const { showToast } = useContext(ToastContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch real dashboard stats from backend
      const response = await api.get('/api/artisan/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data.stats || {});
        setRecentBookings(response.data.data.recentBookings || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      showToast(error.response?.data?.message || 'Failed to load dashboard', 'error');
      // Set empty data on error
      setStats({});
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your profile views: {stats?.profileViews || 0} this week (+{stats?.weeklyGrowth || 0}%)
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active Bookings</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats?.activeBookings || 0}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats?.completedBookings || 0}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Earned</div>
          <div className="text-3xl font-bold text-green-600 mt-1">₹{stats?.totalEarnings?.toLocaleString() || 0}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Rating</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900">{stats?.rating || 0}</span>
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm text-gray-500">({stats?.reviewCount || 0})</span>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      {stats?.pendingActions && (stats.pendingActions.newRequests > 0 || stats.pendingActions.unreadMessages > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">⚠️ Pending Actions</h3>
          <div className="space-y-2">
            {stats.pendingActions.newRequests > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {stats.pendingActions.newRequests} new booking request{stats.pendingActions.newRequests > 1 ? 's' : ''}
                </span>
                <button className="text-sm font-medium text-brand-500 hover:text-brand-600">
                  Respond now →
                </button>
              </div>
            )}
            {stats.pendingActions.unreadMessages > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {stats.pendingActions.unreadMessages} client message{stats.pendingActions.unreadMessages > 1 ? 's' : ''}
                </span>
                <button className="text-sm font-medium text-brand-500 hover:text-brand-600">
                  Reply →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Bookings</h3>
        {recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map(booking => (
              <div key={booking._id || booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{booking.serviceName || booking.service?.name || 'Service'}</div>
                  <div className="text-sm text-gray-600">
                    Client: {booking.user?.fullName || booking.userName || 'Customer'} | {booking.start ? new Date(booking.start).toLocaleDateString() : booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{booking.price || booking.amount || 0}</div>
                  <div className={`text-sm ${booking.status === 'completed' ? 'text-success-600' : booking.status === 'pending' ? 'text-warning-600' : 'text-brand-500'}`}>
                    {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Confirmed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent bookings</p>
          </div>
        )}
      </div>

      {/* Tips & Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Tips & Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Artisans with portfolios get 3x more bookings</li>
          <li>• Respond within 1 hour for higher visibility</li>
          <li>• Complete your profile to rank higher in search</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardOverviewTab;
