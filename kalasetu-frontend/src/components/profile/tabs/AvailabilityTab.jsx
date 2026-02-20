import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { Card, Button, Input, Badge, Skeleton } from '../../ui';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AvailabilityTab = () => {
  const { showToast } = useContext(ToastContext);
  const [availability, setAvailability] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewWeekOffset, setViewWeekOffset] = useState(0);

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
        api.get('/api/artisan/availability').catch(() => ({ data: { data: null } })),
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
      await api.post('/api/artisan/availability', payload);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" height="28px" width="200px" />
        <Skeleton variant="rect" height="140px" />
        <Skeleton variant="rect" height="300px" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">Availability & Schedule</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your weekly schedule and booking preferences</p>
      </div>

      {/* Week Calendar View */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Booking Calendar</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setViewWeekOffset(prev => prev - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewWeekOffset(0)}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewWeekOffset(prev => prev + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
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
                  isToday ? 'border-brand-500 bg-brand-50/50' : 'border-gray-200'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-brand-500' : 'text-gray-500'}`}>
                  {DAY_SHORT[date.getDay()]} {date.getDate()}
                </div>
                {dayBookings.length === 0 ? (
                  <div className="text-[10px] text-gray-400">No bookings</div>
                ) : (
                  dayBookings.map(b => (
                    <div
                      key={b._id}
                      className="mb-0.5"
                      title={`${b.serviceName} - ${b.user?.fullName || 'Customer'}`}
                    >
                      <Badge status={b.status}>
                        <span className="text-[10px] truncate">
                          {new Date(b.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          {' '}
                          {b.serviceName || 'Booking'}
                        </span>
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recurring Schedule Editor */}
      <Card hover={false}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
        <div className="space-y-2">
          {schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-24 pt-1 font-medium text-sm text-gray-700">
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
                        className="px-2 py-1.5 border border-gray-300 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-xs text-gray-400">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={e => handleSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                        className="text-error-500 hover:text-error-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddSlot(dayIndex)}
                  className="text-brand-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Add time slot
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Settings */}
      <Card hover={false}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Buffer time between bookings (minutes)"
            type="number"
            min={0}
            max={480}
            value={bufferTime}
            onChange={e => setBufferTime(parseInt(e.target.value) || 0)}
          />
          <Input
            label="Accept bookings up to (days ahead)"
            type="number"
            min={1}
            max={365}
            value={advanceBookingDays}
            onChange={e => setAdvanceBookingDays(parseInt(e.target.value) || 30)}
          />
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityTab;
