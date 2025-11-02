import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';

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
      // For now, show placeholder data. Will connect to real API later
      setStats({
        activeBookings: 3,
        completedBookings: 45,
        totalEarnings: 45230,
        rating: 4.8,
        reviewCount: 45,
        profileViews: 234,
        weeklyGrowth: 12,
        pendingActions: {
          newRequests: 2,
          unreadMessages: 1,
          pendingReviews: 0
        }
      });
      
      setRecentBookings([
        {
          id: 1,
          service: 'Plumbing Repair',
          customer: 'John D.',
          time: 'Today, 2:00 PM',
          amount: 800,
          status: 'confirmed'
        }
      ]);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
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
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back! 👋</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your profile views: {stats?.profileViews || 0} this week (+{stats?.weeklyGrowth || 0}%)
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.activeBookings || 0}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.completedBookings || 0}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
          <div className="text-3xl font-bold text-green-600 mt-1">₹{stats?.totalEarnings?.toLocaleString() || 0}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.rating || 0}</span>
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm text-gray-500">({stats?.reviewCount || 0})</span>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      {stats?.pendingActions && (stats.pendingActions.newRequests > 0 || stats.pendingActions.unreadMessages > 0) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⚠️ Pending Actions</h3>
          <div className="space-y-2">
            {stats.pendingActions.newRequests > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {stats.pendingActions.newRequests} new booking request{stats.pendingActions.newRequests > 1 ? 's' : ''}
                </span>
                <button className="text-sm font-medium text-[#A55233] hover:text-[#8e462b]">
                  Respond now →
                </button>
              </div>
            )}
            {stats.pendingActions.unreadMessages > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {stats.pendingActions.unreadMessages} customer message{stats.pendingActions.unreadMessages > 1 ? 's' : ''}
                </span>
                <button className="text-sm font-medium text-[#A55233] hover:text-[#8e462b]">
                  Reply →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
        {recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{booking.service}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Customer: {booking.customer} | {booking.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">₹{booking.amount}</div>
                  <div className="text-sm text-green-600">✓ Confirmed</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No recent bookings</p>
          </div>
        )}
      </div>

      {/* Tips & Insights */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Tips & Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Artisans with portfolios get 3x more bookings</li>
          <li>• Respond within 1 hour for higher visibility</li>
          <li>• Complete your profile to rank higher in search</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardOverviewTab;
