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
      console.error('Failed to fetch users:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-1">Manage customer accounts</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={user.profileImage || '/default-avatar.png'} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-900"><Mail className="w-4 h-4 text-gray-400" />{user.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(user.createdAt).toLocaleDateString()}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900" title="View Details"><Eye className="w-5 h-5" /></button>
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
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
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


