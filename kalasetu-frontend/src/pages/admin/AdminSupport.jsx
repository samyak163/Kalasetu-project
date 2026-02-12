import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import {
  Search,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCcw,
  AlertTriangle,
  X,
  Send,
  Lock,
  User,
  Shield
} from 'lucide-react';
import { DEFAULT_PAGE_SIZE, SKELETON_ROWS, getPaginationRange } from '../../config/constants.js';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: DEFAULT_PAGE_SIZE,
        status: status !== 'all' ? status : undefined,
        category: category !== 'all' ? category : undefined,
        priority: priority !== 'all' ? priority : undefined,
        search: search || undefined
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await api.get('/api/admin/support/tickets', { params });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setTickets(list);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load support tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, category, priority, search]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/support/tickets/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch {
      // Non-critical error - stats are optional
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets]);

  const fetchTicketDetail = async (id) => {
    try {
      const response = await api.get(`/api/admin/support/tickets/${id}`);
      if (response.data.success) {
        setSelectedTicket(response.data.data);
        setShowDetailPanel(true);
        setReplyMessage('');
        setIsInternal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load ticket details');
    }
  };

  const handleViewDetails = (ticket) => {
    fetchTicketDetail(ticket._id);
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!selectedTicket) return;

    setReplyLoading(true);
    try {
      await api.post(`/api/admin/support/tickets/${selectedTicket._id}/respond`, {
        message: replyMessage,
        internal: isInternal
      });
      // Refetch ticket details to show new message
      await fetchTicketDetail(selectedTicket._id);
      fetchTickets();
      fetchStats();
      setReplyMessage('');
      setIsInternal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;

    const confirmMessage = newStatus === 'resolved'
      ? 'Are you sure you want to mark this ticket as resolved?'
      : 'Are you sure you want to close this ticket?';

    if (!window.confirm(confirmMessage)) return;

    setStatusChangeLoading(true);
    try {
      await api.patch(`/api/admin/support/tickets/${selectedTicket._id}/status`, {
        status: newStatus
      });
      await fetchTicketDetail(selectedTicket._id);
      fetchTickets();
      fetchStats();
      alert(`Ticket ${newStatus} successfully`);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${newStatus} ticket`);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const clearFilters = () => {
    setStatus('all');
    setCategory('all');
    setPriority('all');
    setSearch('');
    setPage(1);
  };

  const getPriorityBadge = (priorityValue) => {
    const badgeClasses = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-amber-100 text-amber-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClasses[priorityValue] || 'bg-gray-100 text-gray-800'}`}>
        {priorityValue || 'low'}
      </span>
    );
  };

  const getStatusBadge = (statusValue) => {
    const badgeClasses = {
      open: 'bg-amber-100 text-amber-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClasses[statusValue] || 'bg-gray-100 text-gray-800'}`}>
        {statusValue?.replace('_', ' ') || 'open'}
      </span>
    );
  };

  const getCategoryBadge = (categoryValue) => {
    const badgeClasses = {
      booking: 'bg-purple-100 text-purple-800',
      payment: 'bg-green-100 text-green-800',
      refund: 'bg-red-100 text-red-800',
      technical: 'bg-blue-100 text-blue-800',
      account: 'bg-amber-100 text-amber-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClasses[categoryValue] || 'bg-gray-100 text-gray-800'}`}>
        {categoryValue || 'other'}
      </span>
    );
  };

  const getRoleBadge = (senderModel) => {
    if (senderModel === 'Admin') {
      return <span className="px-2 py-1 text-xs bg-brand-100 text-brand-800 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" />Admin</span>;
    }
    return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full flex items-center gap-1"><User className="w-3 h-3" />{senderModel}</span>;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">Manage and respond to support tickets</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Total Tickets</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Open</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.byStatus?.open || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">In Progress</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.byStatus?.in_progress || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Resolved</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.byStatus?.resolved || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 truncate">Closed</div>
            <div className="text-2xl font-bold text-gray-600 mt-1">{stats.byStatus?.closed || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by ticket #, subject, or user name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
          >
            <option value="all">All Categories</option>
            <option value="booking">Booking</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="other">Other</option>
          </select>
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error && !loading && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700 truncate">{error}</p>
              <p className="text-xs text-red-600 mt-1">Check admin authentication and CORS configuration. You can retry the request.</p>
            </div>
            <button
              onClick={fetchTickets}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Ticket #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 bg-gray-200 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm md:text-base">No support tickets found</p>
          </div>
        )}
        {!loading && !error && tickets.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Ticket #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Created Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          #{ticket.ticketNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs" title={ticket.subject}>
                          {ticket.subject?.substring(0, 50) || 'No subject'}
                          {ticket.subject?.length > 50 ? '...' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {ticket.createdBy?.userName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {ticket.createdBy?.userEmail || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCategoryBadge(ticket.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(ticket)}
                            className="text-brand-500 hover:text-brand-700"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                            <>
                              <button
                                onClick={() => {
                                  fetchTicketDetail(ticket._id);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Respond"
                              >
                                <MessageSquare className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  handleStatusChange('resolved');
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Resolved"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  handleStatusChange('closed');
                                }}
                                className="text-gray-600 hover:text-gray-900"
                                title="Close Ticket"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
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

      {/* Ticket Detail Panel */}
      {showDetailPanel && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ticket #{selectedTicket.ticketNumber}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  {getCategoryBadge(selectedTicket.category)}
                </div>
              </div>
              <button
                onClick={() => setShowDetailPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <p className="text-base text-gray-900 mt-1">{selectedTicket.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedTicket.createdBy?.userName || 'Unknown'} ({selectedTicket.createdBy?.userModel})
                  </p>
                  <p className="text-xs text-gray-500">{selectedTicket.createdBy?.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Assigned To</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedTicket.assignedTo?.fullName || 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-base text-gray-900 mt-2 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedTicket.description || 'No description provided'}
                </p>
              </div>

              {/* Message Thread */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-3">Message Thread</label>
                <div className="space-y-4 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender?.senderModel === 'Admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.internal
                              ? 'bg-yellow-50 border border-yellow-200'
                              : msg.sender?.senderModel === 'Admin'
                              ? 'bg-brand-50 border border-brand-200'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getRoleBadge(msg.sender?.senderModel)}
                            <span className="text-xs font-medium text-gray-700">
                              {msg.sender?.senderName || 'Unknown'}
                            </span>
                            {msg.internal && (
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Internal Note
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
                  )}
                </div>
              </div>

              {/* Reply Form */}
              {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-sm font-medium text-gray-600 block mb-2">Reply</label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      Internal note (not visible to user)
                    </label>
                    <button
                      onClick={handleReply}
                      disabled={replyLoading}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {replyLoading ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                <div className="flex gap-2 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    disabled={statusChangeLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {statusChangeLoading ? 'Processing...' : 'Mark as Resolved'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('closed')}
                    disabled={statusChangeLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {statusChangeLoading ? 'Processing...' : 'Close Ticket'}
                  </button>
                </div>
              )}

              {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    This ticket is {selectedTicket.status}. No further actions available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
