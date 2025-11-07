import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Search, CheckCircle, Ban, Trash2, Eye, Mail, Phone, Calendar, RefreshCcw, AlertTriangle } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, SKELETON_ROWS, getPaginationRange } from '../../config/constants.js';

const AdminArtisans = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [verified, setVerified] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { fetchArtisans(); }, [page, status, verified, search]);

  const fetchArtisans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/artisans', {
        params: { page, search, status, verified, limit: DEFAULT_PAGE_SIZE }
      });
      // Expecting shape: { data: [...], pagination: { total, pages } }
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setArtisans(list);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      console.error('Failed to fetch artisans:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      if (err.response?.status === 403) {
        setError('Permission denied: your admin role lacks required permissions for artisans.');
      } else {
        setError(err.response?.data?.message || 'Failed to load artisans');
      }
      setArtisans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    if (!window.confirm(`Are you sure you want to ${isVerified ? 'verify' : 'unverify'} this artisan?`)) return;
    try {
      await api.put(`/api/admin/artisans/${id}/verify`, { verified: isVerified });
      fetchArtisans();
      alert(`Artisan ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch {
      alert('Failed to update verification status');
    }
  };

  const handleStatusChange = async (id, isActive) => {
    const reason = prompt(`Please provide a reason for ${isActive ? 'activating' : 'suspending'} this artisan:`);
    if (!reason) return;
    try {
      await api.put(`/api/admin/artisans/${id}/status`, { isActive, reason });
      fetchArtisans();
      alert(`Artisan ${isActive ? 'activated' : 'suspended'} successfully`);
    } catch {
      alert('Failed to update artisan status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to DELETE this artisan? This action cannot be undone!')) return;
    const confirmation = prompt('Type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') {
      alert('Deletion cancelled');
      return;
    }
    try {
      await api.delete(`/api/admin/artisans/${id}`);
      fetchArtisans();
      alert('Artisan deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete artisan');
    }
  };

  // Calculate stats from artisans
  const stats = {
    total: artisans.length,
    verified: artisans.filter(a => a.isVerified).length,
    active: artisans.filter(a => a.isActive).length,
    suspended: artisans.filter(a => !a.isActive).length
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Artisan Management</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage and moderate artisan accounts</p>
        </div>
        <button
          onClick={() => fetchArtisans()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 truncate">Total Artisans</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{pagination?.total || stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 truncate">Verified</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.verified}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 truncate">Active</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 truncate">Suspended</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.suspended}</div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-2">
        <button
          onClick={() => { setStatus('all'); setVerified('all'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            status === 'all' && verified === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setStatus('active'); setVerified('verified'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            status === 'active' && verified === 'verified'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Verified & Active
        </button>
        <button
          onClick={() => { setVerified('unverified'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            verified === 'unverified'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unverified
        </button>
        <button
          onClick={() => { setStatus('inactive'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            status === 'inactive'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Suspended
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or phone..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Suspended</option>
          </select>
          <select value={verified} onChange={(e) => setVerified(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
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
            <button onClick={fetchArtisans} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700">
              <RefreshCcw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}
        {loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artisan</th>
                  <th className="px-6 py-3"/>
                  <th className="px-6 py-3"/>
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
                    <td className="px-6 py-4"><div className="h-3 w-40 bg-gray-200 rounded mb-2" /><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 bg-gray-200 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && artisans.length === 0 && (
          <div className="text-center py-12"><p className="text-gray-500">No artisans found</p></div>
        )}
        {!loading && !error && artisans.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Artisan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {artisans.map((artisan) => (
                    <tr key={artisan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center min-w-0">
                          <img src={artisan.profileImage || '/default-avatar.png'} alt={artisan.fullName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{artisan.fullName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {artisan.isVerified && (<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0"><CheckCircle className="w-3 h-3 mr-1" />Verified</span>)}
                              <span className="text-xs text-gray-500 flex-shrink-0">⭐ {artisan.rating?.toFixed(1) || 0}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 min-w-0">
                          <div className="flex items-center gap-2 mb-1 truncate max-w-xs"><Mail className="w-4 h-4 text-gray-400 flex-shrink-0" /><span className="truncate">{artisan.email}</span></div>
                          <div className="flex items-center gap-2 truncate max-w-xs"><Phone className="w-4 h-4 text-gray-400 flex-shrink-0" /><span className="truncate">{artisan.phoneNumber}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 truncate max-w-xs">{artisan.category || 'N/A'}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${artisan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{artisan.isActive ? 'Active' : 'Suspended'}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(artisan.createdAt).toLocaleDateString()}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => window.open(`/artisan/${artisan.publicId || artisan._id}`, '_blank')} className="text-blue-600 hover:text-blue-900" title="View Profile"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => handleVerify(artisan._id, !artisan.isVerified)} className={artisan.isVerified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} title={artisan.isVerified ? 'Unverify' : 'Verify'}><CheckCircle className="w-5 h-5" /></button>
                          <button onClick={() => handleStatusChange(artisan._id, !artisan.isActive)} className={artisan.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} title={artisan.isActive ? 'Suspend' : 'Activate'}><Ban className="w-5 h-5" /></button>
                          <button onClick={() => handleDelete(artisan._id)} className="text-red-600 hover:text-red-900" title="Delete (Super Admin Only)"><Trash2 className="w-5 h-5" /></button>
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
                  {(() => { const rng = getPaginationRange(page, pagination.total, DEFAULT_PAGE_SIZE); return <>Showing <span className="font-medium">{rng.start}</span> to <span className="font-medium">{rng.end}</span> of <span className="font-medium">{pagination.total}</span> results</>; })()}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminArtisans;


