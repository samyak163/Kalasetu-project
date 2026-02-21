import { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import { BottomSheet, Button, Input } from '../ui/index.js';

/**
 * Booking BottomSheet — replaces the old raw modal.
 * Slide-up on mobile, centered modal on desktop.
 * Shows service summary, date/time picker, notes field.
 */
export default function BookingBottomSheet({ service, artisan, onClose, showToast }) {
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when sheet opens/closes
  useEffect(() => {
    if (service) { setStartTime(''); setNotes(''); }
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime) { showToast('Please pick a date and time', 'error'); return; }

    setSubmitting(true);
    try {
      await api.post('/api/bookings', {
        artisan: artisan._id || artisan.id,
        serviceId: service?._id || service?.serviceId,
        start: new Date(startTime),
        notes,
        price: service?.price || 0,
      });
      showToast('Booking request sent!', 'success');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      open={!!service}
      onClose={onClose}
      title={service ? `Book ${service.name}` : 'Book Service'}
    >
      {service && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service summary */}
          <div className="bg-surface-muted rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-900">{service.name}</p>
            <p className="text-gray-500 mt-0.5">
              With {artisan.fullName}
              {service.price > 0 && ` \u2022 \u20B9${service.price.toLocaleString('en-IN')}`}
              {service.durationMinutes > 0 && ` \u2022 ${service.durationMinutes} min`}
            </p>
          </div>

          {/* Date/time picker */}
          <Input
            label="Preferred date & time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            helperText="End time will be calculated based on service duration"
            required
          />

          {/* Notes */}
          <Input
            as="textarea"
            label="Notes for the artisan (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specifics, venue details, or questions..."
            rows={3}
          />

          {/* CTA */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={submitting}
          >
            {submitting ? 'Sending...' : 'Confirm Booking'}
          </Button>
        </form>
      )}
    </BottomSheet>
  );
}
