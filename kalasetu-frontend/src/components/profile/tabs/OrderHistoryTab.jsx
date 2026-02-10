import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';

const OrderHistoryTab = ({ user }) => {
  const { showToast } = React.useContext(ToastContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/bookings/me');
      const data = res.data?.data || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const artisanName = order.artisan?.fullName || '';
        const serviceName = order.serviceName || '';
        return (
          serviceName.toLowerCase().includes(query) ||
          artisanName.toLowerCase().includes(query)
        );
      }
      return true;
    });

  const stats = {
    total: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + (o.price || 0), 0),
    avgOrder: orders.length > 0
      ? orders.reduce((sum, o) => sum + (o.price || 0), 0) / orders.length
      : 0,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleRateReview = (order) => {
    const publicId = order.artisan?.publicId;
    if (publicId) {
      navigate(`/${publicId}#reviews`);
    } else {
      showToast('Artisan profile not available', 'error');
    }
  };

  const handleViewDetails = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleRebook = (order) => {
    const publicId = order.artisan?.publicId;
    if (publicId) {
      navigate(`/${publicId}`);
    } else {
      showToast('Artisan profile not available', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading order history...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View your past bookings and transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{stats.totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Order</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{Math.round(stats.avgOrder).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by service or artisan..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={order.artisan?.profileImageUrl || 'https://placehold.co/50x50'}
                      alt={order.artisan?.fullName || 'Artisan'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {order.serviceName || 'Service'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {order.artisan?.fullName || 'Artisan'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {new Date(order.start || order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{(order.price || 0).toLocaleString()}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedOrderId === order._id && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm space-y-2">
                  {order.categoryName && (
                    <p><span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {order.categoryName}</p>
                  )}
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Scheduled:</span>{' '}
                    {new Date(order.start).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    {order.end && <> &mdash; {new Date(order.end).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</>}
                  </p>
                  {order.notes && (
                    <p><span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span> {order.notes}</p>
                  )}
                  {order.rejectionReason && (
                    <p><span className="font-medium text-gray-700 dark:text-gray-300">Rejection Reason:</span> {order.rejectionReason}</p>
                  )}
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Booking ID:</span>{' '}
                    <span className="font-mono text-xs">{order._id}</span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                {order.status === 'completed' && (
                  <button
                    onClick={() => handleRateReview(order)}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm"
                  >
                    Rate & Review
                  </button>
                )}
                <button
                  onClick={() => handleViewDetails(order._id)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  onClick={() => handleRebook(order)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Rebook
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No orders yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Book your first artisan to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryTab;
