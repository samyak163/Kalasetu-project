import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { RefreshCcw, IndianRupee, Users, Briefcase, CalendarCheck, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatINR = (amount) => {
  if (amount == null) return '0';
  return Number(amount).toLocaleString('en-IN');
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS = {
  completed: 'bg-green-500',
  confirmed: 'bg-blue-500',
  pending: 'bg-yellow-400',
  cancelled: 'bg-red-500',
  'in-progress': 'bg-brand-500',
  refunded: 'bg-purple-500',
};

const statusColor = (name) => STATUS_COLORS[name?.toLowerCase()] || 'bg-gray-400';

// ---------------------------------------------------------------------------
// Reusable UI pieces
// ---------------------------------------------------------------------------

const StatCard = ({ icon: Icon, label, value, sub, iconBg = 'bg-brand-500' }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center gap-3 mb-3">
      <div className={`${iconBg} p-2.5 rounded-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>}
  </div>
);

const SectionError = () => (
  <div className="flex items-center gap-2 text-gray-400 py-6 justify-center">
    <AlertCircle className="w-5 h-5" />
    <span className="text-sm">No data available</span>
  </div>
);

const VerticalBars = ({ data, valueKey = 'amount', labelKey = 'month', color = 'bg-[#A55233]' }) => {
  if (!data || data.length === 0) return <SectionError />;
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
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
    </div>
    <div className="h-6 w-28 bg-gray-200 rounded mt-2" />
    <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
  </div>
);

const SkeletonBars = () => (
  <div className="flex items-end gap-1 h-40 animate-pulse">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="flex-1 flex flex-col items-center">
        <div className="w-full bg-gray-200 rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
        <div className="h-2 w-full bg-gray-100 rounded mt-1" />
      </div>
    ))}
  </div>
);

const SkeletonSection = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-5 w-40 bg-gray-200 rounded" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <SkeletonBars />
    </div>
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
  const revenueByCategory = revenue?.revenueByCategory || [];
  const totalRevenue = revenue?.totalRevenue ?? 0;

  // ---------- Users helpers ----------
  const totalUsers = users?.totalUsers ?? 0;
  const totalArtisans = users?.totalArtisans ?? 0;
  const newThisMonth = users?.newThisMonth ?? 0;
  const monthlyGrowth = users?.monthlyGrowth || [];

  // ---------- Bookings helpers ----------
  const totalBookings = bookings?.totalBookings ?? 0;
  const completionRate = bookings?.completionRate ?? 0;
  const cancellationRate = bookings?.cancellationRate ?? 0;
  const byStatus = bookings?.byStatus || [];
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
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2 text-sm md:text-base"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <SectionError />
          </div>
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
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue (Last 12 Months)</h3>
              <VerticalBars data={monthlyRevenue} valueKey="amount" labelKey="month" />
            </div>

            {/* Revenue by category */}
            {revenueByCategory.length > 0 && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
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
                            className="bg-[#A55233] h-full rounded-full transition-all duration-500"
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
              </div>
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <SectionError />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Users} label="Total Users" value={formatINR(totalUsers)} iconBg="bg-green-600" />
              <StatCard icon={Briefcase} label="Total Artisans" value={formatINR(totalArtisans)} iconBg="bg-brand-500" />
              <StatCard
                icon={TrendingUp}
                label="New This Month"
                value={formatINR(newThisMonth)}
                iconBg="bg-blue-500"
              />
            </div>

            {/* Monthly growth chart */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly User Growth</h3>
              <VerticalBars data={monthlyGrowth} valueKey="count" labelKey="month" color="bg-green-500" />
            </div>
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <SectionError />
          </div>
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
                iconBg="bg-green-600"
              />
              <StatCard
                icon={AlertCircle}
                label="Cancellation Rate"
                value={`${Number(cancellationRate).toFixed(1)}%`}
                iconBg="bg-red-500"
              />
            </div>

            {/* Bookings by status -- horizontal stacked bar */}
            {byStatus.length > 0 && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
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
              </div>
            )}

            {/* Popular categories */}
            {popularCategories.length > 0 && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
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
              </div>
            )}

            {/* Monthly trend */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Booking Trend</h3>
              <VerticalBars data={monthlyTrend} valueKey="count" labelKey="month" color="bg-blue-500" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAnalytics;
