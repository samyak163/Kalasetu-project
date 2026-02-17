import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { LoadingState } from '../../ui';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AvailabilityTab = () => {
  const { showToast } = useContext(ToastContext);
  const [availability, setAvailability] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewWeekOffset, setViewWeekOffset] = useState(0);

  // Editable schedule state
  const [schedule, setSchedule] = useState(
    DAYS.map((_, i) => ({ dayOfWeek: i, slots: [] }))
  );
  const [bufferTime, setBufferTime] = useState(30);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availRes, bookingsRes] = await Promise.all([
        api.get('/api/availability').catch(() => ({ data: { data: null } })),
        api.get('/api/bookings/artisan').catch(() => ({ data: { data: [] } })),
      ]);

      const avail = availRes.data.data;
      if (avail) {
        setAvailability(avail);
        if (avail.recurringSchedule?.length) {
          const merged = DAYS.map((_, i) => {
            const existing = avail.recurringSchedule.find(s => s.dayOfWeek === i);
            return existing || { dayOfWeek: i, slots: [] };
          });
          setSchedule(merged);
        }
        if (avail.bufferTime != null) setBufferTime(avail.bufferTime);
        if (avail.advanceBookingDays != null) setAdvanceBookingDays(avail.advanceBookingDays);
      }

      setBookings(bookingsRes.data.data || []);
    } catch (err) {
      showToast('Failed to load availability', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = (dayIndex) => {
    setSchedule(prev => prev.map((day, i) => {
      if (i !== dayIndex) return day;
      return { ...day, slots: [...day.slots, { startTime: '09:00', endTime: '17:00' }] };
    }));
  };

  const handleRemoveSlot = (dayIndex, slotIndex) => {
    setSchedule(prev => prev.map((day, i) => {
      if (i !== dayIndex) return day;
      return { ...day, slots: day.slots.filter((_, si) => si !== slotIndex) };
    }));
  };

  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    setSchedule(prev => prev.map((day, i) => {
      if (i !== dayIndex) return day;
      return {
        ...day,
        slots: day.slots.map((slot, si) =>
          si === slotIndex ? { ...slot, [field]: value } : slot
        ),
      };
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        recurringSchedule: schedule.filter(d => d.slots.length > 0),
        bufferTime,
        advanceBookingDays,
      };
      await api.post('/api/availability', payload);
      showToast('Availability saved!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calendar view helpers
  const getWeekDates = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + viewWeekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();

  const getBookingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => {
      const bDate = new Date(b.start).toISOString().split('T')[0];
      return bDate === dateStr && ['pending', 'confirmed'].includes(b.status);
    });
  };

  if (loading) return <LoadingState message="Loading availability..." />;

  return (
    <div className="space-y-8">
      {/* Week Calendar View */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Calendar</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewWeekOffset(prev => prev - 1)}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
            >
              Prev
            </button>
            <button
              onClick={() => setViewWeekOffset(0)}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => setViewWeekOffset(prev => prev + 1)}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={`border rounded-lg p-2 min-h-[100px] ${
                  isToday ? 'border-[#A55233] bg-[#A55233]/5' : 'border-gray-200'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-[#A55233]' : 'text-gray-500'}`}>
                  {DAY_SHORT[date.getDay()]} {date.getDate()}
                </div>
                {dayBookings.length === 0 ? (
                  <div className="text-[10px] text-gray-400">No bookings</div>
                ) : (
                  dayBookings.map(b => (
                    <div
                      key={b._id}
                      className={`text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate ${
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                      title={`${b.serviceName} - ${b.user?.fullName || 'Customer'}`}
                    >
                      {new Date(b.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' '}
                      {b.serviceName || 'Booking'}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Schedule Editor */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Schedule</h3>
        <div className="space-y-3">
          {schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
              <div className="w-24 pt-1 font-medium text-sm text-gray-700 dark:text-gray-300">
                {DAYS[dayIndex]}
              </div>
              <div className="flex-1 space-y-2">
                {day.slots.length === 0 ? (
                  <span className="text-sm text-gray-400">Unavailable</span>
                ) : (
                  day.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={e => handleSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={e => handleSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      />
                      <button
                        onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
                <button
                  onClick={() => handleAddSlot(dayIndex)}
                  className="text-xs text-[#A55233] hover:underline font-medium"
                >
                  + Add time slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buffer time between bookings (minutes)
          </label>
          <input
            type="number"
            min={0}
            max={480}
            value={bufferTime}
            onChange={e => setBufferTime(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Accept bookings up to (days ahead)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={advanceBookingDays}
            onChange={e => setAdvanceBookingDays(parseInt(e.target.value) || 30)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors font-medium disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
};

export default AvailabilityTab;
