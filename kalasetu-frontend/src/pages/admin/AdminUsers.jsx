import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Search, Mail, Calendar, Eye, RefreshCcw, AlertTriangle } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, SKELETON_ROWS, getPaginationRange } from '../../config/constants.js';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
  const response = await api.get('/api/admin/users', { params: { page, search, limit: DEFAULT_PAGE_SIZE } });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setUsers(list);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      // Log fetch error details for debugging
      if (err.response?.status === 403) {
        setError('Permission denied: your admin role lacks required permissions for users.');
      } else {
        setError(err.response?.data?.message || 'Failed to load users');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from users
  const stats = {
    total: users.length,
    newThisMonth: users.filter(u => {
      const created = new Date(u.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage customer accounts</p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2 text-sm md:text-base"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 truncate">Total Users</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{pagination?.total || stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 truncate">New This Month</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.newThisMonth}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 truncate">Active Users</div>
          <div className="text-2xl font-bold text-brand-500 mt-1">{pagination?.total || stats.total}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error && !loading && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-1">Check admin authentication and CORS configuration. You can retry the request.</p>
            </div>
            <button onClick={fetchUsers} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700">
              <RefreshCcw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}
        {loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3"/>
                  <th className="px-6 py-3"/>
                  <th className="px-6 py-3"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div>
                          <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                          <div className="h-3 w-20 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-3 w-40 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 bg-gray-200 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="text-center py-12"><p className="text-gray-500">No users found</p></div>
        )}
        {!loading && !error && users.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center min-w-0">
                          <img src={user.profileImage || '/default-avatar.png'} alt={user.fullName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{user.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-900 min-w-0"><Mail className="w-4 h-4 text-gray-400 flex-shrink-0" /><span className="truncate max-w-xs">{user.email}</span></div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(user.createdAt).toLocaleDateString()}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-brand-500 hover:text-brand-700" title="View Details"><Eye className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {(() => { const rng = getPaginationRange(page, pagination.total, DEFAULT_PAGE_SIZE); return <>Showing {rng.start} to {rng.end} of {pagination.total} results</>; })()}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">Previous</button>
                  <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;


