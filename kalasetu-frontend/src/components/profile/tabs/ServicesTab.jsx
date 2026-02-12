import React, { useEffect, useMemo, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit2, Trash2, Loader2, X, Check } from 'lucide-react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../lib/axios.js';
import ImageUpload from '../../ImageUpload.jsx';

const initialFormState = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  durationMinutes: 60,
  images: [],
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

const ServicesTab = () => {
  const { showToast } = useContext(ToastContext);
  const { user, userType, loading: authLoading } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [extraServices, setExtraServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const artisanId = user?._id || user?.id;

  useEffect(() => {
    if (authLoading) return;
    if (userType !== 'artisan') {
      setLoading(false);
      return;
    }
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
    } catch (error) {
      console.error('Failed to load services', error);
      showToast('Failed to load services. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setModalOpen(false);
    setEditingService(null);
    setFormState(initialFormState);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormState(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormState({
      categoryId: service.category,
      name: service.name,
      description: service.description || '',
      price: service.price || '',
      durationMinutes: service.durationMinutes || 60,
      images: service.images || [],
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageAdd = (url) => {
    if (!url) return;
    setFormState((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
  };

  const handleImageRemove = (url) => {
    setFormState((prev) => ({
      ...prev,
      images: (prev.images || []).filter((img) => img !== url),
    }));
  };

  const handleSuggestionClick = (serviceName) => {
    if (!serviceName) return;
    handleFormChange('name', serviceName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.categoryId) {
      showToast('Please select a category', 'error');
      return;
    }
    if (!formState.name.trim()) {
      showToast('Service name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        categoryId: formState.categoryId,
        name: formState.name.trim(),
        description: formState.description.trim(),
        price: Number(formState.price) || 0,
        durationMinutes: Number(formState.durationMinutes) || 60,
        images: formState.images || [],
      };

      if (editingService) {
        const response = await api.patch(`/api/services/${editingService._id}`, payload);
        const updated = response.data?.data;
        setServices((prev) =>
          prev.map((svc) => (svc._id === updated._id ? updated : svc))
        );
        showToast('Service updated successfully', 'success');
      } else {
        const response = await api.post('/api/services', payload);
        const created = response.data?.data;
        setServices((prev) => [created, ...prev]);
        showToast('Service created successfully', 'success');
      }
      resetModal();
    } catch (error) {
      console.error('Failed to save service', error);
      const message = error.response?.data?.message || 'Failed to save service';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service) => {
    setToggling(service._id);
    try {
      const response = await api.patch(`/api/services/${service._id}`, {
        isActive: !service.isActive,
      });
      const updated = response.data?.data;
      setServices((prev) =>
        prev.map((svc) => (svc._id === updated._id ? updated : svc))
      );
      showToast(
        updated.isActive ? 'Service activated' : 'Service archived',
        'success'
      );
    } catch (error) {
      console.error('Failed to toggle service', error);
      showToast('Failed to update service status', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }
    setDeleting(service._id);
    try {
      await api.delete(`/api/services/${service._id}`);
      setServices((prev) => prev.filter((svc) => svc._id !== service._id));
      showToast('Service removed', 'success');
    } catch (error) {
      console.error('Failed to delete service', error);
      showToast('Failed to delete service', 'error');
    } finally {
      setDeleting(null);
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-[#A55233]" />
      </div>
    );
  }

  if (userType !== 'artisan') {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900">Artisan access required</h3>
        <p className="mt-2 text-yellow-800">
          Services can only be managed by artisan accounts. Please log in as an artisan to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Services</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create services from our curated categories or add your own. Services sync instantly with search & bookings.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      <ServiceListSection
        title={`Active Services (${serviceGroups.active.length})`}
        emptyMessage="You haven't published any services yet. Create one to get started."
        services={serviceGroups.active}
        onEdit={openEditModal}
        onToggle={handleToggleActive}
        onDelete={handleDelete}
        toggling={toggling}
        deleting={deleting}
      />

      <ServiceListSection
        title={`Archived Services (${serviceGroups.archived.length})`}
        emptyMessage="Archived services will appear here."
        services={serviceGroups.archived}
        onEdit={openEditModal}
        onToggle={handleToggleActive}
        onDelete={handleDelete}
        toggling={toggling}
        deleting={deleting}
      />

      {modalOpen && (
        <ServiceModal
          categories={categories}
          extraServices={extraServices}
          formState={formState}
          onClose={resetModal}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onSuggestion={handleSuggestionClick}
          onImageAdd={handleImageAdd}
          onImageRemove={handleImageRemove}
          saving={saving}
          editing={Boolean(editingService)}
        />
      )}
    </div>
  );
};

const ServiceListSection = ({
  title,
  emptyMessage,
  services,
  onEdit,
  onToggle,
  onDelete,
  toggling,
  deleting,
}) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {services.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    ) : (
      <div className="space-y-4">
        {services.map((service) => (
          <article
            key={service._id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
          >
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {service.categoryName}
                  </span>
                  {service.isActive !== false ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <Check className="h-3 w-3" /> Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                      Archived
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(service)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(service)}
                  disabled={toggling === service._id}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-60"
                >
                  {toggling === service._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>{service.isActive !== false ? 'Archive' : 'Activate'}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(service)}
                  disabled={deleting === service._id}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-60"
                >
                  {deleting === service._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </header>

            <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Pricing</p>
                <p>{formatCurrency(service.price)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Duration</p>
                <p>{service.durationMinutes || 60} minutes</p>
              </div>
            </div>

            {service.images?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {service.images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt={service.name}
                    loading="lazy"
                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
);

ServiceListSection.propTypes = {
  title: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  services: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  toggling: PropTypes.string,
  deleting: PropTypes.string,
};

const ServiceModal = ({
  categories,
  extraServices,
  formState,
  onClose,
  onChange,
  onSubmit,
  onSuggestion,
  onImageAdd,
  onImageRemove,
  saving,
  editing,
}) => {
  const selectedCategory = categories.find((c) => c._id === formState.categoryId);
  const suggestions = selectedCategory?.suggestedServices || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl my-8">
        <form onSubmit={onSubmit}>
          <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Service' : 'Create a Service'}</h3>
              <p className="text-sm text-gray-500">
                Choose a category, pick a suggested service, add your details, and publish instantly.
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={formState.categoryId}
                onChange={(e) => onChange('categoryId', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#A55233] focus:outline-none focus:ring-2 focus:ring-[#A55233]/20"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {!!selectedCategory && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Suggested services</label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((service) => (
                    <button
                      type="button"
                      key={service.name}
                      onClick={() => onSuggestion(service.name)}
                      className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-[#A55233] hover:text-[#A55233]"
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {extraServices.length > 0 && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Extra service ideas</label>
                <div className="flex flex-wrap gap-2">
                  {extraServices.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => onSuggestion(name)}
                      className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-500 hover:border-[#A55233] hover:text-[#A55233]"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Service name</label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="e.g., Professional Plumbing Repair"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#A55233] focus:outline-none focus:ring-2 focus:ring-[#A55233]/20"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formState.description}
                onChange={(e) => onChange('description', e.target.value)}
                rows={4}
                placeholder="Describe what is included in this service, tools you use, preparations needed, etc."
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#A55233] focus:outline-none focus:ring-2 focus:ring-[#A55233]/20"
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Base price (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={formState.price}
                  onChange={(e) => onChange('price', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#A55233] focus:outline-none focus:ring-2 focus:ring-[#A55233]/20"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Typical duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  value={formState.durationMinutes}
                  onChange={(e) => onChange('durationMinutes', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#A55233] focus:outline-none focus:ring-2 focus:ring-[#A55233]/20"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium text-gray-700">Service images</label>
              <p className="text-xs text-gray-500">Upload reference photos or examples (optional). Max 6 images.</p>
              <ImageUpload onUploadSuccess={onImageAdd} folder="artisan/services" />
              {formState.images?.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {formState.images.map((img) => (
                    <div key={img} className="relative">
                      <img
                        src={img}
                        alt="Service"
                        loading="lazy"
                        className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onImageRemove(img)}
                        className="absolute -top-2 -right-2 rounded-full bg-white p-1 text-red-500 shadow"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#A55233] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8e462b] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? 'Update Service' : 'Create Service'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

ServiceModal.propTypes = {
  categories: PropTypes.array.isRequired,
  extraServices: PropTypes.array.isRequired,
  formState: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSuggestion: PropTypes.func.isRequired,
  onImageAdd: PropTypes.func.isRequired,
  onImageRemove: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  editing: PropTypes.bool.isRequired,
};

export default ServicesTab;
