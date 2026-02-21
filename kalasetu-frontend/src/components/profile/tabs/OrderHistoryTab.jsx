import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { Card, Avatar, Badge, Button, Input, StatusBadge, BottomSheet, EmptyState, Skeleton } from '../../ui';
import { ShoppingBag, IndianRupee, Calculator } from 'lucide-react';

const OrderHistoryTab = ({ user }) => {
  const { showToast } = React.useContext(ToastContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Refund state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrder, setRefundOrder] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundRequests, setRefundRequests] = useState({});

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

  const fetchRefundRequests = async () => {
    try {
      const res = await api.get('/api/refunds');
      const refunds = res.data?.data || [];
      // Build lookup map: bookingId -> refund info
      const refundMap = {};
      refunds.forEach(refund => {
        if (refund.booking) {
          refundMap[refund.booking] = {
            status: refund.status,
            amount: refund.amount,
            _id: refund._id
          };
        }
      });
      setRefundRequests(refundMap);
    } catch (error) {
      // Non-critical: refund status display is optional
      console.error('Failed to load refund requests:', error);
    }
  };

  // Single mount effect — filtering is client-side so no need to re-fetch on statusFilter change
  useEffect(() => {
    fetchOrders();
    fetchRefundRequests();
  }, []);

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

  const getRefundBadgeStatus = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'processing': return 'confirmed';
      case 'processed': return 'completed';
      case 'rejected': return 'rejected';
      case 'failed': return 'cancelled';
      default: return 'pending';
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

  const openRefundModal = (order) => {
    setRefundOrder(order);
    setRefundReason('');
    setRefundNotes('');
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundOrder(null);
    setRefundReason('');
    setRefundNotes('');
  };

  const handleSubmitRefund = async () => {
    if (!refundReason || !refundOrder) return;

    setRefundLoading(true);
    try {
      // Need to find the payment for this booking
      // The Payment model has metadata.bookingId that links to the booking
      // We need to get the payment ID first
      const paymentRes = await api.get('/api/payments', {
        params: { bookingId: refundOrder._id }
      });

      const payments = paymentRes.data?.data || [];
      const payment = payments.find(p => p.status === 'captured');

      if (!payment) {
        showToast('Unable to find payment for this booking. Please contact support.', 'error');
        setRefundLoading(false);
        return;
      }

      // Combine reason and notes
      const fullReason = refundNotes
        ? `${refundReason}\n\nAdditional details: ${refundNotes}`
        : refundReason;

      // Create refund request
      await api.post('/api/refunds', {
        paymentId: payment._id,
        amount: refundOrder.price,
        reason: fullReason
      });

      showToast('Refund request submitted successfully', 'success');
      closeRefundModal();
      // Refresh refund requests to update badges
      fetchRefundRequests();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit refund request';
      showToast(message, 'error');
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" height="28px" width="200px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rect" height="80px" />)}
        </div>
        <Skeleton variant="rect" height="44px" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rect" height="160px" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Order History</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View your past bookings and transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover={false} compact>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card hover={false} compact>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-50 rounded-lg">
              <IndianRupee className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{stats.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card hover={false} compact>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Order</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{Math.round(stats.avgOrder).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by service or artisan..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-input focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900 text-sm"
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
            <Card key={order._id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      src={order.artisan?.profileImageUrl}
                      name={order.artisan?.fullName || 'Artisan'}
                      size="md"
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
                <div className="text-right space-y-1.5">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{(order.price || 0).toLocaleString()}
                  </p>
                  <StatusBadge status={order.status} />
                  {refundRequests[order._id] && (
                    <div>
                      <Badge status={getRefundBadgeStatus(refundRequests[order._id].status)}>
                        Refund: {refundRequests[order._id].status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
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
                  <Button variant="primary" size="sm" onClick={() => handleRateReview(order)}>
                    Rate & Review
                  </Button>
                )}
                {order.status === 'completed' && !refundRequests[order._id] && (
                  <Button variant="primary" size="sm" onClick={() => openRefundModal(order)}>
                    Request Refund
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => handleViewDetails(order._id)}>
                  {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleRebook(order)}>
                  Rebook
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="No orders yet"
          description="Book your first artisan to get started!"
        />
      )}

      {/* Refund BottomSheet */}
      <BottomSheet open={showRefundModal} onClose={closeRefundModal} title="Request Refund">
        {refundOrder && (
          <div className="space-y-4">
            {/* Pre-filled order info (read-only) */}
            <Card hover={false} compact className="bg-gray-50">
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Service:</span> {refundOrder.serviceName}</p>
                <p><span className="font-medium">Artisan:</span> {refundOrder.artisan?.fullName}</p>
                <p><span className="font-medium">Amount:</span> ₹{refundOrder.price?.toLocaleString()}</p>
                <p><span className="font-medium">Date:</span> {new Date(refundOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </Card>

            {/* Reason dropdown */}
            <Input
              as="select"
              label="Reason for refund"
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
              options={[
                { value: '', label: 'Select a reason...' },
                { value: 'Service not as described', label: 'Service not as described' },
                { value: 'Poor quality of work', label: 'Poor quality of work' },
                { value: 'Artisan did not show up', label: 'Artisan did not show up' },
                { value: 'Service not completed', label: 'Service not completed' },
                { value: 'Duplicate payment', label: 'Duplicate payment' },
                { value: 'Changed my mind', label: 'Changed my mind' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            {/* Optional notes */}
            <Input
              as="textarea"
              label="Additional details (optional)"
              value={refundNotes}
              onChange={e => setRefundNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Provide any additional context..."
            />

            {/* Submit */}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={closeRefundModal} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitRefund}
                disabled={!refundReason}
                loading={refundLoading}
                className="flex-1"
              >
                Submit Request
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default OrderHistoryTab;
