import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../lib/axios.js';
import { Card, Button, Skeleton, StarRating, Alert } from '../../ui';
import BookingCard from '../../booking/BookingCard.jsx';
import IncomeChart from '../../dashboard/IncomeChart.jsx';
import ProfileCompletionCard from '../../dashboard/ProfileCompletionCard.jsx';
import {
  CalendarDays, CheckCircle, IndianRupee, Star, TrendingUp,
  ArrowRight, MessageSquare, Clock,
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const DashboardOverviewTab = ({ onNavigateTab }) => {
  const { showToast } = useContext(ToastContext);
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/artisan/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data.stats || {});
        setRecentBookings(res.data.data.recentBookings || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load dashboard', 'error');
      setStats({});
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" height="60px" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rect" height="88px" />)}
        </div>
        <Skeleton variant="rect" height="200px" />
      </div>
    );
  }

  const hasPending = stats?.pendingActions?.newRequests > 0 || stats?.pendingActions?.unreadMessages > 0;

  const statCards = [
    { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: CalendarDays, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: 'Completed', value: stats?.completedBookings || 0, icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Total Earned', value: `₹${(stats?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Rating', value: stats?.rating || 0, icon: Star, color: 'text-warning-500', bg: 'bg-warning-50', isRating: true, reviewCount: stats?.reviewCount || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">
          {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Artisan'}!
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {hasPending
            ? `You have ${stats.pendingActions.newRequests || 0} pending request${stats.pendingActions.newRequests !== 1 ? 's' : ''}`
            : 'All caught up! Here\'s your dashboard overview.'
          }
        </p>
      </div>

      {/* Profile completion */}
      <ProfileCompletionCard onNavigateTab={onNavigateTab} />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, isRating, reviewCount }) => (
          <Card key={label} hover={false} compact>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {isRating ? (
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold text-gray-900">{Number(value).toFixed(1)}</span>
                    <StarRating value={Math.round(Number(value))} size="sm" readOnly showLabel={false} />
                  </div>
                ) : (
                  <p className={`text-2xl font-bold mt-1 ${label.includes('Earned') ? color : 'text-gray-900'}`}>
                    {value}
                  </p>
                )}
                {isRating && <p className="text-xs text-gray-400 mt-0.5">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>}
                {stats?.weeklyGrowth !== 0 && label === 'Active Bookings' && (
                  <p className={`text-xs mt-0.5 flex items-center gap-0.5 ${stats.weeklyGrowth > 0 ? 'text-success-600' : 'text-error-600'}`}>
                    <TrendingUp className="h-3 w-3" />
                    {stats.weeklyGrowth > 0 ? '+' : ''}{stats.weeklyGrowth}% this week
                  </p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Income chart */}
      <IncomeChart months={6} />

      {/* Pending actions */}
      {hasPending && (
        <Alert variant="warning">
          <div className="space-y-2">
            {stats.pendingActions.newRequests > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{stats.pendingActions.newRequests} new booking request{stats.pendingActions.newRequests !== 1 ? 's' : ''}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.('bookings')}>
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {stats.pendingActions.unreadMessages > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{stats.pendingActions.unreadMessages} unread message{stats.pendingActions.unreadMessages !== 1 ? 's' : ''}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.('clients')}>
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Bookings</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.('bookings')}>
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {recentBookings.length > 0 ? (
          <div className="space-y-2">
            {recentBookings.slice(0, 3).map(booking => (
              <BookingCard
                key={booking._id}
                booking={booking}
                perspective="artisan"
                expanded={false}
                onToggle={() => {}}
                actions={[]}
              />
            ))}
          </div>
        ) : (
          <Card hover={false}>
            <p className="text-sm text-gray-400 text-center py-4">No bookings yet. Share your profile to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardOverviewTab;
