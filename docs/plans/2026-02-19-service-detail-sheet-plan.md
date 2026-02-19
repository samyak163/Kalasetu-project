# Service Detail Sheet — Implementation Plan

> Design: [2026-02-19-service-detail-sheet-design.md](./2026-02-19-service-detail-sheet-design.md)
> Estimated tasks: 5

---

## Task 1: Add `service` field to Review model + auto-populate on create

**Why first:** Backend data must exist before frontend can consume it.

### Steps

1. **Edit `kalasetu-backend/models/reviewModel.js`:**
   - Add field: `service: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtisanService', index: true }`
   - Add index: `reviewSchema.index({ service: 1, status: 1 })`

2. **Edit `kalasetu-backend/controllers/reviewController.js`:**
   - In the create review handler, after validating the booking:
     ```js
     // Auto-populate service from booking
     if (booking.service) {
       reviewData.service = booking.service;
     }
     ```
   - No migration needed — existing reviews without `service` field are fine (optional field)

### Verify
- Read the review model to confirm field is added
- Check that existing review creation flow still works (booking.service is optional)

---

## Task 2: Add per-service stats endpoint

**Why:** The detail sheet needs booking count + review stats per service.

### Steps

1. **Create `kalasetu-backend/controllers/serviceStatsController.js`:**
   ```js
   // GET /api/services/:serviceId/stats
   // Returns { bookingCount, averageRating, reviewCount }
   ```
   - `bookingCount`: `Booking.countDocuments({ service: serviceId, status: { $nin: ['cancelled'] } })`
   - Review stats: `Review.aggregate([{ $match: { service: serviceId, status: 'approved' } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }])`
   - Return `{ bookingCount, averageRating: avg || 0, reviewCount: count || 0 }`
   - Wrap with asyncHandler

2. **Edit `kalasetu-backend/routes/serviceRoutes.js`:**
   - Add route: `router.get('/:serviceId/stats', getServiceStats)`
   - Public route (no auth needed — stats are public like the artisan profile)

### Verify
- `curl http://localhost:5000/api/services/<any-service-id>/stats` returns JSON with the three fields
- Non-existent service ID returns `{ bookingCount: 0, averageRating: 0, reviewCount: 0 }`

---

## Task 3: Create ServiceDetailSheet component

**Why:** The core frontend feature.

### Steps

1. **Create `kalasetu-frontend/src/components/artisan/ServiceDetailSheet.jsx`:**
   - Props: `{ service, artisan, open, onClose, onBook }`
   - Uses `BottomSheet` with title "Service Detail"
   - Layout (top to bottom):
     a. **ImageCarousel** — `service.images` array, aspect ratio `4/3`, fallback to category-colored placeholder if no images
     b. **Service name** — `<h3>` full text, no clamp
     c. **Category + duration** — `service.categoryName · formatDuration(service.durationMinutes)`
     d. **Price** — `₹{service.price.toLocaleString('en-IN')}` bold, or "Contact for pricing" if 0
     e. **Stats row** — fetched from `/api/services/${service._id}/stats`:
        - `★ {averageRating}` + `({reviewCount} reviews)` + `· {bookingCount} booked`
        - Show Skeleton while loading, hide row if all zeros
     f. **Description** — full text under "About this service" subheading, or nothing if empty
     g. **Book CTA** — `Button variant="primary" className="w-full"` with price, calls `onBook(service)` then `onClose()`

2. **Stats fetch:** Use `useEffect` + `useState` to fetch `/api/services/${service._id}/stats` when `open` becomes true. Lightweight request, no caching needed.

### Verify
- Component renders with all sections
- ImageCarousel swipes through images
- Stats show after fetch
- Book button calls onBook and closes sheet

---

## Task 4: Wire ServicesTab to open detail sheet on card tap

### Steps

1. **Edit `kalasetu-frontend/src/components/artisan/ServicesTab.jsx`:**
   - Add props: `artisan` (needed for detail sheet stats context)
   - Add state: `const [detailService, setDetailService] = useState(null)`
   - Make the card div clickable: `onClick={() => setDetailService(service)}`
   - Keep the "Book This Service" button with `onClick={(e) => { e.stopPropagation(); onBook(service); }}` — direct book still works
   - Render `ServiceDetailSheet` at bottom:
     ```jsx
     <ServiceDetailSheet
       service={detailService}
       artisan={artisan}
       open={!!detailService}
       onClose={() => setDetailService(null)}
       onBook={onBook}
     />
     ```

2. **Edit `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx`:**
   - Pass `artisan` prop to `ServicesTab`:
     ```jsx
     <ServicesTab services={services} artisan={artisan} onBook={handleBook} />
     ```

### Verify
- Tap service card → detail sheet opens with correct service
- Tap "Book This Service" on card → goes directly to booking (no detail sheet)
- Tap "Book This Service" in detail sheet → sheet closes, booking flow starts
- Tap X or backdrop → sheet closes

---

## Task 5: Visual polish + edge cases

### Steps

1. **No-image fallback in ServiceDetailSheet:**
   - If `service.images` is empty, show a brand-colored placeholder with category name instead of ImageCarousel

2. **Stats empty state:**
   - If bookingCount === 0 and reviewCount === 0, show "New service" badge instead of stats row
   - If only rating is available (artisan-level fallback), show artisan rating with note

3. **Accessibility:**
   - Service card: add `role="button"` and `tabIndex={0}` with `onKeyDown` Enter handler
   - Price formatting: use `aria-label` for screen readers (`aria-label="Price: 2500 rupees"`)

4. **Mobile scroll:** Ensure BottomSheet content scrolls if description is long (already handled by BottomSheet's `overflow-y-auto`)

### Verify
- Service with no images shows fallback
- New service (0 bookings) shows "New service" badge
- Keyboard navigation works (Tab → Enter opens detail)
- Long description scrolls within the sheet

---

## Commit strategy

One commit per task:
1. `feat(backend): add service field to review model`
2. `feat(backend): add per-service stats endpoint`
3. `feat(frontend): create ServiceDetailSheet component`
4. `feat(frontend): wire ServicesTab to open service detail on tap`
5. `feat(frontend): polish service detail edge cases and a11y`
