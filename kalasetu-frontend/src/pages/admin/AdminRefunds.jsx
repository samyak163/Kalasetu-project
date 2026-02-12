import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { Search, Eye, RefreshCcw, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, SKELETON_ROWS, getPaginationRange } from '../../config/constants.js';

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: DEFAULT_PAGE_SIZE,
        status: status !== 'all' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await api.get('/api/admin/refunds', { params });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setRefunds(list);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load refund requests');
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, startDate, endDate, search]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/refunds/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch {
      // Non-critical error - stats are optional
    }
  };

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [fetchRefunds]);

  const handleViewDetails = (refund) => {
    setSelectedRefund(refund);
    setShowModal(true);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this refund request? This will initiate a refund via Razorpay.')) return;

    setActionLoading(true);
    try {
      await api.post(`/api/admin/refunds/${id}/approve`);
      fetchRefunds();
      fetchStats();
      setShowModal(false);
      alert('Refund approved and initiated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/api/admin/refunds/${id}/reject`, { reason: rejectReason });
      fetchRefunds();
      fetchStats();
      setShowModal(false);
      setShowRejectForm(false);
      setRejectReason('');
      alert('Refund rejected successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject refund');
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount / 100); // Assuming amount is in paise
  };

  const getStatusBadge = (statusValue) => {
    const badgeClasses = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-blue-100 text-blue-800',
      processing: 'bg-blue-100 text-blue-800',
      processed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClasses[statusValue] || 'bg-gray-100 text-gray-800'}`}>
        {statusValue || 'pending'}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Refund Management</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">Manage and process refund requests</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Total Requests</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Pending</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pending || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Processing</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.processing || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Processed</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.processed || 0}</div>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {formatCurrency(stats.processedAmount || 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Rejected</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.rejected || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by payment ID, user name, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error && !loading && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700 truncate">{error}</p>
              <p className="text-xs text-red-600 mt-1">Check admin authentication and CORS configuration. You can retry the request.</p>
            </div>
            <button
              onClick={fetchRefunds}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 flex-shrink-0"
            >
              <RefreshCcw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}
        {loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Requester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Requested Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 bg-gray-200 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && refunds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm md:text-base">No refund requests found</p>
          </div>
        )}
        {!loading && !error && refunds.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Requested Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {refunds.map((refund) => (
                    <tr key={refund._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs font-mono">
                          {refund._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {refund.requestedBy?.fullName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {refund.requestedBy?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs font-mono">
                          {refund.payment?.razorpayPaymentId || refund.payment?._id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(refund.amount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(refund)}
                            className="text-brand-500 hover:text-brand-700"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {refund.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(refund._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve Refund"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRefund(refund);
                                  setShowModal(true);
                                  setShowRejectForm(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject Refund"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
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
                  {(() => {
                    const rng = getPaginationRange(page, pagination.total, DEFAULT_PAGE_SIZE);
                    return (
                      <>
                        Showing <span className="font-medium">{rng.start}</span> to{' '}
                        <span className="font-medium">{rng.end}</span> of{' '}
                        <span className="font-medium">{pagination.total}</span> results
                      </>
                    );
                  })()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Refund Details Modal */}
      {showModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Refund Request Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Refund Request ID</label>
                <p className="text-base text-gray-900 mt-1 font-mono break-all">
                  {selectedRefund._id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-base text-gray-900 mt-1">
                  {getStatusBadge(selectedRefund.status)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Requester</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedRefund.requestedBy?.fullName || 'Unknown'} (
                  {selectedRefund.requestedBy?.email || 'N/A'})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment ID</label>
                <p className="text-base text-gray-900 mt-1 font-mono break-all">
                  {selectedRefund.payment?.razorpayPaymentId || selectedRefund.payment?._id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Refund Amount</label>
                <p className="text-base text-gray-900 mt-1 font-semibold">
                  {formatCurrency(selectedRefund.amount || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Reason for Refund</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedRefund.reason || 'No reason provided'}
                </p>
              </div>
              {selectedRefund.evidence && selectedRefund.evidence.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Evidence</label>
                  <div className="mt-2 space-y-2">
                    {selectedRefund.evidence.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-500 hover:text-brand-700 text-sm block truncate"
                      >
                        Evidence {idx + 1}: {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Requested Date</label>
                <p className="text-base text-gray-900 mt-1">
                  {new Date(selectedRefund.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedRefund.adminResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Response</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedRefund.adminResponse.message || 'No message provided'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    By: {selectedRefund.adminResponse.adminId?.email || 'Unknown Admin'} on{' '}
                    {new Date(selectedRefund.adminResponse.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedRefund.razorpayRefundId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Razorpay Refund ID</label>
                  <p className="text-base text-gray-900 mt-1 font-mono break-all">
                    {selectedRefund.razorpayRefundId}
                  </p>
                </div>
              )}
              {selectedRefund.failureReason && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Failure Reason</label>
                  <p className="text-base text-red-600 mt-1">
                    {selectedRefund.failureReason}
                  </p>
                </div>
              )}

              {/* Reject Form (only shown when showRejectForm is true) */}
              {showRejectForm && selectedRefund.status === 'pending' && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-sm font-medium text-gray-600">Rejection Reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={4}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              {selectedRefund.status === 'pending' && !showRejectForm && (
                <>
                  <button
                    onClick={() => handleApprove(selectedRefund._id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading ? 'Processing...' : 'Approve Refund'}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Refund
                  </button>
                </>
              )}
              {showRejectForm && selectedRefund.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedRefund._id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    Cancel
                  </button>
                </>
              )}
              {(selectedRefund.status !== 'pending' || (!showRejectForm && !actionLoading)) && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;
