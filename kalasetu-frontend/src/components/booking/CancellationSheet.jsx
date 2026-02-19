import { useState, useContext } from 'react';
import { ToastContext } from '../../context/ToastContext.jsx';
import api from '../../lib/axios.js';
import { BottomSheet, Button, Input } from '../ui';

const REASON_OPTIONS = [
  { value: '', label: 'Select a reason...' },
  { value: 'Change of plans', label: 'Change of plans' },
  { value: 'Found another artisan', label: 'Found another artisan' },
  { value: 'Schedule conflict', label: 'Schedule conflict' },
  { value: 'Price concern', label: 'Price concern' },
  { value: 'Other', label: 'Other' },
];

/**
 * BottomSheet for cancelling a booking with reason selection.
 *
 * @param {boolean}  open          - Sheet visibility
 * @param {function} onClose       - Close handler
 * @param {string}   bookingId     - Booking to cancel
 * @param {string}   bookingStatus - 'pending' | 'confirmed' (affects policy note)
 * @param {function} onCancel      - Callback after successful cancellation
 */
export default function CancellationSheet({ open, onClose, bookingId, bookingStatus, onCancel }) {
  const { showToast } = useContext(ToastContext);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const finalReason = reason === 'Other' ? customReason.trim() : reason;
  const canSubmit = finalReason.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await api.post(`/api/bookings/${bookingId}/cancel`, { reason: finalReason });
      showToast('Booking cancelled successfully', 'success');
      onCancel?.();
      handleClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title="Cancel Booking">
      <div className="space-y-4">
        <Input
          as="select"
          label="Why are you cancelling?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={REASON_OPTIONS}
        />

        {reason === 'Other' && (
          <Input
            as="textarea"
            label="Please describe your reason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Tell us why you'd like to cancel..."
            rows={3}
          />
        )}

        {bookingStatus === 'confirmed' && (
          <div className="bg-warning-50 border border-warning-200 rounded-card p-3">
            <p className="text-xs text-warning-700 font-medium">Cancellation Policy</p>
            <p className="text-xs text-warning-600 mt-1">
              This booking has been confirmed. Cancelling may affect your refund eligibility.
              Please contact support if you have questions.
            </p>
          </div>
        )}

        <Button
          variant="danger"
          className="w-full"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        >
          Confirm Cancellation
        </Button>
      </div>
    </BottomSheet>
  );
}
