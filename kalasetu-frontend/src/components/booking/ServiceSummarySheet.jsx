import { useState } from 'react';
import { Clock, IndianRupee, CheckCircle } from 'lucide-react';
import { BottomSheet, Button, Input } from '../ui/index.js';
import DateTimePicker from './DateTimePicker.jsx';

/**
 * Step 1 of the booking flow — service summary + date/time selection.
 * Uses BottomSheet. Pressing "Continue" triggers onContinue with booking data.
 *
 * Props:
 *  - service: ArtisanService object (name, price, durationMinutes, description, images)
 *  - artisan: Artisan object (publicId, fullName)
 *  - open: boolean
 *  - onClose: () => void
 *  - onContinue: ({ date, time, notes }) => void — advances to PaymentSheet
 */
export default function ServiceSummarySheet({ service, artisan, open, onClose, onContinue }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  if (!service || !artisan) return null;

  const canContinue = selectedDate && selectedTime;

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue({ date: selectedDate, time: selectedTime, notes });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Book Service"
    >
      <div className="space-y-5">
        {/* Service summary card */}
        <div className="bg-surface-muted rounded-xl p-4">
          <h4 className="text-base font-semibold text-gray-900">{service.name}</h4>
          <p className="text-sm text-gray-500 mt-0.5">With {artisan.fullName}</p>

          <div className="flex items-center gap-4 mt-3 text-sm">
            {service.price > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                <IndianRupee className="h-3.5 w-3.5" />
                {service.price.toLocaleString('en-IN')}
              </span>
            )}
            {service.durationMinutes > 0 && (
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(service.durationMinutes)}
              </span>
            )}
          </div>

          {/* Included items — if service has a description, show it as checklist-style */}
          {service.description && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                <span>{service.description}</span>
              </div>
            </div>
          )}
        </div>

        {/* Date & Time picker */}
        <DateTimePicker
          publicId={artisan.publicId}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
        />

        {/* Special requests */}
        <Input
          as="textarea"
          label="Special requests (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Venue details, material preferences, questions..."
          rows={2}
        />

        {/* Continue CTA */}
        <Button
          variant="primary"
          className="w-full"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          {service.price > 0
            ? `Continue \u2014 \u20B9${service.price.toLocaleString('en-IN')}`
            : 'Continue'}
        </Button>
      </div>
    </BottomSheet>
  );
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
