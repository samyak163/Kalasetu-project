# Artisan Service Management UI Redesign

> Date: 2026-02-19
> Status: Approved

## Problem

The artisan's service management UI (`components/profile/tabs/ServicesTab.jsx`) has significant UX gaps:

1. **ImageUpload** is a single-photo profile component — artisans add images one-by-one with no gallery view
2. **ServiceModal** is a raw `div` overlay, not using the design system's BottomSheet/Modal
3. **Service cards** are text-heavy with tiny 20x20 thumbnails — artisans can't see how their listing looks to customers
4. Uses raw `#A55233` hex instead of `brand-*` design tokens
5. Delete uses `window.confirm()` instead of a proper dialog
6. No image reordering, no multi-select upload, no cover image concept

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Live preview | Yes — real-time card preview | Artisans see what customers see before publishing |
| Form container | BottomSheet (mobile) / Modal (desktop) | Consistent with the rest of the app |
| Image upload | Multi-upload + grid + reorder | Essential for showcasing service quality |
| Reorder UX | Arrow buttons (left/right) | Works everywhere, no touch library needed |
| Service list | Image-forward cards with action overlays | Matches public view — artisans see customer perspective |

## Components

### 1. MultiImageUpload (new — reusable)

**Location:** `components/ui/MultiImageUpload.jsx`
**Barrel export:** Added to `components/ui/index.js`

**Props:**
- `images`: string[] — current image URLs
- `onImagesChange`: (urls: string[]) => void — callback with full reordered array
- `maxImages`: number (default 6)
- `folder`: string — Cloudinary upload folder
- `className`: string

**Layout:**
- Grid of thumbnail cards (4 per row mobile, 5 desktop)
- First image marked with "Cover" badge
- Each thumbnail: image preview, left/right arrow buttons, X remove button
- Last slot: "+ Upload" button (hidden when at max)
- Counter: "N/6 images" with helper text
- Supports `<input multiple>` for batch file selection

**Upload flow:**
- Reuses existing Cloudinary signed upload pattern from `ImageUpload.jsx`
- Shows spinner overlay on each uploading thumbnail
- Adds to end of array on success

### 2. ServiceFormSheet (new)

**Location:** `components/profile/ServiceFormSheet.jsx`

**Props:**
- `open`: boolean
- `onClose`: () => void
- `service`: object | null — null for create, object for edit
- `categories`: array — from categories API
- `extraServices`: array — extra service suggestions
- `onSave`: (savedService) => void — called after successful API save

**Layout:**
- Uses `BottomSheet` with `className="md:max-w-3xl"`
- Desktop: 2-column grid — form (left, col-span-2), live preview (right, col-span-1)
- Mobile: single column — form fields, then preview section below

**Form fields (same as current):**
1. Category dropdown
2. Suggested services chips (when category selected)
3. Service name input
4. Description textarea
5. Price (INR) + Duration (minutes) — side-by-side
6. Images — `MultiImageUpload` component

**Live preview panel:**
- Renders a scaled-down version of the public service card
- Updates in real-time as artisan types
- Shows: first image (or category fallback), name, category + duration, price, "New service" badge
- Visually identical to what customers see on the artisan profile

**API calls (encapsulated):**
- Create: `POST /api/services` with payload
- Update: `PATCH /api/services/:id` with payload
- Calls `onSave(savedService)` on success, closes sheet

### 3. ServicesTab (rewrite)

**Location:** `components/profile/tabs/ServicesTab.jsx` (existing file)

**Service management cards:**
- Image-forward layout matching public `ServiceItem` from `components/artisan/ServicesTab.jsx`
- Full-width service image (or brand-colored fallback)
- Service name + category badge + Live/Archived status
- Price + Duration row
- Action buttons row: Edit (blue), Archive/Activate (gray), Delete (red)
- All buttons use `Button` component from design system

**Sections:**
- Active Services section (with count)
- Archived Services section (collapsible, starts collapsed if empty)

**Delete confirmation:**
- Small inline confirmation instead of `window.confirm()`
- "Are you sure? [Cancel] [Delete]" inline on the card

**Design tokens:**
- All `#A55233` → `brand-500`
- All `hover:bg-[#8e462b]` → `hover:bg-brand-600`
- Focus rings → `focus:ring-brand-500/20`

## Data Flow

```
ArtisanAccountPage
  └─ ServicesTab (profile/tabs)
       ├─ ServiceManagementCard (per service)
       │    ├─ Edit → opens ServiceFormSheet (editing mode)
       │    ├─ Archive/Activate → PATCH /api/services/:id
       │    └─ Delete → inline confirmation → DELETE /api/services/:id
       ├─ "Add Service" button → opens ServiceFormSheet (create mode)
       └─ ServiceFormSheet
            ├─ Form fields + MultiImageUpload
            ├─ Live preview (ServicePreviewCard)
            └─ Save → POST or PATCH /api/services → onSave callback
```

## Backend Changes

None required. The existing service CRUD endpoints already support the `images` array field. The `MultiImageUpload` component uses the same Cloudinary signed upload flow.

## Files Affected

| File | Action |
|------|--------|
| `components/ui/MultiImageUpload.jsx` | Create |
| `components/ui/index.js` | Add MultiImageUpload export |
| `components/profile/ServiceFormSheet.jsx` | Create |
| `components/profile/tabs/ServicesTab.jsx` | Rewrite |
| `components/ImageUpload.jsx` | No changes (still used for profile photos) |
