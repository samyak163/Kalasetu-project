import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { RefreshCcw, IndianRupee, Users, Briefcase, CalendarCheck, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { Button, Card, Skeleton, EmptyState } from '../../components/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatINR = (amount) => {
  if (amount == null) return '0';
  return Number(amount).toLocaleString('en-IN');
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS = {
  completed: 'bg-success-500',
  confirmed: 'bg-blue-500',
  pending: 'bg-warning-400',
  cancelled: 'bg-error-500',
  'in-progress': 'bg-brand-500',
  refunded: 'bg-purple-500',
};

const statusColor = (name) => STATUS_COLORS[name?.toLowerCase()] || 'bg-gray-400';

// ---------------------------------------------------------------------------
// Reusable UI pieces
// ---------------------------------------------------------------------------

const StatCard = ({ icon: Icon, label, value, sub, iconBg = 'bg-brand-500' }) => ( // eslint-disable-line no-unused-vars
  <Card hover={false} padding={false} className="p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className={`${iconBg} p-2.5 rounded-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>}
  </Card>
);

const SectionError = () => (
  <EmptyState
    icon={<AlertCircle className="w-8 h-8" />}
    title="No data available"
  />
);

const VerticalBars = ({ data, valueKey = 'amount', labelKey = 'month', color = 'bg-brand-500' }) => {
  if (!Array.isArray(data) || data.length === 0) return <SectionError />;
  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((item, idx) => (
        <div key={item[labelKey] ?? idx} className="flex-1 flex flex-col items-center group relative">
          <div
            className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80 min-h-[2px]`}
            style={{ height: `${(item[valueKey] / maxVal) * 100}%` }}
            title={`${item[labelKey]}: ${formatINR(item[valueKey])}`}
          />
          <div className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
            {item[labelKey]}
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonCard = () => (
  <Card hover={false} padding={false} className="p-5">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <Skeleton className="h-3 w-20 rounded" />
    </div>
    <Skeleton className="h-6 w-28 rounded mt-2" />
    <Skeleton className="h-3 w-16 rounded mt-2" />
  </Card>
);

const SkeletonBars = () => (
  <div className="flex items-end gap-1 h-40">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="flex-1 flex flex-col items-center">
        <Skeleton className="w-full rounded-t" height={`${20 + Math.random() * 60}%`} />
        <Skeleton className="h-2 w-full rounded mt-1" />
      </div>
    ))}
  </div>
);

const SkeletonSection = () => (
  <div className="space-y-4">
    <Skeleton className="h-5 w-40 rounded" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <Card hover={false} padding={false} className="p-5">
      <Skeleton className="h-4 w-32 rounded mb-4" />
      <SkeletonBars />
    </Card>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AdminAnalytics = () => {
  const [revenue, setRevenue] = useState(null);
  const [users, setUsers] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ revenue: false, users: false, bookings: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrors({ revenue: false, users: false, bookings: false });

    const [revRes, usrRes, bkgRes] = await Promise.allSettled([
      api.get('/api/admin/analytics/revenue'),
      api.get('/api/admin/analytics/users'),
      api.get('/api/admin/analytics/bookings'),
    ]);

    if (revRes.status === 'fulfilled' && revRes.value?.data?.success) {
      setRevenue(revRes.value.data.data);
    } else {
      setRevenue(null);
      setErrors((prev) => ({ ...prev, revenue: true }));
    }

    if (usrRes.status === 'fulfilled' && usrRes.value?.data?.success) {
      setUsers(usrRes.value.data.data);
    } else {
      setUsers(null);
      setErrors((prev) => ({ ...prev, users: true }));
    }

    if (bkgRes.status === 'fulfilled' && bkgRes.value?.data?.success) {
      setBookings(bkgRes.value.data.data);
    } else {
      setBookings(null);
      setErrors((prev) => ({ ...prev, bookings: true }));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Revenue helpers ----------
  const monthlyRevenue = revenue?.monthlyRevenue || [];
  // Backend sends "byCategory", not "revenueByCategory"
  const revenueByCategory = revenue?.revenueByCategory || revenue?.byCategory || [];
  const totalRevenue = revenue?.totalRevenue ?? 0;

  // ---------- Users helpers ----------
  const totalUsers = users?.totalUsers ?? 0;
  const totalArtisans = users?.totalArtisans ?? 0;
  // Backend sends { users: N, artisans: N } — sum both for display
  const rawNewThisMonth = users?.newThisMonth;
  const newThisMonth = typeof rawNewThisMonth === 'object'
    ? (rawNewThisMonth?.users ?? 0) + (rawNewThisMonth?.artisans ?? 0)
    : rawNewThisMonth ?? 0;
  // Backend sends { users: [...], artisans: [...] } — merge into single sorted array
  const rawMonthlyGrowth = users?.monthlyGrowth;
  const monthlyGrowth = Array.isArray(rawMonthlyGrowth)
    ? rawMonthlyGrowth
    : (() => {
        const userArr = Array.isArray(rawMonthlyGrowth?.users) ? rawMonthlyGrowth.users : [];
        const artisanArr = Array.isArray(rawMonthlyGrowth?.artisans) ? rawMonthlyGrowth.artisans : [];
        const merged = {};
        userArr.forEach(u => { merged[u.month] = (merged[u.month] || 0) + u.count; });
        artisanArr.forEach(a => { merged[a.month] = (merged[a.month] || 0) + a.count; });
        return Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
      })();

  // ---------- Bookings helpers ----------
  const totalBookings = bookings?.totalBookings ?? 0;
  const completionRate = bookings?.completionRate ?? 0;
  const cancellationRate = bookings?.cancellationRate ?? 0;
  // byStatus may be an object { completed: 5, pending: 3 } or an array — normalize to array
  const rawByStatus = bookings?.byStatus;
  const byStatus = Array.isArray(rawByStatus)
    ? rawByStatus
    : rawByStatus && typeof rawByStatus === 'object'
      ? Object.entries(rawByStatus).map(([status, count]) => ({ status, count }))
      : [];
  const popularCategories = bookings?.popularCategories || [];
  const monthlyTrend = bookings?.monthlyTrend || [];

  // Compute total for status percentage bar
  const statusTotal = byStatus.reduce((acc, s) => acc + (s.count || 0), 0) || 1;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Platform Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            In-depth platform metrics across revenue, users, and bookings.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={fetchData}
          disabled={loading}
          loading={loading}
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ================================================================= */}
      {/* REVENUE SECTION                                                    */}
      {/* ================================================================= */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-brand-500" />
          Revenue
        </h2>

        {loading ? (
          <SkeletonSection />
        ) : errors.revenue ? (
          <Card hover={false}>
            <SectionError />
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Stat card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon={IndianRupee}
                label="Total Revenue"
                value={`\u20B9${formatINR(totalRevenue)}`}
                iconBg="bg-brand-700"
              />
            </div>

            {/* Monthly revenue chart */}
            <Card hover={false} padding={false} className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue (Last 12 Months)</h3>
              <VerticalBars data={monthlyRevenue} valueKey="amount" labelKey="month" />
            </Card>

            {/* Revenue by category */}
            {revenueByCategory.length > 0 && (
              <Card hover={false} padding={false} className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue by Category</h3>
                <div className="space-y-2">
                  {revenueByCategory.map((cat) => {
                    const maxCat = Math.max(...revenueByCategory.map((c) => c.amount || 0), 1);
                    const pct = ((cat.amount || 0) / maxCat) * 100;
                    return (
                      <div key={cat.purpose || cat.category || cat._id} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-32 truncate">
                          {cat.purpose || cat.category || cat._id || 'Other'}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-brand-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-24 text-right">
                          {`\u20B9${formatINR(cat.amount)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </section>

      <hr className="border-gray-200" />

      {/* ================================================================= */}
      {/* USERS SECTION                                                      */}
      {/* ================================================================= */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-500" />
          Users
        </h2>

        {loading ? (
          <SkeletonSection />
        ) : errors.users ? (
          <Card hover={false}>
            <SectionError />
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Users} label="Total Users" value={formatINR(totalUsers)} iconBg="bg-success-600" />
              <StatCard icon={Briefcase} label="Total Artisans" value={formatINR(totalArtisans)} iconBg="bg-brand-500" />
              <StatCard
                icon={TrendingUp}
                label="New This Month"
                value={formatINR(newThisMonth)}
                iconBg="bg-blue-500"
              />
            </div>

            {/* Monthly growth chart */}
            <Card hover={false} padding={false} className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly User Growth</h3>
              <VerticalBars data={monthlyGrowth} valueKey="count" labelKey="month" color="bg-success-500" />
            </Card>
          </div>
        )}
      </section>

      <hr className="border-gray-200" />

      {/* ================================================================= */}
      {/* BOOKINGS SECTION                                                   */}
      {/* ================================================================= */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-brand-500" />
          Bookings
        </h2>

        {loading ? (
          <SkeletonSection />
        ) : errors.bookings ? (
          <Card hover={false}>
            <SectionError />
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon={CalendarCheck}
                label="Total Bookings"
                value={formatINR(totalBookings)}
                iconBg="bg-brand-500"
              />
              <StatCard
                icon={BarChart3}
                label="Completion Rate"
                value={`${Number(completionRate).toFixed(1)}%`}
                iconBg="bg-success-600"
              />
              <StatCard
                icon={AlertCircle}
                label="Cancellation Rate"
                value={`${Number(cancellationRate).toFixed(1)}%`}
                iconBg="bg-error-500"
              />
            </div>

            {/* Bookings by status -- horizontal stacked bar */}
            {byStatus.length > 0 && (
              <Card hover={false} padding={false} className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Bookings by Status</h3>
                <div className="flex h-8 rounded-full overflow-hidden">
                  {byStatus.map((s) => (
                    <div
                      key={s.status || s.name || s._id}
                      className={`${statusColor(s.status || s.name || s._id)} transition-all duration-500`}
                      style={{ width: `${((s.count || 0) / statusTotal) * 100}%` }}
                      title={`${s.status || s.name || s._id}: ${s.count}`}
                    />
                  ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-3">
                  {byStatus.map((s) => (
                    <div key={s.status || s.name || s._id} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-full ${statusColor(s.status || s.name || s._id)}`} />
                      <span className="text-xs text-gray-600 capitalize">{s.status || s.name || s._id}</span>
                      <span className="text-xs text-gray-400">({s.count || 0})</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Popular categories */}
            {popularCategories.length > 0 && (
              <Card hover={false} padding={false} className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Categories (Top 5)</h3>
                <div className="space-y-2">
                  {popularCategories.slice(0, 5).map((cat, idx) => {
                    const maxCat = Math.max(...popularCategories.slice(0, 5).map((c) => c.count || 0), 1);
                    const pct = ((cat.count || 0) / maxCat) * 100;
                    return (
                      <div key={cat.category || cat._id || idx} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-5">{idx + 1}.</span>
                        <span className="text-sm text-gray-600 w-32 truncate">
                          {cat.category || cat._id || 'Other'}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-brand-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">{cat.count || 0}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Monthly trend */}
            <Card hover={false} padding={false} className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Booking Trend</h3>
              <VerticalBars data={monthlyTrend} valueKey="count" labelKey="month" color="bg-blue-500" />
            </Card>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAnalytics;
