import { useState, useCallback } from 'react';
import { IndianRupee, AlertCircle } from 'lucide-react';
import api from '../../lib/axios.js';
import { displayRazorpay } from '../../lib/razorpay.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { BottomSheet, Button, Alert, SlideToConfirm } from '../ui/index.js';

/**
 * Step 2 of the booking flow — order summary, price breakdown, SlideToConfirm.
 * On confirm → creates Razorpay order via API → opens Razorpay checkout → verifies.
 *
 * Props:
 *  - service: ArtisanService object
 *  - artisan: Artisan object
 *  - bookingData: { date, time, notes } from ServiceSummarySheet
 *  - open: boolean
 *  - onClose: () => void
 *  - onSuccess: ({ bookingId, paymentId }) => void — advances to confirmation
 *  - onError: (message) => void — error handler
 */
export default function PaymentSheet({ service, artisan, bookingData, open, onClose, onSuccess, onError }) {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const servicePrice = service?.price || 0;
  // Platform fee (transparent even if Rs.0 — design doc requirement)
  const platformFee = 0;
  const totalAmount = servicePrice + platformFee;

  const handleConfirm = useCallback(async () => {
    if (processing || !service || !artisan || !bookingData) return;
    setProcessing(true);
    setError(null);

    try {
      // Build ISO start time from date + time
      const startISO = `${bookingData.date}T${bookingData.time}:00+05:30`;

      // Step 1: Create Razorpay order with booking intent
      const orderRes = await api.post('/api/payments/create-order', {
        serviceId: service._id,
        artisanId: artisan._id,
        start: startISO,
        notes: bookingData.notes || '',
        purpose: 'service',
      });

      const { razorpayOrderId, amount, currency, keyId } = orderRes.data.data;

      // Step 2: Open Razorpay checkout
      const razorpayResponse = await displayRazorpay({
        keyId,
        orderId: razorpayOrderId,
        amount,
        currency,
        description: `${service.name} — ${artisan.fullName}`,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phoneNumber || '',
        },
      });

      // Step 3: Verify payment → booking created atomically on backend
      const verifyRes = await api.post('/api/payments/verify', {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      });

      const { bookingId, paymentId, bookingStatus } = verifyRes.data.data;
      onSuccess({ bookingId, paymentId, bookingStatus });

    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Payment failed. Please try again.';

      // Razorpay cancellation is not a real error
      if (message === 'Payment cancelled by user') {
        setProcessing(false);
        return;
      }

      setError(message);
      onError?.(message);
    } finally {
      setProcessing(false);
    }
  }, [processing, service, artisan, bookingData, user, onSuccess, onError]);

  if (!service || !artisan || !bookingData) return null;

  const formattedDate = new Date(`${bookingData.date}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const formattedTime = formatSlotTime(bookingData.time);

  return (
    <BottomSheet
      open={open}
      onClose={processing ? undefined : onClose}
      title="Confirm Payment"
    >
      <div className="space-y-5">
        {/* Order summary */}
        <div className="bg-surface-muted rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service</span>
            <span className="font-medium text-gray-900">{service.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date</span>
            <span className="text-gray-900">{formattedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Time</span>
            <span className="text-gray-900">{formattedTime}</span>
          </div>
          {service.durationMinutes > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duration</span>
              <span className="text-gray-900">{formatDuration(service.durationMinutes)}</span>
            </div>
          )}
        </div>

        {/* Price breakdown — transparent even if platform fee is Rs.0 (design doc) */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service fee</span>
            <span className="text-gray-900 flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3" />
              {servicePrice.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform fee</span>
            <span className="text-gray-900 flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3" />
              {platformFee === 0 ? 'Free' : platformFee.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900 flex items-center gap-0.5">
              <IndianRupee className="h-3.5 w-3.5" />
              {totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Error state with retry — Swiggy empathetic pattern */}
        {error && (
          <Alert type="error" className="text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Payment could not be completed</p>
                <p className="text-xs mt-1 opacity-80">{error}</p>
              </div>
            </div>
          </Alert>
        )}

        {/* Slide-to-Confirm or retry button */}
        {error ? (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleConfirm}
            loading={processing}
          >
            Try Again
          </Button>
        ) : (
          <div className={processing ? 'opacity-50 pointer-events-none' : ''}>
            <SlideToConfirm
              label={`Slide to pay \u20B9${totalAmount.toLocaleString('en-IN')}`}
              onConfirm={handleConfirm}
              disabled={processing}
            />
          </div>
        )}

        {/* Security reassurance */}
        <p className="text-center text-[11px] text-gray-400">
          Secured by Razorpay. Your payment details are encrypted.
        </p>
      </div>
    </BottomSheet>
  );
}

function formatSlotTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
