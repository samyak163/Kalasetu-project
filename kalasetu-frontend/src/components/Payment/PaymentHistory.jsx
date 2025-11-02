import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../lib/axios';

export default function PaymentHistory({ type = 'sent' }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/payments', {
        params: { type, limit: 50 },
      });

      setPayments(response.data.data.payments);
    } catch (err) {
      console.error('Failed to load payments:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to request a refund?')) {
      return;
    }

    try {
      await api.post(`/payments/${paymentId}/refund`, {
        reason: 'User requested refund',
      });

      alert('Refund request submitted successfully');
      loadPayments();
    } catch (err) {
      console.error('Failed to request refund:', err);
      alert('Failed to request refund');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      captured: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <p className="text-gray-600">No payments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div
          key={payment._id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {payment.description || payment.purpose.replace('_', ' ')}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {getStatusBadge(payment.status)}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{payment.amount.toLocaleString('en-IN')}
              </p>
              {type === 'sent' && payment.recipientId && (
                <p className="text-sm text-gray-600">
                  To: {payment.recipientId.fullName}
                </p>
              )}
              {type === 'received' && payment.payerId && (
                <p className="text-sm text-gray-600">
                  From: {payment.payerId.fullName}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {type === 'sent' && payment.status === 'captured' && !payment.refundId && (
                <button
                  onClick={() => handleRefund(payment._id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Request Refund
                </button>
              )}
            </div>
          </div>

          {payment.razorpayPaymentId && (
            <p className="mt-3 text-xs text-gray-500">
              Payment ID: {payment.razorpayPaymentId}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

PaymentHistory.propTypes = {
  type: PropTypes.oneOf(['sent', 'received']),
};
