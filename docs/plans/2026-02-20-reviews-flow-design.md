# Phase 7: Reviews Flow — Design Document

> Date: 2026-02-20
> Status: Approved
> Approach: Single scrollable BottomSheet with progressive reveal (Zomato pattern)
> Depends on: Phase 6 (Booking Status & Tracking)

## Context

Phases 1-6 rebuilt the design system, homepage, search, artisan profile, booking flow, and booking management. The review system has solid backend CRUD (create, list, respond, helpful votes) and a polished ReviewCard component, but **zero submission flow** and **zero tag infrastructure** exist.

This phase adds the Zomato-inspired tag-based review system: a ReviewSheet BottomSheet for submission, tag aggregation on artisan profiles, and review triggers from completed bookings.

### What Already Exists

| Component | Status |
|-----------|--------|
| Review model (rating, comment, images, artisan response, helpful votes) | Complete |
| POST /api/reviews (create, requires completed booking) | Complete |
| GET /api/reviews/artisan/:id (paginated listing) | Complete |
| PATCH /api/reviews/:id/respond (artisan response) | Complete |
| POST /api/reviews/:id/helpful (toggle helpful) | Complete |
| ReviewCard component (tags-aware display, photos, artisan response) | Complete |
| ReviewsTab on artisan profile (rating summary, paginated reviews) | Complete |
| Rating recomputation on artisan document | Complete |

### What's Missing

| Component | Status |
|-----------|--------|
| `tags` field in review model | Not built |
| Tag validation (allowed list, rating-dependent) | Not built |
| Tag aggregation endpoint | Not built |
| Review submission BottomSheet (ReviewSheet) | Not built |
| Star rating selector component | Not built |
| Tag selection UI | Not built |
| Photo upload in review form | Not built |
| Tag summary display on artisan profile | Not built |
| "Leave Review" trigger on completed bookings | Not built |

---

## Section 1: Backend — Tag System

### Review Model Update

Add `tags` field to `reviewModel.js`:

```js
tags: {
  type: [String],
  validate: {
    validator: arr => arr.length >= 1 && arr.length <= 5,
    message: 'Select 1 to 5 tags'
  }
}
```

Tags are required when creating a review (enforced in controller, not at schema level, so existing reviews without tags remain valid).

### Tag Constants

Defined as a shared constant, used by both backend validation and frontend display:

**Positive tags** (shown for 4-5 star ratings):
- "Excellent Craftsmanship"
- "On Time"
- "True to Photos"
- "Great Communication"
- "Exceeded Expectations"
- "Patient & Helpful"
- "Clean Workshop"

**Negative tags** (shown for 1-2 star ratings):
- "Delayed"
- "Different from Photos"
- "Poor Packaging"
- "Unresponsive"
- "Overpriced"

**3-star ratings**: All tags shown (positive + negative).

Backend stores tags as plain strings. Validation checks:
1. Each tag is in the allowed list
2. Tags match the rating category (positive tags only for 4-5, negative only for 1-2, all for 3)
3. 1-5 tags selected

### New Endpoint: GET /api/reviews/artisan/:id/tags

Returns aggregated tag counts for display:

```json
{
  "success": true,
  "data": [
    { "tag": "Excellent Craftsmanship", "count": 23, "sentiment": "positive" },
    { "tag": "On Time", "count": 18, "sentiment": "positive" },
    { "tag": "Delayed", "count": 2, "sentiment": "negative" }
  ]
}
```

Implementation: MongoDB aggregation pipeline:
1. `$match` — artisan ID, status: 'active'
2. `$unwind` — tags array
3. `$group` — by tag, count occurrences
4. `$sort` — by count descending
5. `$limit` — top 10 tags

### Update createReview Controller

- Accept `tags` array in Zod validation schema
- Validate tags against allowed list based on rating value
- Store tags in review document
- No change to existing rating recomputation or notification logic

---

## Section 2: Frontend — ReviewSheet Component

### Component: ReviewSheet.jsx

Location: `kalasetu-frontend/src/components/booking/ReviewSheet.jsx`

A single scrollable BottomSheet with progressive reveal:

**Props:**
```js
ReviewSheet({
  open,           // boolean — controls BottomSheet visibility
  onClose,        // () => void
  onSuccess,      // (review) => void — called after successful submission
  booking,        // { _id, artisan, serviceName, start }
  artisanName,    // string
})
```

**Layout (top to bottom):**

1. **Header**: "Rate your experience with {artisanName}"
2. **Context**: Service name + booking date (read-only)
3. **Star Rating**: 5 large tappable stars with label ("Poor" → "Excellent")
4. **Tags section** (appears after rating): "What stood out?" + chip grid
5. **Text area** (appears after rating): "Write a review (optional)" — min 20 chars if entered
6. **Photo upload** (appears after rating): "Add photos" — max 3, Cloudinary signed upload
7. **Submit button**: Disabled until rating + 1+ tags selected

**Progressive Reveal Behavior:**
- Initial state: only header + context + star rating visible
- After rating tap: tags, text, photos, and submit button animate in (CSS transition, slide down)
- Tag chips shown depend on selected rating:
  - 4-5 stars → positive tags only
  - 1-2 stars → negative tags only
  - 3 stars → all tags
- If user changes rating, tags reset (since available tags change)

