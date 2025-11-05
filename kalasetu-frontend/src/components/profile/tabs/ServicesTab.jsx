import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';

const ServicesTab = () => {
  const { showToast } = useContext(ToastContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(false);
      // Placeholder data
      setServices([
        {
          id: 1,
          name: 'Plumbing Repair & Installation',
          description: 'Fix leaking taps, install new fixtures, repair pipes',
          pricing: { min: 300, max: 500 },
          duration: '1-2 hours',
          totalBookings: 45,
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load services:', error);
      showToast('Failed to load services', 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Services</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage services you offer to USERs
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
        >
          + Add Service
        </button>
      </div>

      {/* Active Services */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Active Services ({services.filter(s => s.isActive).length})
        </h3>
        <div className="space-y-4">
          {services.filter(s => s.isActive).map(service => (
            <div key={service.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ðŸ”§ {service.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Pricing:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        â‚¹{service.pricing.min}-{service.pricing.max}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{service.duration}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Bookings:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{service.totalBookings}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      âœ… Active
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      âš¡ Instant Booking
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Edit
                  </button>
                  <button className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-4xl mb-4">ðŸ› ï¸</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No services added yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add your first service to start receiving bookings
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
          >
            Add Your First Service
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesTab;
