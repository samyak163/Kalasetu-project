import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, Star, DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  useEffect(() => { fetchStats(); }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/dashboard/stats?period=${period}`, { withCredentials: true });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Artisans', value: stats?.overview.totalArtisans || 0, change: `+${stats?.overview.newArtisans || 0} this period`, icon: Briefcase, color: 'bg-blue-500', trend: 'up' },
    { title: 'Total Users', value: stats?.overview.totalUsers || 0, change: `+${stats?.overview.newUsers || 0} this period`, icon: Users, color: 'bg-green-500', trend: 'up' },
    { title: 'Total Reviews', value: stats?.overview.totalReviews || 0, change: 'All time', icon: Star, color: 'bg-yellow-500', trend: 'neutral' },
    { title: 'Revenue', value: `₹${(stats?.overview.totalRevenue || 0).toLocaleString()}`, change: `${stats?.overview.totalTransactions || 0} transactions`, icon: DollarSign, color: 'bg-purple-500', trend: 'up' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Admin!</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}><Icon className="w-6 h-6 text-white" /></div>
                {stat.trend === 'up' && (<TrendingUp className="w-5 h-5 text-green-500" />)}
                {stat.trend === 'down' && (<TrendingDown className="w-5 h-5 text-red-500" />)}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.growth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="artisans" stroke="#3B82F6" strokeWidth={2} name="Artisans" />
              <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} name="Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats?.topCategories || []} cx="50%" cy="50%" labelLine={false} label={(entry) => entry._id} outerRadius={80} fill="#8884d8" dataKey="count">
                {(stats?.topCategories || []).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Artisans</h3>
          <div className="space-y-3">
            {(stats?.recentActivity?.artisans || []).map((artisan) => (
              <div key={artisan._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Briefcase className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="font-medium text-gray-800">{artisan.fullName}</p>
                    <p className="text-sm text-gray-500">{artisan.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${artisan.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{artisan.isVerified ? 'Verified' : 'Pending'}</span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(artisan.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {(stats?.recentActivity?.users || []).map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="font-medium text-gray-800">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-lg text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2"><Activity className="w-5 h-5" /><span className="text-sm opacity-90">Active Artisans</span></div>
            <p className="text-3xl font-bold">{stats?.overview.activeArtisans || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2"><Star className="w-5 h-5" /><span className="text-sm opacity-90">Verified</span></div>
            <p className="text-3xl font-bold">{stats?.overview.verifiedArtisans || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5" /><span className="text-sm opacity-90">This Period</span></div>
            <p className="text-3xl font-bold">+{(stats?.overview.newArtisans || 0) + (stats?.overview.newUsers || 0)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5" /><span className="text-sm opacity-90">Avg. Transaction</span></div>
            <p className="text-3xl font-bold">₹{(stats?.overview.totalTransactions || 0) > 0 ? Math.round((stats?.overview.totalRevenue || 0) / (stats?.overview.totalTransactions || 1)) : 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