**Star Rating Selector:**
- 5 stars rendered as Star icons from lucide-react
- Filled (gold) for selected, outline for unselected
- Labels: 1="Poor", 2="Below Average", 3="Average", 4="Good", 5="Excellent"
- Large touch targets (min 44px)

**Tag Selection:**
- FilterChips-style horizontal wrap (not scroll — all visible)
- Active: brand-colored fill. Inactive: outlined gray
- Counter shows "X/5 selected"
- Disable further selection when 5 reached (toast "Maximum 5 tags")

**Photo Upload:**
- Thumbnail grid (3 slots)
- First slot is "+" add button
- Uploaded images show preview with X to remove
- Uses existing Cloudinary signed upload flow
- Uploads happen on submit (staged locally first)

**Submission:**
- POST /api/reviews with { booking: bookingId, rating, tags, comment, images }
- Loading state on button during submission
- On success: close sheet, call onSuccess, show toast "Review submitted!"
- On error: show toast with error message, keep form open

### Component: StarRating.jsx

Location: `kalasetu-frontend/src/components/ui/StarRating.jsx`

Reusable interactive star rating input:

```js
StarRating({
  value,      // number 0-5
  onChange,   // (rating) => void
  size,       // 'sm' | 'md' | 'lg' (default 'lg')
  readOnly,   // boolean (for display mode)
  showLabel,  // boolean — show text label like "Excellent"
})
```

Added to barrel export in `components/ui/index.js`.

---

## Section 3: Tag Summary Display

### TagSummary Component

Location: `kalasetu-frontend/src/components/artisan/TagSummary.jsx`

Displays aggregated tags at the top of the ReviewsTab on the artisan profile page.

**Layout:**
- Horizontal wrap of tag chips
- Each chip: tag name + count in parentheses
- Green background for positive tags, red for negative
- Shows top 6 tags maximum
- Fetches from `GET /api/reviews/artisan/:id/tags`
- Skeleton while loading, hidden if no tags

**Integration:**
- Rendered inside ReviewsTab (artisan profile), between rating summary and review list
- Only shown when artisan has 3+ reviews (not useful with fewer)

### ReviewsTab Update

Add TagSummary between rating overview and review list:

```
Rating summary card (existing)
  ↓
TagSummary (new)
  ↓
Individual reviews (existing)
```

---

## Section 4: Review Triggers

### BookingCard "Leave Review" Button

In `BookingCard.jsx`, for bookings with `status === 'completed'`:

- If booking has no review: show "Leave Review" button (Star icon)
- If booking has a review: show "Reviewed" badge (CheckCircle icon, green)
- Button opens ReviewSheet with booking context

**Tracking reviewed state:**
- On review submission success, update local state to hide button
- On page load, the booking API could include a `hasReview` boolean (lightweight, computed via Review.exists({ booking: bookingId }))
- OR: frontend fetches user's reviews and cross-references (simpler, no backend change)

Recommendation: Add `hasReview` as a virtual/computed field when fetching bookings for the current user. Lightweight — one aggregation query.

### Notification Deep Link

When `completeBooking` runs (backend), the existing notification says "How was your experience? Leave a review!" with URL `/dashboard/bookings`.

Update to: `/dashboard/bookings?review={bookingId}`

UserBookings page checks for `review` query param on mount:
- If present, finds the booking, opens ReviewSheet automatically
- Clears the query param after opening

### Success Flow

1. User taps "Leave Review" on BookingCard
2. ReviewSheet opens with booking context
3. User rates, selects tags, optionally writes text + adds photos
4. User taps "Submit Review"
5. POST /api/reviews → success
6. ReviewSheet closes, toast "Review submitted!"
7. BookingCard updates: button changes to "Reviewed" badge
8. Artisan gets notification + email (already built)

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Modify | `kalasetu-backend/models/reviewModel.js` | Add `tags` field |
| Modify | `kalasetu-backend/controllers/reviewController.js` | Tag validation, tag aggregation endpoint |
| Modify | `kalasetu-backend/routes/reviewRoutes.js` | Add tags endpoint route |
| Create | `kalasetu-frontend/src/constants/reviewTags.js` | Shared tag constants |
| Create | `kalasetu-frontend/src/components/ui/StarRating.jsx` | Interactive star rating input |
| Create | `kalasetu-frontend/src/components/booking/ReviewSheet.jsx` | Review submission BottomSheet |
| Create | `kalasetu-frontend/src/components/artisan/TagSummary.jsx` | Tag summary display |
| Modify | `kalasetu-frontend/src/components/artisan/ReviewsTab.jsx` | Add TagSummary section |
| Modify | `kalasetu-frontend/src/components/booking/BookingCard.jsx` | Add "Leave Review" button |
| Modify | `kalasetu-frontend/src/pages/dashboard/user/UserBookings.jsx` | Handle review deep link |
| Modify | `kalasetu-frontend/src/components/ui/index.js` | Export StarRating |

## Verification

- Create a completed booking via seed data or manual flow
- Tap "Leave Review" on completed BookingCard → ReviewSheet opens
- Rate 5 stars → positive tags appear, select 2-3
- Write optional text, add a photo
- Submit → toast "Review submitted!", card shows "Reviewed"
- Visit artisan profile → ReviewsTab shows tag summary chips with counts
- Review displays with tags, text, photo, and helpful button
- Artisan can respond to the review
- Navigate via notification deep link → ReviewSheet opens automatically
