import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../lib/axios';
import { displayRazorpay } from '../../lib/razorpay';
import { useAuth } from '../../context/AuthContext';

export default function PaymentButton({
  amount,
  purpose,
  recipientId,
  description,
  onSuccess,
  onError,
  className = '',
  children,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1: Create order
      const orderResponse = await api.post('/payments/create-order', {
        amount,
        purpose,
        recipientId,
        description,
      });

      const { razorpayOrderId, amount: orderAmount, currency, keyId } = orderResponse.data.data;

      // Step 2: Display Razorpay checkout
      const paymentResponse = await displayRazorpay({
        keyId,
        amount: orderAmount,
        currency,
        orderId: razorpayOrderId,
        description,
        prefill: {
          name: user?.fullName || user?.name,
          email: user?.email,
          contact: user?.phoneNumber || user?.phone || '',
        },
      });

      // Step 3: Verify payment
      const verifyResponse = await api.post('/payments/verify', {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      console.log('✅ Payment successful:', verifyResponse.data);

      if (onSuccess) {
        onSuccess(verifyResponse.data.data);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Pay ₹{amount?.toLocaleString('en-IN')}
        </>
      )}
    </button>
  );
}

PaymentButton.propTypes = {
  amount: PropTypes.number.isRequired,
  purpose: PropTypes.string.isRequired,
  recipientId: PropTypes.string,
  description: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};
