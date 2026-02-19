import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Loader2 } from 'lucide-react';
import api from '../../lib/axios.js';

/**
 * Multi-image uploader with grid display, reordering, and cover selection.
 * Uses Cloudinary signed uploads (same flow as ImageUpload.jsx).
 * First image is automatically the cover image.
 *
 * @param {string[]} images — Current image URLs
 * @param {(urls: string[]) => void} onImagesChange — Callback with full reordered array
 * @param {number} maxImages — Maximum number of images (default 6)
 * @param {string} folder — Cloudinary upload folder
 */
export default function MultiImageUpload({
  images = [],
  onImagesChange,
  maxImages = 6,
  folder = 'kalasetu/artisan/services',
  className = '',
}) {
  const [uploadingPreviews, setUploadingPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Keep a ref to the latest images to avoid stale closures in async handlers
  const imagesRef = useRef(images);
  useEffect(() => { imagesRef.current = images; }, [images]);

  // Upload a single file to Cloudinary via signed upload
  const uploadFile = async (file) => {
    const sigRes = await api.get('/api/uploads/signature', { params: { folder } });
    const { timestamp, signature, api_key, cloud_name, folder: uploadFolder, allowed_formats } = sigRes.data;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', api_key);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', uploadFolder);
    if (allowed_formats) formData.append('allowed_formats', allowed_formats);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
    return data.secure_url;
  };

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });

    const remaining = maxImages - imagesRef.current.length - uploadingPreviews.length;
    const batch = validFiles.slice(0, Math.max(0, remaining));
    if (batch.length === 0) return;

    // Create local blob previews for loading state
    const previews = batch.map((f) => URL.createObjectURL(f));
    setUploadingPreviews((prev) => [...prev, ...previews]);

    try {
      // Upload all files in parallel
      const results = await Promise.allSettled(
        batch.map(async (file, i) => {
          const url = await uploadFile(file);
          return { preview: previews[i], url };
        }),
      );

      // Collect successful uploads
      const newUrls = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          newUrls.push(result.value.url);
        } else {
          console.error('Image upload failed:', result.reason);
        }
      });

      if (newUrls.length > 0) {
        // Use ref for latest images to avoid stale closure on rapid uploads
        onImagesChange([...imagesRef.current, ...newUrls]);
      }
    } finally {
      // Always clean up blob previews, even on unexpected errors
      previews.forEach((p) => URL.revokeObjectURL(p));
      setUploadingPreviews((prev) => prev.filter((p) => !previews.includes(p)));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const moveImage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onImagesChange(updated);
  };

  const removeImage = (idx) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  const canAdd = images.length + uploadingPreviews.length < maxImages;

  return (
    <div className={className}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {/* Existing images */}
        {images.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />

            {/* Cover badge */}
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Cover
              </span>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label={`Remove image ${i + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Reorder arrows */}
            <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {i > 0 ? (
                <button
                  type="button"
                  onClick={() => moveImage(i, i - 1)}
                  className="p-1 bg-white/90 rounded-full shadow-sm text-gray-600 hover:text-gray-900"
                  aria-label="Move left"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span />
              )}
              {i < images.length - 1 ? (
                <button
                  type="button"
                  onClick={() => moveImage(i, i + 1)}
                  className="p-1 bg-white/90 rounded-full shadow-sm text-gray-600 hover:text-gray-900"
                  aria-label="Move right"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>
        ))}

        {/* Uploading placeholders */}
        {uploadingPreviews.map((preview) => (
          <div key={preview} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img src={preview} alt="Uploading" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          </div>
        ))}

        {/* Upload button */}
        {canAdd && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-500 transition-colors"
            aria-label="Upload images"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs font-medium">Upload</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs text-gray-500 mt-2">
        {images.length}/{maxImages} images &middot; First image is the cover &middot; Max 5MB each
      </p>
    </div>
  );
}
