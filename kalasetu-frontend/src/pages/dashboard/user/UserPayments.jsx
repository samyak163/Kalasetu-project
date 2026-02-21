import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';

const statusColors = {
  created: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-800',
  authorized: 'bg-blue-100 text-blue-800',
  captured: 'bg-green-100 text-green-800',
  refunded: 'bg-orange-100 text-orange-800',
  failed: 'bg-red-100 text-red-800',
};

const UserPayments = () => {
  const { showToast } = useContext(ToastContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

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

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to request a refund?')) return;
    try {
      await api.post(`/api/payments/${paymentId}/refund`);
      showToast('Refund requested successfully', 'success');
      fetchPayments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request refund', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Payment History</h2>

      {payments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="font-medium">No payments yet</p>
          <p className="text-sm mt-1">Payments will appear here after you book a service.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment._id} className="bg-white border border-gray-200 rounded-lg p-4">
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
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status] || 'bg-gray-100 text-gray-700'}`}>
                    {payment.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPayment(selectedPayment?._id === payment._id ? null : payment)}
                      className="text-xs text-[#A55233] hover:underline"
                    >
                      {selectedPayment?._id === payment._id ? 'Hide' : 'Details'}
                    </button>
                    {payment.status === 'captured' && (
                      <button
                        onClick={() => handleRefund(payment._id)}
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
                    className="mt-2 text-xs text-[#A55233] hover:underline font-medium"
                  >
                    Print Receipt
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPayments;
