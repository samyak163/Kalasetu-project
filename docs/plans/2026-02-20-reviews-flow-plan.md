# Phase 7: Reviews Flow — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Zomato-inspired tag-based review system — submission BottomSheet, tag aggregation on profiles, and triggers from completed bookings.

**Architecture:** Backend adds `tags` field to Review model, validates against rating-dependent allowed lists, and exposes a tag aggregation endpoint. Frontend adds a progressive-reveal ReviewSheet BottomSheet, an interactive StarRating component, a TagSummary display, and wires review triggers into the existing booking flow.

**Tech Stack:** MongoDB/Mongoose (aggregation pipeline), Express/Zod (validation), React JSX (no TS), Tailwind CSS, lucide-react icons, existing BottomSheet + MultiImageUpload + FilterChips design system components.

---

## Task 1: Create shared tag constants

**Files:**
- Create: `kalasetu-frontend/src/constants/reviewTags.js`

**Step 1: Create the tag constants file**

This file defines the single source of truth for review tags. Backend will have its own copy (Task 2), but the frontend constants also include the sentiment mapping needed for UI rendering.

```js
// kalasetu-frontend/src/constants/reviewTags.js

export const POSITIVE_TAGS = [
  'Excellent Craftsmanship',
  'On Time',
  'True to Photos',
  'Great Communication',
  'Exceeded Expectations',
  'Patient & Helpful',
  'Clean Workshop',
];

export const NEGATIVE_TAGS = [
  'Delayed',
  'Different from Photos',
  'Poor Packaging',
  'Unresponsive',
  'Overpriced',
];

export const ALL_TAGS = [...POSITIVE_TAGS, ...NEGATIVE_TAGS];

/**
 * Returns allowed tags based on the selected star rating.
 * 4-5 stars → positive only, 1-2 stars → negative only, 3 stars → all.
 */
export function getTagsForRating(rating) {
  if (rating >= 4) return POSITIVE_TAGS;
  if (rating <= 2) return NEGATIVE_TAGS;
  return ALL_TAGS; // 3 stars
}

/**
 * Returns 'positive' or 'negative' sentiment for a tag string.
 * Used by TagSummary for color coding.
 */
export function getTagSentiment(tag) {
  if (POSITIVE_TAGS.includes(tag)) return 'positive';
  if (NEGATIVE_TAGS.includes(tag)) return 'negative';
  return 'neutral';
}
```

**Step 2: Verify file was created**

Run: `ls kalasetu-frontend/src/constants/reviewTags.js`
Expected: File exists

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/constants/reviewTags.js
git commit -m "feat(reviews): add shared review tag constants"
```

---

## Task 2: Add tags field to Review model

**Files:**
- Modify: `kalasetu-backend/models/reviewModel.js` (lines 30-47)

**Step 1: Add the tags field to the schema**

Add `tags` between the existing `images` field (line 39) and `response` field (line 40):

```js
tags: {
  type: [String],
  default: [],
  validate: {
    validator: arr => arr.length <= 5,
    message: 'Maximum 5 tags allowed',
  },
},
```

Key decision: We use `default: []` and validate max length at schema level, but enforce minimum (1 tag) only in the controller. This way existing reviews without tags remain valid in the database.

Also make `comment` optional (design says "Write a review (optional)"):
- Change line 38 from `comment: { type: String, required: true, maxLength: 1000, trim: true },`
- To: `comment: { type: String, maxLength: 1000, trim: true, default: '' },`

**Step 2: Verify no syntax errors**

Run: `cd kalasetu-backend && node -e "import('./models/reviewModel.js').then(() => console.log('OK')).catch(e => console.error(e.message))"`
Expected: `OK`

**Step 3: Commit**

```bash
git add kalasetu-backend/models/reviewModel.js
git commit -m "feat(reviews): add tags field to Review model, make comment optional"
```

---

## Task 3: Add tag constants and validation to review controller

**Files:**
- Modify: `kalasetu-backend/controllers/reviewController.js`

**Step 1: Add tag constants at top of file (after imports, before Zod schema)**

Insert after line 26 (after the `import { sendEmail }` line):

```js
// --- Review tag constants (must match frontend constants/reviewTags.js) ---
const POSITIVE_TAGS = [
  'Excellent Craftsmanship', 'On Time', 'True to Photos',
  'Great Communication', 'Exceeded Expectations', 'Patient & Helpful', 'Clean Workshop',
];
const NEGATIVE_TAGS = [
  'Delayed', 'Different from Photos', 'Poor Packaging', 'Unresponsive', 'Overpriced',
];
const ALL_TAGS = [...POSITIVE_TAGS, ...NEGATIVE_TAGS];

