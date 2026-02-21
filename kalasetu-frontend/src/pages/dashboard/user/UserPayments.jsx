import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { CreditCard, Printer } from 'lucide-react';
import { Badge, Card, Skeleton, EmptyState, BottomSheet, Button } from '../../../components/ui';
import api from '../../../lib/axios.js';

// Map Razorpay payment statuses to Badge status prop values
const paymentStatusMap = {
  created: undefined,       // gray fallback
  pending: 'pending',
  authorized: 'confirmed',
  captured: 'completed',
  refunded: 'rejected',     // uses gray styling — neutral for refunded
  failed: 'cancelled',
};

// Human-readable labels for payment statuses
const statusLabels = {
  created: 'Created',
  pending: 'Pending',
  authorized: 'Authorized',
  captured: 'Captured',
  refunded: 'Refunded',
  failed: 'Failed',
};

const UserPayments = () => {
  const { showToast } = useContext(ToastContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/payments?type=sent&limit=50');
      setPayments(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefund = async () => {
    if (!refundTarget) return;
    try {
      setRefunding(true);
      await api.post(`/api/payments/${refundTarget._id}/refund`);
      showToast('Refund requested successfully', 'success');
      setRefundTarget(null);
      fetchPayments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request refund', 'error');
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 rounded" width="33%" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Payment History</h2>

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-12 h-12" />}
          title="No payments yet"
          description="Payments will appear here after you book a service."
        />
      ) : (
        <div className="space-y-3">
          {payments.map(payment => (
            <Card key={payment._id} hover={false} compact>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900">
                    {payment.description || payment.purpose || 'Payment'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {payment.razorpayPaymentId && (
                      <span className="text-xs text-gray-400">ID: {payment.razorpayPaymentId}</span>
                    )}
                  </div>
                  {payment.refundedAt && (
                    <div className="text-sm text-orange-600 mt-1">
                      Refunded on {new Date(payment.refundedAt).toLocaleDateString('en-IN')}
                      {payment.refundAmount ? ` — ${'\u20B9'}${payment.refundAmount.toLocaleString('en-IN')}` : ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-semibold text-gray-900">
                    {'\u20B9'}{(payment.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <Badge status={paymentStatusMap[payment.status]}>
                    {statusLabels[payment.status] || payment.status}
                  </Badge>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPayment(selectedPayment?._id === payment._id ? null : payment)}
                      className="text-xs text-brand-500 hover:underline"
                    >
                      {selectedPayment?._id === payment._id ? 'Hide' : 'Details'}
                    </button>
                    {payment.status === 'captured' && (
                      <button
                        onClick={() => setRefundTarget(payment)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Request Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable detail */}
              {selectedPayment?._id === payment._id && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Order ID:</span> {payment.razorpayOrderId || 'N/A'}</div>
                  <div><span className="font-medium">Payment ID:</span> {payment.razorpayPaymentId || 'N/A'}</div>
                  <div><span className="font-medium">Purpose:</span> {payment.purpose || 'N/A'}</div>
                  <div><span className="font-medium">Currency:</span> {payment.currency || 'INR'}</div>
                  <button
                    onClick={() => window.print()}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-brand-500 hover:underline font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Refund confirmation BottomSheet */}
      <BottomSheet
        open={!!refundTarget}
        onClose={() => setRefundTarget(null)}
        title="Confirm Refund"
      >
        {refundTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to request a refund for this payment?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="font-medium text-gray-900">
                {refundTarget.description || refundTarget.purpose || 'Payment'}
              </div>
              <div className="text-gray-500">
                {new Date(refundTarget.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </div>
              <div className="font-semibold text-gray-900">
                {'\u20B9'}{(refundTarget.amount || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setRefundTarget(null)}
                disabled={refunding}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={refunding}
                onClick={handleRefund}
              >
                Request Refund
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default UserPayments;
