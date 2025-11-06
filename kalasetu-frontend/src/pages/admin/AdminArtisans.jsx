import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, CheckCircle, Ban, Trash2, Eye, Mail, Phone, Calendar } from 'lucide-react';

const AdminArtisans = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [verified, setVerified] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { fetchArtisans(); }, [page, status, verified, search]);

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/artisans', {
        params: { page, search, status, verified, limit: 10 },
        withCredentials: true
      });
      setArtisans(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    if (!window.confirm(`Are you sure you want to ${isVerified ? 'verify' : 'unverify'} this artisan?`)) return;
    try {
      await axios.put(`/api/admin/artisans/${id}/verify`, { verified: isVerified }, { withCredentials: true });
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
      await axios.put(`/api/admin/artisans/${id}/status`, { isActive, reason }, { withCredentials: true });
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
      await axios.delete(`/api/admin/artisans/${id}`, { withCredentials: true });
      fetchArtisans();
      alert('Artisan deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete artisan');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Artisan Management</h1>
        <p className="text-gray-600 mt-1">Manage and moderate artisan accounts</p>
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
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No artisans found</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artisan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {artisans.map((artisan) => (
                    <tr key={artisan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={artisan.profileImage || '/default-avatar.png'} alt={artisan.fullName} className="w-10 h-10 rounded-full object-cover" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{artisan.fullName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {artisan.isVerified && (<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</span>)}
                              <span className="text-xs text-gray-500">⭐ {artisan.rating?.toFixed(1) || 0}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-gray-400" />{artisan.email}</div>
                          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{artisan.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{artisan.category || 'N/A'}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${artisan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{artisan.isActive ? 'Active' : 'Suspended'}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(artisan.createdAt).toLocaleDateString()}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => window.open(`/artisan/${artisan.publicId}`, '_blank')} className="text-blue-600 hover:text-blue-900" title="View Profile"><Eye className="w-5 h-5" /></button>
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
                <div className="text-sm text-gray-700">Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to <span className="font-medium">{Math.min(page * 10, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results</div>
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


