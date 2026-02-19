import { useState, useContext, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { BottomSheet, Button } from '../ui/index.js';
import StarRating from '../ui/StarRating.jsx';
import { ToastContext } from '../../context/ToastContext.jsx';
import { getTagsForRating } from '../../constants/reviewTags.js';
import api from '../../lib/axios.js';

const MAX_TAGS = 5;
const MAX_PHOTOS = 3;

/**
 * Review submission BottomSheet — Zomato progressive reveal pattern.
 *
 * Flow: rating → tags appear → optional text + photos → submit
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {(review) => void} onSuccess — Called after successful POST
 * @param {object} booking — { _id, artisan, serviceName, start }
 * @param {string} artisanName
 */
export default function ReviewSheet({ open, onClose, onSuccess, booking, artisanName }) {
  const { showToast } = useContext(ToastContext);

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]); // { file, preview }
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef(null);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      setRating(0);
      setSelectedTags([]);
      setComment('');
      setPhotos([]);
      setSubmitting(false);
    }
  }, [open]);

  // When rating changes, reset tags (available tags depend on rating)
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setSelectedTags([]);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      if (prev.length >= MAX_TAGS) {
        showToast(`Maximum ${MAX_TAGS} tags`, 'info');
        return prev;
      }
      return [...prev, tag];
    });
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > MAX_PHOTOS) {
      showToast(`Maximum ${MAX_PHOTOS} photos`, 'info');
      return;
    }
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
    // Reset input so same file can be selected again
    if (fileRef.current) fileRef.current.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload photos to Cloudinary, then POST review
  const handleSubmit = async () => {
    if (rating === 0 || selectedTags.length === 0) return;
    setSubmitting(true);

    try {
      // Upload photos first (if any)
      const imageUrls = [];
      for (const photo of photos) {
        const sigRes = await api.get('/api/uploads/signature', {
          params: { folder: 'kalasetu/reviews' },
        });
        const { timestamp, signature, api_key, cloud_name, folder } = sigRes.data;

        const formData = new FormData();
        formData.append('file', photo.file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: 'POST', body: formData }
        );
        const uploadData = await uploadRes.json();
        if (!uploadData.secure_url) throw new Error(uploadData.error?.message || 'Photo upload failed');
        imageUrls.push(uploadData.secure_url);
      }

      // Submit review
      const res = await api.post('/api/reviews', {
        artisanId: booking.artisan?._id || booking.artisan,
        bookingId: booking._id,
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      showToast('Review submitted!', 'success');
      onSuccess?.(res.data.data);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Could not submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const availableTags = rating > 0 ? getTagsForRating(rating) : [];
  const canSubmit = rating > 0 && selectedTags.length >= 1 && !submitting;

  return (
    <BottomSheet open={open} onClose={onClose} title={`Rate your experience`}>
      <div className="px-4 pb-6 space-y-5 overflow-y-auto">
        {/* Header context */}
        <div className="text-center">
          <p className="text-base font-medium text-gray-900">
            How was your experience with {artisanName}?
          </p>
          {booking?.serviceName && (
            <p className="text-sm text-gray-500 mt-1">
              {booking.serviceName}
              {booking.start && ` \u2022 ${new Date(booking.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
            </p>
          )}
        </div>

        {/* Star rating */}
        <div className="flex justify-center">
          <StarRating value={rating} onChange={handleRatingChange} size="lg" showLabel />
        </div>

        {/* Progressive reveal — appears after rating is selected */}
        {rating > 0 && (
          <div className="space-y-5 animate-fade-in">
            {/* Tags */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                What stood out? <span className="text-gray-400">({selectedTags.length}/{MAX_TAGS})</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        active
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-brand-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="review-comment" className="text-sm font-medium text-gray-700 block mb-1.5">
                Write a review <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share details of your experience..."
                maxLength={1000}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
              />
              {comment.length > 0 && comment.trim().length < 20 && (
                <p className="text-xs text-warning-600 mt-1">
                  Tip: Write at least 20 characters for a helpful review
                </p>
              )}
            </div>

            {/* Photo upload */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Add photos <span className="text-gray-400 font-normal">(optional, max {MAX_PHOTOS})</span></p>
              <div className="flex gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="text-xs mt-0.5">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              className="w-full"
              disabled={!canSubmit}
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit Review
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
