import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';

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
      setLoading(false);
      // Placeholder data
      setUSERs([
        {
          id: 1,
          name: 'Sarah Johnson',
          phone: '+91-9876543210',
          email: 'sarah@example.com',
          location: 'Indiranagar, Bangalore',
          totalBookings: 5,
          totalSpent: 4200,
          lastBooking: 'Jan 7, 2025',
          tags: ['Regular', 'High Value'],
          notes: 'Prefers morning appointments'
        },
        {
          id: 2,
          name: 'Raj Kumar',
          phone: '+91-9876543211',
          email: 'raj@example.com',
          location: 'Koramangala, Bangalore',
          totalBookings: 2,
          totalSpent: 1500,
          lastBooking: 'Jan 5, 2025',
          tags: ['New'],
          notes: ''
        }
      ]);
    } catch (error) {
      console.error('Failed to load USERs:', error);
      showToast('Failed to load USERs', 'error');
      setLoading(false);
    }
  };

  const filteredUSERs = USERs.filter(USER =>
    USER.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    USER.phone.includes(searchTerm) ||
    USER.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="text-sm text-gray-500 dark:text-gray-400">Regular USERs</div>
          <div className="text-2xl font-bold text-green-600">
            {USERs.filter(c => c.totalBookings >= 5).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">New This Month</div>
          <div className="text-2xl font-bold text-blue-600">
            {USERs.filter(c => c.tags.includes('New')).length}
          </div>
        </div>
      </div>

      {/* USER List */}
      {filteredUSERs.length > 0 ? (
        <div className="space-y-4">
          {filteredUSERs.map(USER => (
            <div key={USER.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A55233] to-[#8a4329] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {USER.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {USER.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {USER.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                    <div>📞 {USER.phone}</div>
                    <div>📧 {USER.email}</div>
                    <div>📍 {USER.location}</div>
                    <div>📅 Last booking: {USER.lastBooking}</div>
                  </div>

                  {USER.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">📝 Notes:</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">{USER.notes}</div>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Spent</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{USER.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {USER.totalBookings} bookings
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8a4329] text-sm">
                  View History
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                  Call
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                  Message
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                  Add Note
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
