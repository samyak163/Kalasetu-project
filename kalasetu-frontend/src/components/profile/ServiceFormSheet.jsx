import { useState, useEffect, useMemo, useContext } from 'react';
import { Loader2, Clock, IndianRupee, Sparkles } from 'lucide-react';
import { BottomSheet, Button, Badge } from '../ui/index.js';
import MultiImageUpload from '../ui/MultiImageUpload.jsx';
import { optimizeImage } from '../../utils/cloudinary.js';
import { ToastContext } from '../../context/ToastContext.jsx';
import api from '../../lib/axios.js';

const initialForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  durationMinutes: 60,
  images: [],
};

/**
 * BottomSheet form for creating/editing artisan services.
 * Features a live preview of the public service card on desktop.
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {object|null} service — null for create, object for edit
 * @param {array} categories — from categories API
 * @param {array} extraServices — extra service name suggestions
 * @param {(savedService: object) => void} onSave — called after successful API save
 */
export default function ServiceFormSheet({ open, onClose, service, categories = [], extraServices = [], onSave }) {
  const { showToast } = useContext(ToastContext);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const editing = Boolean(service);

  // Initialize form when sheet opens
  useEffect(() => {
    if (!open) return;
    if (service) {
      setForm({
        categoryId: service.category || '',
        name: service.name || '',
        description: service.description || '',
        price: service.price ?? '',
        durationMinutes: service.durationMinutes || 60,
        images: service.images || [],
      });
    } else {
      setForm(initialForm);
    }
  }, [open, service]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (urls) => {
    setForm((prev) => ({ ...prev, images: urls }));
  };

  // Resolve selected category for suggestions and preview
  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === form.categoryId),
    [categories, form.categoryId],
  );
  const suggestions = selectedCategory?.suggestedServices || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { showToast('Please select a category', 'error'); return; }
    if (!form.name.trim()) { showToast('Service name is required', 'error'); return; }

    setSaving(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        durationMinutes: Number(form.durationMinutes) || 60,
        images: form.images,
      };

      let saved;
      if (editing) {
        const res = await api.patch(`/api/services/${service._id}`, payload);
        saved = res.data?.data;
        showToast('Service updated successfully', 'success');
      } else {
        const res = await api.post('/api/services', payload);
        saved = res.data?.data;
        showToast('Service created successfully', 'success');
      }

      onSave(saved);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save service';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Service' : 'Create a Service'}
      maxWidth="md:max-w-3xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Form fields — 2 columns on desktop */}
          <div className="md:col-span-2 space-y-5">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Suggested services chips */}
            {suggestions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Suggested services</label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => handleChange('name', s.name)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        form.name === s.name
                          ? 'border-brand-500 bg-brand-50 text-brand-600'
                          : 'border-gray-300 text-gray-700 hover:border-brand-400 hover:text-brand-500'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extra service ideas */}
            {extraServices.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Extra service ideas</label>
                <div className="flex flex-wrap gap-2">
                  {extraServices.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => handleChange('name', name)}
                      className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Service name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Service name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Bridal Mehndi Design"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Describe what's included, tools used, preparations needed..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            {/* Price + Duration side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Base price (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="1440"
                  value={form.durationMinutes}
                  onChange={(e) => handleChange('durationMinutes', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Service images</label>
              <MultiImageUpload
                images={form.images}
                onImagesChange={handleImagesChange}
                maxImages={6}
                folder="kalasetu/artisan/services"
              />
            </div>
          </div>

          {/* Live preview — right column on desktop, below form on mobile */}
          <div className="md:col-span-1">
            <div className="sticky top-0">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Live preview</label>
              <ServicePreviewCard form={form} categoryName={selectedCategory?.name} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editing ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}

/**
 * Live preview of the service card, matching the public ServicesTab layout.
 * Pure render from form state — no API calls.
 */
function ServicePreviewCard({ form, categoryName }) {
  const hasImage = form.images?.length > 0;
  const price = Number(form.price) || 0;
  const duration = Number(form.durationMinutes) || 0;

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden border border-gray-100">
      {/* Image or fallback */}
      {hasImage ? (
        <img
          src={optimizeImage(form.images[0], { width: 400, height: 220, crop: 'fill' })}
          alt="Preview"
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-brand-50 flex items-center justify-center">
          <span className="text-brand-400 font-display text-sm">{categoryName || 'Service'}</span>
        </div>
      )}

      <div className="p-3 space-y-2">
        {/* Name */}
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
          {form.name || 'Service name'}
        </h4>

        {/* Category + Duration */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {categoryName && <span>{categoryName}</span>}
          {categoryName && duration > 0 && <span>&middot;</span>}
          {duration > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Price */}
        {price > 0 ? (
          <span className="inline-flex items-center gap-0.5 text-base font-bold text-gray-900">
            <IndianRupee className="h-3.5 w-3.5" />
            {price.toLocaleString('en-IN')}
          </span>
        ) : (
          <span className="text-sm text-gray-500">Contact for pricing</span>
        )}

        {/* Stats placeholder */}
        <Badge variant="outline" className="text-[10px]">
          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
          New service
        </Badge>

        {/* Fake Book button */}
        <div className="bg-brand-500 text-white text-center py-2 rounded-lg text-xs font-medium opacity-60 cursor-default">
          {price > 0 ? `Book This Service — ₹${price.toLocaleString('en-IN')}` : 'Book This Service'}
        </div>
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
