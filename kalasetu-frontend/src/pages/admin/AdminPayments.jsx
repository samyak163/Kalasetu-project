import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Search, Eye, RefreshCcw, AlertTriangle, DollarSign, Calendar, X, Download, CreditCard } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, SKELETON_ROWS, getPaginationRange } from '../../config/constants.js';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [page, status, startDate, endDate, minAmount, maxAmount, search]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: DEFAULT_PAGE_SIZE,
        status: status !== 'all' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        search: search || undefined
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const response = await api.get('/api/admin/payments', { params });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setPayments(list);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(err.response?.data?.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/payments/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleRefund = async (id) => {
    if (!window.confirm('Are you sure you want to process a refund for this payment?')) return;
    try {
      await api.post(`/api/admin/payments/${id}/refund`);
      fetchPayments();
      fetchStats();
      alert('Refund processed successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        status: status !== 'all' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        search: search || undefined,
        export: 'csv'
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const response = await api.get('/api/admin/payments', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const clearFilters = () => {
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
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

  const getPaymentMethodIcon = (method) => {
    return <CreditCard className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Payments Management</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">Manage and monitor all transactions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900 mt-1 truncate">
              {formatCurrency(stats.totalRevenue || 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Pending Payments</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingPayments || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Refunded Amount</div>
            <div className="text-2xl font-bold text-red-600 mt-1 truncate">
              {formatCurrency(stats.refundedAmount || 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Platform Commission</div>
            <div className="text-2xl font-bold text-blue-600 mt-1 truncate">
              {formatCurrency(stats.platformCommission || 0)}
            </div>
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
                placeholder="Search by user, artisan, or payment ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Amount (₹)</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Amount (₹)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
              placeholder="100000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
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
              onClick={fetchPayments}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Artisan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 bg-gray-200 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && payments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm md:text-base">No payments found</p>
          </div>
        )}
        {!loading && !error && payments.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Artisan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {payment.bookingId || payment.metadata?.bookingId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {payment.user?.fullName || payment.payerId?.fullName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {payment.user?.email || payment.payerId?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {payment.artisan?.fullName || payment.recipientId?.fullName || 'Unknown Artisan'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {payment.artisan?.email || payment.recipientId?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount || 0)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="truncate max-w-xs">
                            {payment.paymentMethod || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'paid' || payment.status === 'captured'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'refunded'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs font-mono">
                          {payment.razorpayPaymentId || payment.paymentId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {(payment.status === 'paid' || payment.status === 'captured') && (
                            <button
                              onClick={() => handleRefund(payment._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Process Refund"
                            >
                              <RefreshCcw className="w-5 h-5" />
                            </button>
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

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Payment ID</label>
                <p className="text-base text-gray-900 mt-1 font-mono break-all">
                  {selectedPayment.razorpayPaymentId || selectedPayment.paymentId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Order ID</label>
                <p className="text-base text-gray-900 mt-1 font-mono break-all">
                  {selectedPayment.razorpayOrderId || selectedPayment.orderId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-base text-gray-900 mt-1 font-semibold">
                  {formatCurrency(selectedPayment.amount || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-base text-gray-900 mt-1">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedPayment.status === 'paid' || selectedPayment.status === 'captured'
                        ? 'bg-green-100 text-green-800'
                        : selectedPayment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedPayment.status === 'refunded'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedPayment.status || 'pending'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">User</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedPayment.user?.fullName || selectedPayment.payerId?.fullName || 'Unknown User'} (
                  {selectedPayment.user?.email || selectedPayment.payerId?.email || 'N/A'})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Artisan</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedPayment.artisan?.fullName || selectedPayment.recipientId?.fullName || 'Unknown Artisan'} (
                  {selectedPayment.artisan?.email || selectedPayment.recipientId?.email || 'N/A'})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Method</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedPayment.paymentMethod || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="text-base text-gray-900 mt-1">
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedPayment.refundAmount && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Refund Amount</label>
                  <p className="text-base text-gray-900 mt-1 font-semibold text-red-600">
                    {formatCurrency(selectedPayment.refundAmount || 0)}
                  </p>
                  {selectedPayment.refundedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Refunded on: {new Date(selectedPayment.refundedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;