function getAllowedTags(rating) {
  if (rating >= 4) return POSITIVE_TAGS;
  if (rating <= 2) return NEGATIVE_TAGS;
  return ALL_TAGS;
}
```

**Step 2: Update Zod schema to accept tags**

Replace the existing `createReviewSchema` (line 28-34):

```js
const createReviewSchema = z.object({
  artisanId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid artisan ID'),
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be under 1000 characters').optional().default(''),
  images: z.array(z.string().url()).max(3).optional(),
  tags: z.array(z.string()).min(1, 'Select at least 1 tag').max(5, 'Maximum 5 tags'),
});
```

Changes:
- `comment`: now optional with default `''` (matches model change in Task 2)
- `images`: max reduced from 10 to 3 (design says max 3 photos)
- `tags`: new required field, 1-5 strings

**Step 3: Add tag validation inside createReview handler**

After the existing Zod parse block (after line 43 `const { artisanId, bookingId, rating, comment, images = [] } = parsed.data;`), add tags to destructuring and validate:

```js
const { artisanId, bookingId, rating, comment, images = [], tags } = parsed.data;

// Validate tags against rating-dependent allowed list
const allowed = getAllowedTags(rating);
const invalidTags = tags.filter(t => !allowed.includes(t));
if (invalidTags.length > 0) {
  return res.status(400).json({
    success: false,
    message: `Invalid tags for ${rating}-star rating: ${invalidTags.join(', ')}`,
  });
}
```

**Step 4: Pass tags to Review.create**

In the `Review.create` call (around line 82-91), add `tags` to the object:

```js
const review = await Review.create({
  artisan: artisanId,
  user: userId,
  booking: bookingId || validBooking._id,
  service: validBooking.service || undefined,
  rating,
  comment,
  images,
  tags,
  isVerified: true,
});
```

**Step 5: Verify no syntax errors**

Run: `cd kalasetu-backend && node -e "import('./controllers/reviewController.js').then(() => console.log('OK')).catch(e => console.error(e.message))"`
Expected: `OK`

**Step 6: Commit**

```bash
git add kalasetu-backend/controllers/reviewController.js
git commit -m "feat(reviews): add tag validation to createReview controller"
```

---

## Task 4: Add tag aggregation endpoint

**Files:**
- Modify: `kalasetu-backend/controllers/reviewController.js`

**Step 1: Add getArtisanTags controller function**

Add after the `getArtisanReviews` function (after line 126):

```js
/**
 * GET /api/reviews/artisan/:artisanId/tags
 * Returns aggregated tag counts for an artisan — public endpoint.
 */
