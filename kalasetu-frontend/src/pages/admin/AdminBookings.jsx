import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Search, Eye, X, Calendar, Download, Mail, Phone, RefreshCcw, AlertTriangle, Table, CalendarDays } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, SKELETON_ROWS, getPaginationRange } from '../../config/constants.js';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [artisanFilter, setArtisanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [page, status, startDate, endDate, artisanFilter, search]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: DEFAULT_PAGE_SIZE,
        status: status !== 'all' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        artisan: artisanFilter || undefined,
        search: search || undefined
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const response = await api.get('/api/admin/bookings', { params });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setBookings(list);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/bookings/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/api/admin/bookings/${id}/cancel`);
      fetchBookings();
      fetchStats();
      alert('Booking cancelled successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        status: status !== 'all' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        artisan: artisanFilter || undefined,
        search: search || undefined,
        export: 'csv'
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const response = await api.get('/api/admin/bookings', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const clearFilters = () => {
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setArtisanFilter('');
    setSearch('');
    setPage(1);
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calendar view - simple grid
  const getCalendarEvents = () => {
    return bookings.map(booking => ({
      id: booking._id,
      title: `${booking.user?.fullName || 'User'} → ${booking.artisan?.fullName || 'Artisan'}`,
      start: new Date(booking.start || booking.scheduledDate),
      end: new Date(booking.end || booking.endTime),
      booking
    }));
  };

  const renderCalendarView = () => {
    const events = getCalendarEvents();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayEvents = events.filter(event => {
              const eventDate = new Date(event.start);
              return eventDate.toDateString() === day.toDateString();
            });
            const isToday = day.toDateString() === today.toDateString();

            return (
              <div
                key={idx}
                className={`min-h-24 border border-gray-200 rounded-lg p-2 ${
                  isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleViewDetails(event.booking)}
                      className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bookings Management</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage and monitor all bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Table className="w-4 h-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Upcoming</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.upcoming || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Completed</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Cancelled</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Cancellation Rate</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.cancellationRate ? `${stats.cancellationRate.toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by user, artisan, or booking ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Artisan</label>
            <input
              type="text"
              value={artisanFilter}
              onChange={(e) => { setArtisanFilter(e.target.value); setPage(1); }}
              placeholder="Filter by artisan name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && !loading && !error && renderCalendarView()}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {error && !loading && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700 truncate">{error}</p>
                <p className="text-xs text-red-600 mt-1">Check admin authentication and CORS configuration. You can retry the request.</p>
              </div>
              <button
                onClick={fetchBookings}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 flex-shrink-0"
              >
                <RefreshCcw className="w-4 h-4" /> Retry
              </button>
            </div>
          )}
          {loading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Artisan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-32 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-28 bg-gray-200 rounded" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm md:text-base">No bookings found</p>
            </div>
          )}
          {!loading && !error && bookings.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Artisan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono truncate max-w-xs">
                            {booking._id?.slice(-8) || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {booking.user?.fullName || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {booking.user?.email || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {booking.artisan?.fullName || 'Unknown Artisan'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {booking.artisan?.email || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {booking.start || booking.scheduledDate
                              ? new Date(booking.start || booking.scheduledDate).toLocaleDateString()
                              : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {booking.start
                              ? new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : booking.startTime || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(booking.start, booking.end)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(booking.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {booking.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => handleCancel(booking._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel Booking"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                            {booking.user?.email && (
                              <a
                                href={`mailto:${booking.user.email}`}
                                className="text-green-600 hover:text-green-900"
                                title="Contact User"
                              >
                                <Mail className="w-5 h-5" />
                              </a>
                            )}
                            {booking.artisan?.email && (
                              <a
                                href={`mailto:${booking.artisan.email}`}
                                className="text-purple-600 hover:text-purple-900"
                                title="Contact Artisan"
                              >
                                <Phone className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {(() => {
                      const rng = getPaginationRange(page, pagination.total, DEFAULT_PAGE_SIZE);
                      return (
                        <>
                          Showing <span className="font-medium">{rng.start}</span> to{' '}
                          <span className="font-medium">{rng.end}</span> of{' '}
                          <span className="font-medium">{pagination.total}</span> results
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Booking ID</label>
                <p className="text-base text-gray-900 mt-1 font-mono break-all">
                  {selectedBooking._id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">User</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedBooking.user?.fullName || 'Unknown User'} ({selectedBooking.user?.email || 'N/A'})
                </p>
                {selectedBooking.user?.phoneNumber && (
                  <p className="text-sm text-gray-500 mt-1">
                    Phone: {selectedBooking.user.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Artisan</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedBooking.artisan?.fullName || 'Unknown Artisan'} ({selectedBooking.artisan?.email || 'N/A'})
                </p>
                {selectedBooking.artisan?.phoneNumber && (
                  <p className="text-sm text-gray-500 mt-1">
                    Phone: {selectedBooking.artisan.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date & Time</label>
                <p className="text-base text-gray-900 mt-1">
                  {selectedBooking.start || selectedBooking.scheduledDate
                    ? new Date(selectedBooking.start || selectedBooking.scheduledDate).toLocaleString()
                    : 'N/A'}
                </p>
                {selectedBooking.end && (
                  <p className="text-sm text-gray-500 mt-1">
                    End: {new Date(selectedBooking.end).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-base text-gray-900 mt-1">
                  {formatDuration(selectedBooking.start, selectedBooking.end)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Price</label>
                <p className="text-base text-gray-900 mt-1 font-semibold">
                  {formatCurrency(selectedBooking.price)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-base text-gray-900 mt-1">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedBooking.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedBooking.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedBooking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedBooking.status || 'pending'}
                  </span>
                </p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap break-words">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

