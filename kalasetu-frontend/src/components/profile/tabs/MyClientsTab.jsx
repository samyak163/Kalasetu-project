import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { LoadingState, EmptyState, Avatar } from '../../ui';
import { Search, Phone, Mail, Calendar, Users } from 'lucide-react';

const MyClientsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/artisan/customers');
      if (response.data.success) {
        setClients(response.data.data || []);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load clients', 'error');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    (client.fullName || client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phoneNumber || client.phone || '').includes(searchTerm) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState message="Loading clients..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-display">My Clients</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your client relationships and history
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search clients by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-input focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
          aria-label="Search clients"
        />
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-card p-4 shadow-card">
          <div className="text-sm text-gray-500">Total Clients</div>
          <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-card p-4 shadow-card">
          <div className="text-sm text-gray-500">Regular Clients</div>
          <div className="text-2xl font-bold text-success-600">
            {clients.filter(c => (c.totalBookings || 0) >= 3).length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-card p-4 shadow-card">
          <div className="text-sm text-gray-500">New Clients</div>
          <div className="text-2xl font-bold text-brand-500">
            {clients.filter(c => (c.totalBookings || 0) === 1).length}
          </div>
        </div>
      </div>

      {filteredClients.length > 0 ? (
        <div className="space-y-4">
          {filteredClients.map(client => (
            <div key={client._id || client.id} className="bg-white border border-gray-200 rounded-card p-6 shadow-card card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      name={client.fullName || client.name}
                      src={client.profileImageUrl}
                      size="md"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.fullName || client.name || 'Unknown'}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {(client.totalBookings || 0) >= 3 && (
                          <span className="px-2 py-0.5 bg-success-50 text-success-700 text-xs rounded-full font-medium">
                            Regular
                          </span>
                        )}
                        {(client.totalBookings || 0) === 1 && (
                          <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                    {(client.phoneNumber || client.phone) && (
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {client.phoneNumber || client.phone}</div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {client.email}</div>
                    )}
                    {client.lastBooking && (
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Last: {new Date(client.lastBooking).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500">Total Spent</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{(client.totalSpent || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {client.totalBookings || 0} booking{(client.totalBookings || 0) === 1 ? '' : 's'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button className="btn-press px-4 py-2 bg-brand-500 text-white rounded-button hover:bg-brand-600 text-sm">
                  View History
                </button>
                {(client.phoneNumber || client.phone) && (
                  <button className="btn-press px-4 py-2 border border-gray-300 rounded-button hover:bg-gray-50 text-sm">
                    Call
                  </button>
                )}
                <button className="btn-press px-4 py-2 border border-gray-300 rounded-button hover:bg-gray-50 text-sm">
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title={searchTerm ? 'No clients found' : 'No clients yet'}
          description={searchTerm ? 'Try a different search term' : 'Start accepting bookings to build your client base'}
        />
      )}
    </div>
  );
};

export default MyClientsTab;