export const getArtisanTags = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  const objectId = new mongoose.Types.ObjectId(artisanId);

  const tags = await Review.aggregate([
    { $match: { artisan: objectId, status: 'active', tags: { $exists: true, $ne: [] } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: {
      _id: 0,
      tag: '$_id',
      count: 1,
      sentiment: {
        $cond: {
          if: { $in: ['$_id', POSITIVE_TAGS] },
          then: 'positive',
          else: { $cond: { if: { $in: ['$_id', NEGATIVE_TAGS] }, then: 'negative', else: 'neutral' } },
        },
      },
    }},
  ]);

  res.json({ success: true, data: tags });
});
```

**Step 2: Verify import works**

Run: `cd kalasetu-backend && node -e "import('./controllers/reviewController.js').then(m => console.log(typeof m.getArtisanTags)).catch(e => console.error(e.message))"`
Expected: `function`

**Step 3: Commit**

```bash
git add kalasetu-backend/controllers/reviewController.js
git commit -m "feat(reviews): add tag aggregation endpoint controller"
```

---

## Task 5: Add tags route

**Files:**
- Modify: `kalasetu-backend/routes/reviewRoutes.js`

**Step 1: Add import and route**

Update the import on line 26 to include `getArtisanTags`:

```js
import { createReview, getArtisanReviews, getArtisanTags, respondToReview, toggleHelpful } from '../controllers/reviewController.js';
```

Add the new route after line 32 (`router.get('/artisan/:artisanId', getArtisanReviews);`):

```js
router.get('/artisan/:artisanId/tags', getArtisanTags);
```

This must come AFTER the artisan reviews route since Express matches in order and `/artisan/:artisanId` would catch `/artisan/:artisanId/tags` if the new route were listed first. Actually, Express handles this correctly regardless of order since `/tags` is a more specific path segment. But keeping it adjacent to the related route improves readability.

**Step 2: Verify no syntax errors**

Run: `cd kalasetu-backend && node -e "import('./routes/reviewRoutes.js').then(() => console.log('OK')).catch(e => console.error(e.message))"`
Expected: `OK`

**Step 3: Commit**

```bash
git add kalasetu-backend/routes/reviewRoutes.js
git commit -m "feat(reviews): add GET /api/reviews/artisan/:id/tags route"
```

---

## Task 6: Create StarRating component

**Files:**
- Create: `kalasetu-frontend/src/components/ui/StarRating.jsx`
- Modify: `kalasetu-frontend/src/components/ui/index.js`

**Step 1: Create StarRating.jsx**

```jsx
import { Star } from 'lucide-react';

const LABELS = { 1: 'Poor', 2: 'Below Average', 3: 'Average', 4: 'Good', 5: 'Excellent' };

const SIZE_MAP = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/**
 * Interactive star rating selector (or read-only display).
 *
 * @param {number} value — Current rating (0-5, 0 = unselected)
 * @param {(n: number) => void} onChange — Called with new rating
 * @param {'sm'|'md'|'lg'} size — Star icon size
 * @param {boolean} readOnly — If true, disables interaction
 * @param {boolean} showLabel — Show text label ("Poor" → "Excellent")
 */
export default function StarRating({ value = 0, onChange, size = 'lg', readOnly = false, showLabel = true, className = '' }) {
  const iconClass = SIZE_MAP[size] || SIZE_MAP.lg;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`p-1 transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            className={`${iconClass} transition-colors ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
      {showLabel && value > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-700">{LABELS[value]}</span>
      )}
    </div>
  );
}
```

**Step 2: Add barrel export**

Add to `kalasetu-frontend/src/components/ui/index.js` at the end:

```js
export { default as StarRating } from './StarRating';
```

**Step 3: Verify build**

Run: `cd kalasetu-frontend && npx vite build 2>&1 | tail -3`
Expected: Build completes without errors

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/ui/StarRating.jsx kalasetu-frontend/src/components/ui/index.js
git commit -m "feat(reviews): create interactive StarRating component"
```

---

## Task 7: Create ReviewSheet BottomSheet

**Files:**
- Create: `kalasetu-frontend/src/components/booking/ReviewSheet.jsx`

This is the core component — a single scrollable BottomSheet with progressive reveal (Zomato pattern).

**Step 1: Create ReviewSheet.jsx**

```jsx
import { useState, useContext, useRef, useEffect } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
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
```

**Step 2: Verify build**

