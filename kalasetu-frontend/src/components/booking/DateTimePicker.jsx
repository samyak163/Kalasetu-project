import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../lib/axios.js';
import { Skeleton } from '../ui/index.js';

const DAYS_AHEAD = 14;

/**
 * Horizontal scrollable day chips + time slot chips.
 * Fetches availability from GET /api/artisans/:publicId/availability?date=YYYY-MM-DD.
 *
 * Props:
 *  - publicId: artisan's publicId (for availability API)
 *  - selectedDate: 'YYYY-MM-DD' string
 *  - selectedTime: 'HH:MM' string
 *  - onDateChange(date): called with 'YYYY-MM-DD'
 *  - onTimeChange(time): called with 'HH:MM'
 */
export default function DateTimePicker({ publicId, selectedDate, selectedTime, onDateChange, onTimeChange }) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [meta, setMeta] = useState(null);
  const dayScrollRef = useRef(null);

  // Generate next 14 days — memoized to avoid recalc on every render.
  // Keyed on today's date string so it refreshes at midnight.
  const todayStr = new Date().toISOString().slice(0, 10);
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      result.push({
        date: d.toISOString().slice(0, 10),
        dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-IN', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return result;
  }, [todayStr]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch slots when date changes
  useEffect(() => {
    if (!selectedDate || !publicId) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);
    setMeta(null);

    api.get(`/api/artisans/${publicId}/availability`, { params: { date: selectedDate } })
      .then((res) => {
        if (cancelled) return;
        setSlots(res.data?.data?.slots || []);
        setMeta(res.data?.data?.meta || null);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => { cancelled = true; };
  }, [selectedDate, publicId]);

  // Auto-select first date if none selected
  useEffect(() => {
    if (!selectedDate && days.length > 0) {
      onDateChange(days[0].date);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-4">
      {/* Day chips — horizontal scroll */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Select Date</p>
        <div ref={dayScrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((day) => {
            const isSelected = selectedDate === day.date;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => { onDateChange(day.date); onTimeChange(''); }}
                className={`flex flex-col items-center px-3 py-2 rounded-xl shrink-0 transition-all text-center min-w-[56px] ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  {day.isToday ? 'Today' : day.dayName}
                </span>
                <span className="text-lg font-bold leading-tight">{day.dayNum}</span>
                <span className="text-[10px]">{day.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slot chips */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Select Time</p>
        {loadingSlots ? (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rect" className="rounded-full" width="72px" height="36px" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-400">
            {meta?.reason === 'closed' && 'Artisan is closed on this day'}
            {meta?.reason === 'day_off' && `Day off${meta.note ? `: ${meta.note}` : ''}`}
            {meta?.reason === 'past_date' && 'Cannot book past dates'}
            {meta?.reason === 'too_far_ahead' && `Bookings open up to ${meta.advanceBookingDays} days ahead`}
            {!meta?.reason && 'No available slots for this date'}
          </p>
        ) : availableSlots.length === 0 ? (
          <p className="text-sm text-gray-400">All slots are booked for this date</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onTimeChange(slot.time)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                      : isSelected
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                  }`}
                >
                  {formatSlotTime(slot.time)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Format 24h "HH:MM" to 12h "h:mm AM/PM" */
function formatSlotTime(time) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
