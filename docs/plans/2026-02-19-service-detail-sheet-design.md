# Service Detail Sheet — Design Document

> Date: 2026-02-19
> Status: Approved

## Problem

When users browse an artisan's services on the profile page, they see truncated cards (1-line name, 2-line description, single cropped image) with only a "Book" button. There's no way to explore a service before committing to the booking flow — no full images, no full description, no social proof (ratings, booking count).

Additionally, reviews currently only exist at the artisan level. Since bookings are per-service, reviews should be queryable per-service too, so each service can show its own rating and booking count.

## Solution

### 1. Service Detail Sheet (Frontend)

Tap any service card → BottomSheet slides up showing full service details.

**Layout (top to bottom):**

```
┌─────────────────────────────────┐
│  ── (drag handle)               │
│  Service Detail            [✕]  │
│─────────────────────────────────│
│                                 │
│  ┌─ ImageCarousel ────────────┐ │
│  │ [img1] [img2] [img3]      │ │
│  │     ● ○ ○                  │ │
│  └────────────────────────────┘ │
│                                 │
│  Bridal Mehndi                  │
│  Mehndi Art · 2h 30m            │
│                                 │
│  ₹2,500                        │
│  ★ 4.7 (12 reviews) · 38 booked│
│                                 │
│  ── About this service ───────  │
│  Full description text without  │
│  any line clamping. Scrollable  │
│  if long.                       │
│                                 │
│  [████ Book This Service ████]  │
└─────────────────────────────────┘
```

**Interaction flow:**
1. Tap service card → ServiceDetailSheet opens (BottomSheet)
2. Swipe images → ImageCarousel handles it
3. Tap "Book This Service" → Sheet closes → existing booking flow starts
4. Tap X or backdrop → Sheet closes

**Components reused:** BottomSheet, ImageCarousel, Button (all existing)

### 2. Per-Service Stats (Backend)

**Review model change:**
Add `service` field (optional ObjectId ref to ArtisanService) to the review schema. When a review is created from a booking that has a service reference, auto-populate the service field.

**New API endpoint:**
`GET /api/services/:serviceId/stats` — returns:
```json
{
  "bookingCount": 38,
  "averageRating": 4.7,
  "reviewCount": 12
}
```

This aggregates from bookings and reviews collections. No denormalization needed initially — the query is simple and these pages aren't high-traffic.

**Artisan-level stats unchanged:** The artisan profile still shows overall averageRating and totalReviews (denormalized on the artisan model). This design adds per-service granularity alongside it.

## Files Changed

| File | Change |
|------|--------|
| **New:** `components/artisan/ServiceDetailSheet.jsx` | BottomSheet with carousel, stats, description, Book CTA |
| **Edit:** `components/artisan/ServicesTab.jsx` | Card tap opens detail sheet, pass artisan data down |
| **Edit:** `pages/ArtisanProfilePage.jsx` | Manage detail sheet state, pass artisan to ServicesTab |
| **Edit:** `models/reviewModel.js` | Add optional `service` field |
| **Edit:** `controllers/reviewController.js` | Auto-populate service from booking when creating review |
| **New:** `controllers/serviceStatsController.js` | Aggregate booking count + review stats per service |
| **Edit:** `routes/serviceRoutes.js` | Add `GET /:serviceId/stats` |

## Decisions

- **BottomSheet** over full-screen: lighter, Swiggy-like quick peek
- **Close-then-open** for booking: no stacked sheets
- **Aggregation** over denormalization: simpler, correct by default, services aren't queried at scale
- **Optional service field on review**: backward compatible with existing reviews that have no service reference