Run: `cd kalasetu-frontend && npx vite build 2>&1 | tail -3`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/booking/ReviewSheet.jsx
git commit -m "feat(reviews): create ReviewSheet BottomSheet with progressive reveal"
```

---

## Task 8: Create TagSummary component

**Files:**
- Create: `kalasetu-frontend/src/components/artisan/TagSummary.jsx`

**Step 1: Create TagSummary.jsx**

```jsx
import { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import { Skeleton } from '../ui/index.js';

/**
 * Displays aggregated review tags at the top of ReviewsTab.
 * Fetches from GET /api/reviews/artisan/:id/tags.
 * Only shown when artisan has 3+ reviews.
 *
 * @param {string} artisanId
 * @param {number} totalReviews — Skip render if < 3
 */
export default function TagSummary({ artisanId, totalReviews = 0, className = '' }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (totalReviews < 3) { setLoading(false); return; }

    let cancelled = false;
    api.get(`/api/reviews/artisan/${artisanId}/tags`)
      .then(res => {
        if (!cancelled) setTags(res.data?.data || []);
      })
      .catch(() => { /* non-critical — silently hide */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [artisanId, totalReviews]);

  if (totalReviews < 3) return null;

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rect" width="100px" height="28px" className="rounded-full" />)}
      </div>
    );
  }

  if (tags.length === 0) return null;

  // Show top 6 tags
  const display = tags.slice(0, 6);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {display.map(({ tag, count, sentiment }) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            sentiment === 'positive'
              ? 'bg-success-50 text-success-700 border border-success-200'
              : sentiment === 'negative'
              ? 'bg-error-50 text-error-700 border border-error-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {tag} <span className="text-[10px] opacity-70">({count})</span>
        </span>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/artisan/TagSummary.jsx
git commit -m "feat(reviews): create TagSummary component for artisan profile"
```

---

## Task 9: Integrate TagSummary into ReviewsTab

**Files:**
- Modify: `kalasetu-frontend/src/components/artisan/ReviewsTab.jsx`

**Step 1: Add import**

Add at the top of the file, after the existing imports (after line 6):

```js
import TagSummary from './TagSummary.jsx';
```

**Step 2: Replace the TODO comment with TagSummary**

Replace line 160:
```
{/* TODO Phase 7: Tag summary chips will go here */}
```

With:
```jsx
{/* Tag summary chips — only rendered when artisan has 3+ reviews */}
<TagSummary artisanId={artisanId} totalReviews={totalReviews} className="mb-4" />
```

**Step 3: Verify build**

Run: `cd kalasetu-frontend && npx vite build 2>&1 | tail -3`
Expected: Build completes without errors

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/artisan/ReviewsTab.jsx
git commit -m "feat(reviews): integrate TagSummary into ReviewsTab"
```

---

## Task 10: Add "Leave Review" button to BookingCard

**Files:**
- Modify: `kalasetu-frontend/src/pages/dashboard/user/UserBookings.jsx`

The BookingCard itself stays generic (it renders whatever `actions` array it receives). The review logic lives in UserBookings where actions are built per-status.

**Step 1: Add imports for ReviewSheet**

At the top of `UserBookings.jsx`, add:

```js
import ReviewSheet from '../../../components/booking/ReviewSheet.jsx';
```

**Step 2: Add review state**

After the existing `cancelTarget` state (line 24), add:

```js
const [reviewTarget, setReviewTarget] = useState(null); // booking object or null
const [reviewedIds, setReviewedIds] = useState(new Set()); // track reviewed bookings locally
```

**Step 3: Update completed booking actions**

Replace the `case 'completed'` block in `getActionsForBooking` (lines 71-75):

```js
case 'completed': {
  const actions = [];
  if (!reviewedIds.has(booking._id)) {
    actions.push({ label: 'Leave Review', variant: 'primary', icon: Star, onClick: () => setReviewTarget(booking) });
  }
  actions.push({ label: 'Book Again', variant: 'secondary', icon: RotateCcw, onClick: () => navigate(artisanUrl) });
  return actions;
}
```

**Step 4: Add review success handler and deep link support**

After the `handleCancelSuccess` function (after line 89), add:

```js
const handleReviewSuccess = () => {
  setReviewedIds(prev => new Set(prev).add(reviewTarget?._id));
  setReviewTarget(null);
};

// Deep link: ?review=bookingId opens ReviewSheet automatically
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const reviewBookingId = params.get('review');
  if (reviewBookingId && bookings.length > 0) {
    const target = bookings.find(b => b._id === reviewBookingId && b.status === 'completed');
    if (target) {
      setActiveTab('completed');
      setReviewTarget(target);
    }
    // Clear the query param
    const url = new URL(window.location);
    url.searchParams.delete('review');
    window.history.replaceState({}, '', url);
  }
}, [bookings]);
```

**Step 5: Add ReviewSheet render**

After the existing `CancellationSheet` component (after line 168), add:

```jsx
{/* Review sheet */}
<ReviewSheet
  open={!!reviewTarget}
  onClose={() => setReviewTarget(null)}
  onSuccess={handleReviewSuccess}
  booking={reviewTarget}
  artisanName={reviewTarget?.artisan?.fullName || 'Artisan'}
/>
```

**Step 6: Verify build**

Run: `cd kalasetu-frontend && npx vite build 2>&1 | tail -3`
Expected: Build completes without errors

**Step 7: Commit**

```bash
git add kalasetu-frontend/src/pages/dashboard/user/UserBookings.jsx
git commit -m "feat(reviews): add Leave Review button and deep link support"
```

---

## Task 11: Final build verification

**Step 1: Full frontend build**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds

**Step 2: Backend import check**

Run: `cd kalasetu-backend && node -e "Promise.all([import('./models/reviewModel.js'), import('./controllers/reviewController.js'), import('./routes/reviewRoutes.js')]).then(() => console.log('All OK')).catch(e => console.error(e))"`
Expected: `All OK`

**Step 3: Update HANDOVER.md**

Update `docs/development/HANDOVER.md` with Phase 7 completion status.

**Step 4: Commit**

```bash
git add docs/development/HANDOVER.md
git commit -m "docs: update handover for Phase 7 — Reviews Flow complete"
```

---

## Files Summary

| Action | File | Task |
|--------|------|------|
| **Create** | `kalasetu-frontend/src/constants/reviewTags.js` | 1 |
| **Modify** | `kalasetu-backend/models/reviewModel.js` | 2 |
| **Modify** | `kalasetu-backend/controllers/reviewController.js` | 3, 4 |
| **Modify** | `kalasetu-backend/routes/reviewRoutes.js` | 5 |
| **Create** | `kalasetu-frontend/src/components/ui/StarRating.jsx` | 6 |
| **Modify** | `kalasetu-frontend/src/components/ui/index.js` | 6 |
| **Create** | `kalasetu-frontend/src/components/booking/ReviewSheet.jsx` | 7 |
| **Create** | `kalasetu-frontend/src/components/artisan/TagSummary.jsx` | 8 |
| **Modify** | `kalasetu-frontend/src/components/artisan/ReviewsTab.jsx` | 9 |
| **Modify** | `kalasetu-frontend/src/pages/dashboard/user/UserBookings.jsx` | 10 |

## Verification Checklist

- [ ] Backend: `node -e` import all modified files → no errors
- [ ] Frontend: `npm run build` → passes
- [ ] Create review: POST /api/reviews with rating + tags → 201
- [ ] Create review without tags → 400 "Select at least 1 tag"
- [ ] Create review with wrong sentiment tags → 400 "Invalid tags for X-star rating"
- [ ] Tag aggregation: GET /api/reviews/artisan/:id/tags → returns counts
- [ ] StarRating: interactive star selection with labels
- [ ] ReviewSheet: progressive reveal after rating, tag chips, photo upload, submit
- [ ] TagSummary: shows on artisan profile when 3+ reviews exist
- [ ] Leave Review button on completed bookings
- [ ] Deep link: /dashboard/bookings?review=ID → opens ReviewSheet
