# Artisan Service Management UI — Implementation Plan

> Design: [2026-02-19-artisan-service-management-design.md](./2026-02-19-artisan-service-management-design.md)
> Estimated tasks: 4

---

## Task 1: Create MultiImageUpload component

**Why first:** Both the form sheet and future components need this reusable piece.

### Steps

1. **Create `kalasetu-frontend/src/components/ui/MultiImageUpload.jsx`:**
   - Props: `images`, `onImagesChange`, `maxImages` (default 6), `folder`, `className`
   - Thumbnail grid: 4 columns mobile (`grid-cols-4`), 5 desktop (`md:grid-cols-5`)
   - Each thumbnail slot:
     - Image preview with `object-cover`
     - "Cover" badge on first image
     - Left/Right arrow buttons (hide left on first, right on last)
     - X remove button (top-right corner)
   - Last slot: "+ Upload" area with dashed border, hidden when at max
   - `<input type="file" multiple accept="image/*">` for batch selection
   - Upload handler: reuse Cloudinary signed upload from `ImageUpload.jsx` pattern
     - `fetch('/api/uploads/signature?folder=...')` → FormData → Cloudinary
   - Show `Loader2` spinner overlay on each uploading thumbnail
   - Counter text: `{images.length}/{maxImages} images`

2. **Add to barrel export `kalasetu-frontend/src/components/ui/index.js`:**
   - `export { default as MultiImageUpload } from './MultiImageUpload';`

### Verify
- Component renders empty state with upload area
- Can upload multiple images at once
- Arrow buttons reorder images
- X removes images
- Cover badge on first image
- Respects max limit

---

## Task 2: Create ServiceFormSheet component

**Why second:** Needs MultiImageUpload from Task 1.

### Steps

1. **Create `kalasetu-frontend/src/components/profile/ServiceFormSheet.jsx`:**
   - Props: `open`, `onClose`, `service` (null=create), `categories`, `extraServices`, `onSave`
   - Uses `BottomSheet` from design system
   - Override BottomSheet width: pass `className="md:max-w-3xl"` for wider modal on desktop
   - Internal form state: `categoryId`, `name`, `description`, `price`, `durationMinutes`, `images`
   - Initialize from `service` prop on open (or reset to defaults for create)
   - Desktop layout: `grid md:grid-cols-3` — form in `col-span-2`, preview in `col-span-1`
   - Mobile layout: single column, preview section at bottom

2. **Form fields (port from current ServiceModal):**
   - Category dropdown with `categories`
   - Suggested services chips (when category selected)
   - Service name input
   - Description textarea
   - Price + Duration side-by-side inputs
   - `MultiImageUpload` component with `folder="artisan/services"`
   - All inputs use design tokens: `border-gray-300 focus:border-brand-500 focus:ring-brand-500/20`

3. **Live preview panel:**
   - Renders a mini service card using current form state
   - Image: first image from `images` array, or category-colored fallback
   - Name, categoryName (looked up from categories), duration, price
   - "New service" badge (always shown in preview since no stats exist yet)
   - Styled to match the public `ServiceItem` card from `components/artisan/ServicesTab.jsx`

4. **Submit handler:**
   - Validate: categoryId required, name required
   - Build payload: `{ categoryId, name, description, price, durationMinutes, images }`
   - Create: `POST /api/services` / Edit: `PATCH /api/services/:id`
   - On success: call `onSave(savedService)`, close sheet, show toast
   - On error: show toast with error message

### Verify
- Sheet opens for create (empty form) and edit (pre-filled)
- Live preview updates as user types
- Form validates required fields
- Save creates/updates service via API
- Sheet closes on successful save

---

## Task 3: Rewrite ServicesTab with image-forward cards

**Why third:** Needs ServiceFormSheet from Task 2.

### Steps

1. **Rewrite `kalasetu-frontend/src/components/profile/tabs/ServicesTab.jsx`:**
   - Keep all existing state management and API logic (fetchAll, handleToggle, handleDelete)
   - Replace `ServiceModal` with `ServiceFormSheet`:
     - `openCreateModal` → opens sheet with `service={null}`
     - `openEditModal` → opens sheet with `service={editingService}`
     - `resetModal` → closes sheet
     - Remove `handleFormChange`, `handleImageAdd`, `handleImageRemove`, `handleSubmit` — these move into ServiceFormSheet
     - Add `handleSave(savedService)` — updates or prepends to services list

2. **Replace `ServiceListSection` with image-forward cards:**
   - Each service card:
     - Full-width image (first image, optimized via `optimizeImage`)
     - Or brand-colored fallback if no images
     - Service name + category badge + Live/Archived status badge
     - Price + Duration row
     - Action buttons: Edit (Button variant outline), Archive/Activate, Delete (red)
   - Delete: inline confirmation instead of `window.confirm()`
     - When delete clicked, card shows "Are you sure?" with Cancel/Delete buttons
     - Uses state `confirmingDelete` to track which service is being confirmed

3. **Replace all raw hex colors:**
   - `bg-[#A55233]` → `bg-brand-500`
   - `hover:bg-[#8e462b]` → `hover:bg-brand-600`
   - `text-[#A55233]` → `text-brand-500`
   - `focus:border-[#A55233]` → `focus:border-brand-500`
   - `focus:ring-[#A55233]/20` → `focus:ring-brand-500/20`
   - `text-brand-500` in loading spinner instead of `text-[#A55233]`

4. **"Add Service" button:**
   - Use `Button` component: `<Button variant="primary" size="sm"><Plus /> Add Service</Button>`

### Verify
- Service list shows image-forward cards
- Edit opens ServiceFormSheet with data pre-filled
- Create opens empty ServiceFormSheet
- Delete shows inline confirmation
- Archive/Activate toggles work
- No raw hex colors remain

---

## Task 4: Polish and integration testing

### Steps

1. **Empty states:**
   - Active Services empty: "No services yet. Create your first service to start getting bookings."
   - Use `EmptyState` component from design system

2. **Responsive check:**
   - Mobile: ServiceFormSheet slides up as BottomSheet, single-column form
   - Desktop: Wider modal with side-by-side form + preview
   - Cards: full-width on mobile, 2-column grid on desktop

3. **Keyboard/a11y:**
   - ServiceFormSheet: Escape closes, focus trapped inside
   - Already handled by BottomSheet component
   - Service cards: action buttons have proper labels

4. **Remove dead code:**
   - Delete old `ServiceModal` component (replaced by ServiceFormSheet)
   - Delete old `ServiceListSection` (replaced by inline card layout)
   - Remove PropTypes imports if no longer needed

### Verify
- Full create → edit → archive → delete flow works
- Mobile and desktop layouts correct
- Design tokens used throughout (no hex colors)
- No console errors

---

## Commit strategy

One commit per task:
1. `feat(frontend): create MultiImageUpload component`
2. `feat(frontend): create ServiceFormSheet with live preview`
3. `feat(frontend): rewrite artisan ServicesTab with image-forward cards`
4. `feat(frontend): polish artisan service management and cleanup`
