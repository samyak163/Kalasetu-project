import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';

const USERsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [USERs, setUSERs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUSERs();
  }, []);

  const fetchUSERs = async () => {
    try {
      setLoading(true);
      // Fetch real customers from backend
      const response = await api.get('/api/artisan/customers');
      if (response.data.success) {
        setUSERs(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      showToast(error.response?.data?.message || 'Failed to load customers', 'error');
      setUSERs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUSERs = USERs.filter(USER =>
    (USER.fullName || USER.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (USER.phoneNumber || USER.phone || '').includes(searchTerm) ||
    (USER.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">USER Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your USER relationships and history
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search USERs by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#A55233] bg-white dark:bg-white text-gray-900 dark:text-gray-900"
        />
        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
      </div>

      {/* USER Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total USERs</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{USERs.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Regular Customers</div>
          <div className="text-2xl font-bold text-green-600">
            {USERs.filter(c => (c.totalBookings || 0) >= 3).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">New Customers</div>
          <div className="text-2xl font-bold text-blue-600">
            {USERs.filter(c => (c.totalBookings || 0) === 1).length}
          </div>
        </div>
      </div>

      {/* Customer List */}
      {filteredUSERs.length > 0 ? (
        <div className="space-y-4">
          {filteredUSERs.map(USER => (
            <div key={USER._id || USER.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A55233] to-[#8a4329] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(USER.fullName || USER.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {USER.fullName || USER.name || 'Unknown'}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {(USER.totalBookings || 0) >= 3 && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                            Regular
                          </span>
                        )}
                        {(USER.totalBookings || 0) === 1 && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {(USER.phoneNumber || USER.phone) && <div>📞 {USER.phoneNumber || USER.phone}</div>}
                    {USER.email && <div>📧 {USER.email}</div>}
                    {USER.lastBooking && <div>📅 Last booking: {new Date(USER.lastBooking).toLocaleDateString()}</div>}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Spent</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{(USER.totalSpent || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {USER.totalBookings || 0} booking{(USER.totalBookings || 0) === 1 ? '' : 's'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8a4329] text-sm">
                  View History
                </button>
                {(USER.phoneNumber || USER.phone) && (
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                    Call
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No USERs found' : 'No USERs yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Start accepting bookings to build your USER base'}
          </p>
        </div>
      )}
    </div>
  );
};

export default USERsTab;
