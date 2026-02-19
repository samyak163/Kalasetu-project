import { useEffect, useMemo, useState, useContext } from 'react';
import { Plus, Edit2, Trash2, Loader2, Check, Clock, IndianRupee, Archive, RotateCcw } from 'lucide-react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { Button, EmptyState, Badge, Alert } from '../../ui/index.js';
import { optimizeImage } from '../../../utils/cloudinary.js';
import ServiceFormSheet from '../ServiceFormSheet.jsx';
import api from '../../../lib/axios.js';

/**
 * Artisan's service management tab — image-forward cards with action buttons.
 * Uses ServiceFormSheet (BottomSheet + live preview) for create/edit.
 *
 * @see components/profile/ServiceFormSheet.jsx — Create/edit form
 * @see components/artisan/ServicesTab.jsx — Public-facing service list (different file)
 */
const ServicesTab = () => {
  const { showToast } = useContext(ToastContext);
  const { user, userType, loading: authLoading } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [extraServices, setExtraServices] = useState([]);

  // Form sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Action states
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const artisanId = user?._id || user?.id;

  useEffect(() => {
    if (authLoading) return;
    if (userType !== 'artisan') { setLoading(false); return; }
    fetchAll();
  }, [userType, authLoading]);

  const fetchAll = async () => {
    if (!artisanId) return;
    setLoading(true);
    try {
      const [serviceRes, catRes] = await Promise.all([
        api.get('/api/services', { params: { artisan: artisanId, limit: 100 } }),
        api.get('/api/categories/suggestions/services/all'),
      ]);
      setServices(serviceRes.data?.data || []);
      setCategories(catRes.data?.categories || []);
      setExtraServices(catRes.data?.extraServices || []);
    } catch (err) {
      console.error('Failed to load services', err);
      showToast('Failed to load services. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sheet handlers
  const openCreate = () => { setEditingService(null); setSheetOpen(true); };
  const openEdit = (service) => { setEditingService(service); setSheetOpen(true); };
  const closeSheet = () => { setSheetOpen(false); setEditingService(null); };

  const handleSave = (saved) => {
    if (editingService) {
      setServices((prev) => prev.map((s) => (s._id === saved._id ? saved : s)));
    } else {
      setServices((prev) => [saved, ...prev]);
    }
  };

  // Toggle active/archived
  const handleToggle = async (service) => {
    setToggling(service._id);
    try {
      const res = await api.patch(`/api/services/${service._id}`, { isActive: !service.isActive });
      const updated = res.data?.data;
      setServices((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      showToast(updated.isActive ? 'Service activated' : 'Service archived', 'success');
    } catch (err) {
      console.error('Failed to toggle service', err);
      showToast('Failed to update service status', 'error');
    } finally {
      setToggling(null);
    }
  };

  // Delete with inline confirmation
  const handleDelete = async (service) => {
    setDeleting(service._id);
    try {
      await api.delete(`/api/services/${service._id}`);
      setServices((prev) => prev.filter((s) => s._id !== service._id));
      showToast('Service removed', 'success');
    } catch (err) {
      console.error('Failed to delete service', err);
      showToast('Failed to delete service', 'error');
    } finally {
      setDeleting(null);
      setConfirmingDelete(null);
    }
  };

  const serviceGroups = useMemo(() => {
    const active = [];
    const archived = [];
    services.forEach((svc) => {
      if (svc.isActive !== false) active.push(svc);
      else archived.push(svc);
    });
    return { active, archived };
  }, [services]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  // Non-artisan guard
  if (userType !== 'artisan') {
    return (
      <Alert type="warning" className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold">Artisan access required</h3>
        <p className="mt-1 text-sm">Services can only be managed by artisan accounts.</p>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Services</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create services from our curated categories or add your own.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Service
        </Button>
      </div>

      {/* Active Services */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Active Services ({serviceGroups.active.length})
        </h3>
        {serviceGroups.active.length === 0 ? (
          <EmptyState
            title="No services yet"
            description="Create your first service to start getting bookings."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceGroups.active.map((service) => (
              <ServiceManagementCard
                key={service._id}
                service={service}
                onEdit={() => openEdit(service)}
                onToggle={() => handleToggle(service)}
                onDelete={() => handleDelete(service)}
                toggling={toggling === service._id}
                deleting={deleting === service._id}
                confirmingDelete={confirmingDelete === service._id}
                onConfirmDelete={() => setConfirmingDelete(service._id)}
                onCancelDelete={() => setConfirmingDelete(null)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Archived Services */}
      {serviceGroups.archived.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            Archived ({serviceGroups.archived.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceGroups.archived.map((service) => (
              <ServiceManagementCard
                key={service._id}
                service={service}
                onEdit={() => openEdit(service)}
                onToggle={() => handleToggle(service)}
                onDelete={() => handleDelete(service)}
                toggling={toggling === service._id}
                deleting={deleting === service._id}
                confirmingDelete={confirmingDelete === service._id}
                onConfirmDelete={() => setConfirmingDelete(service._id)}
                onCancelDelete={() => setConfirmingDelete(null)}
                archived
              />
            ))}
          </div>
        </section>
      )}

      {/* Create/Edit Form Sheet */}
      <ServiceFormSheet
        open={sheetOpen}
        onClose={closeSheet}
        service={editingService}
        categories={categories}
        extraServices={extraServices}
        onSave={handleSave}
      />
    </div>
  );
};

/**
 * Image-forward service card for artisan management.
 * Matches public card layout but with Edit/Archive/Delete actions.
 */
function ServiceManagementCard({
  service,
  onEdit,
  onToggle,
  onDelete,
  toggling,
  deleting,
  confirmingDelete,
  onConfirmDelete,
  onCancelDelete,
  archived,
}) {
  const hasImage = service.images?.length > 0;
  const price = Number(service.price) || 0;

  return (
    <div className={`bg-white rounded-card shadow-card overflow-hidden flex flex-col ${archived ? 'opacity-70' : ''}`}>
      {/* Service image or fallback */}
      {hasImage ? (
        <img
          src={optimizeImage(service.images[0], { width: 400, height: 200, crop: 'fill' })}
          alt={service.name}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-brand-50 flex items-center justify-center">
          <span className="text-brand-400 font-display text-sm">{service.categoryName || 'Service'}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col p-3 gap-2">
        {/* Name + Status */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-base font-semibold text-gray-900 line-clamp-1">{service.name}</h4>
          {service.isActive !== false ? (
            <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <Check className="h-3 w-3" /> Live
            </span>
          ) : (
            <Badge className="shrink-0 text-xs">Archived</Badge>
          )}
        </div>

        {/* Category */}
        {service.categoryName && (
          <span className="text-xs text-gray-500">{service.categoryName}</span>
        )}

        {/* Price + Duration */}
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1 font-bold text-gray-900">
            <IndianRupee className="h-3.5 w-3.5" />
            {price > 0 ? price.toLocaleString('en-IN') : 'Contact'}
          </span>
          {service.durationMinutes > 0 && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(service.durationMinutes)}
            </span>
          )}
        </div>

        {/* Image count */}
        {service.images?.length > 1 && (
          <span className="text-xs text-gray-400">{service.images.length} images</span>
        )}

        {/* Delete confirmation */}
        {confirmingDelete ? (
          <div className="flex items-center gap-2 mt-1 p-2 bg-red-50 rounded-lg">
            <span className="text-xs text-red-700 flex-1">Delete this service?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelDelete}
              disabled={deleting}
              className="text-xs px-2 py-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onDelete}
              disabled={deleting}
              className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
            </Button>
          </div>
        ) : (
          /* Action buttons */
          <div className="flex items-center gap-2 mt-1">
            <Button variant="outline" size="sm" onClick={onEdit} className="text-xs flex-1">
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              disabled={toggling}
              className="text-xs"
            >
              {toggling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : service.isActive !== false ? (
                <><Archive className="h-3.5 w-3.5 mr-1" />Archive</>
              ) : (
                <><RotateCcw className="h-3.5 w-3.5 mr-1" />Activate</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onConfirmDelete}
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default ServicesTab;
