import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { LoadingState, EmptyState, Avatar, Card, Button, Input } from '../../ui';
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        <Input
          placeholder="Search clients by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          aria-label="Search clients"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover={false} compact>
          <div className="text-sm text-gray-500">Total Clients</div>
          <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
        </Card>
        <Card hover={false} compact>
          <div className="text-sm text-gray-500">Regular Clients</div>
          <div className="text-2xl font-bold text-success-600">
            {clients.filter(c => (c.totalBookings || 0) >= 3).length}
          </div>
        </Card>
        <Card hover={false} compact>
          <div className="text-sm text-gray-500">New Clients</div>
          <div className="text-2xl font-bold text-brand-500">
            {clients.filter(c => (c.totalBookings || 0) === 1).length}
          </div>
        </Card>
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
                <Button variant="primary" size="sm">View History</Button>
                {(client.phoneNumber || client.phone) && (
                  <Button variant="secondary" size="sm">Call</Button>
                )}
                <Button variant="secondary" size="sm">Message</Button>
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
