# KalaSetu — Phase 1 Demo: Changes & Improvements

**Date:** 18 February 2026
**Project:** KalaSetu — Artisan Marketplace Platform
**Team:** PBL Group

---

## What is KalaSetu?

KalaSetu is a full-stack web application that connects traditional Indian artisans (potters, weavers, jewelers, woodworkers, etc.) with customers who want to discover, book, and pay for artisan services. The platform includes:

- **Customer side:** Browse artisans, search/filter by category, book services, make payments, leave reviews, and chat with artisans.
- **Artisan side:** Create a profile, list services, manage bookings, receive payments, and communicate with customers.
- **Admin panel:** Monitor users, artisans, bookings, payments, and analytics.

---

## Changes Made for Phase 1 Demo

### 1. Button & Color Consistency Across User Dashboard

| Before | After |
|--------|-------|
| Different buttons had different colors — some amber/yellow, some plain borders, some hardcoded hex values | All action buttons now use a consistent brand orange (`#A55233`) with white text |
| "Request Refund" button was amber/yellow, didn't match other buttons | Matches the "Rate & Review" button style exactly |

**Pages fixed:**
- Order History tab (Request Refund button)
- User Dashboard Home (Find Artisans, Browse links)
- User Bookings page (status tabs, search bar, links)
- Search Results page (booking modal buttons)

---

### 2. Admin Analytics Dashboard — Fixed Crash

| Before | After |
|--------|-------|
| Admin analytics page crashed with a white screen error when opened | Fully functional — shows booking stats, user growth, revenue breakdown |

**Root cause:** The backend API returned data in a different format than the frontend expected. Four separate data shape mismatches were identified and fixed:
- Booking status breakdown (object vs array)
- Monthly user growth (nested objects vs flat array)
- New users this month (object vs number)
- Revenue by category (field name mismatch)

---

### 3. Category Browse — Emoji Replaced with Real Images

| Before | After |
|--------|-------|
| Category cards showed emoji icons (🏺🧵💍🪵🎨) | Beautiful Unsplash photographs of actual artisan work |
| Cards had plain white backgrounds | Cards now have images with dark overlay and white text, hover zoom effect |

**12 categories with real images:**
Pottery, Weaving, Jewelry Making, Woodwork, Painting, Block Printing, Textile Design, Metalwork, Stone Carving, Embroidery, Leather Craft, Glass Art

---

### 4. Nearby Artisans Section — Redesigned Cards

| Before | After |
|--------|-------|
| Basic horizontal layout cards | Vertical image-header cards matching the Featured Artisans design |
| No profile images shown | Profile images with hover zoom, or branded initials fallback |
| Missing verification badges | Green checkmark badge for verified artisans |
| No fallback when location API fails | Graceful fallback to general artisan list |

---

### 5. Featured Artisans — Fixed Empty State

| Before | After |
|--------|-------|
| Section was completely empty (showed nothing) | Shows up to 8 artisans from the database |
| No fallback when featured endpoint returned empty | Falls back to general artisan list automatically |

---

### 6. Search & Filter Improvements

| Before | After |
|--------|-------|
| Category dropdown showed "nothing to select" — was empty | All 12 categories load correctly |
| No way to filter by specific service | New "Service" dropdown appears after selecting a category, showing relevant services |
| Duplicate filter controls (rating shown twice, location filters duplicated) | Removed duplicate Advanced Filters section; clean sidebar with Category → Service → Rating |

---

### 7. Chat System — Auto-Open Conversations

| Before | After |
|--------|-------|
| Clicking "Chat" on artisan profile opened a blank messages page | Chat automatically creates and opens the conversation with that artisan |
| User had to manually find the conversation | Conversation opens instantly with "Opening conversation..." loading state |
| Channel showed "Unnamed Channel" | Shows the other person's actual name |
| Broken profile pictures (empty circles) | Shows artisan's Cloudinary profile photo, or branded initials circle as fallback |
| Message input box not visible | WhatsApp-style message input auto-focused and ready to type |
| Artisan couldn't see profile pictures of customers | Fixed — backend now sends correct image field for both artisan and user profiles |

---

### 8. Database Cleanup

| Before | After |
|--------|-------|
| Test payment of Rs. 8,50,000 showing in analytics | Removed — analytics now shows real data only |

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v7 |
| **Backend** | Node.js, Express.js, MongoDB with Mongoose |
| **Authentication** | JWT in HTTP-only cookies (dual auth: artisan + customer) |
| **Image Storage** | Cloudinary (signed uploads) |
| **Search** | Algolia InstantSearch |
| **Real-time Chat** | Stream Chat |
| **Video Calls** | Daily.co |
| **Payments** | Razorpay |
| **Push Notifications** | OneSignal |

---

## Test Suite

| Suite | Tests | Passed | Status |
|-------|-------|--------|--------|
| Backend (Jest) | 201 | 201 | All passing |
| Frontend (Vitest) | 33 | 33 | All passing |
| **Total** | **234** | **234** | **All passing** |

---

## Files Modified in This Phase

| # | File | What Changed |
|---|------|-------------|
| 1 | `OrderHistoryTab.jsx` | Refund button color consistency |
| 2 | `UserDashboardHome.jsx` | Dashboard button/link colors |
| 3 | `UserBookings.jsx` | Booking page button/link colors |
| 4 | `SearchResults.jsx` | Category filter fix, service filter, removed duplicate filters, modal colors |
| 5 | `AdminAnalytics.jsx` | Fixed 4 data shape mismatches causing crash |
| 6 | `CategoryBrowse.jsx` | Replaced 12 emoji with Unsplash images |
| 7 | `NearbyArtisans.jsx` | Complete card redesign + data loading fix |
| 8 | `FeaturedArtisans.jsx` | Added fallback when featured list is empty |
| 9 | `MessagesPage.jsx` | Auto-open DM, show member names/avatars, message input |
| 10 | `streamChat.js` (backend) | Fixed artisan profile image field name |

---

## How to Run

```bash
# Backend (port 5000)
cd kalasetu-backend
npm run dev

# Frontend (port 5173)
cd kalasetu-frontend
npm run dev
```

**Demo accounts:**
- Customer: `showcase.user@kalasetu.com` / `Demo@1234`
- Artisan: `showcase.artisan@demo.kalasetu.com` / `Demo@1234`
- Admin: `showcase.admin@kalasetu.com` / `SuperAdmin@123`

---

## Summary

Phase 1 focused on **stability, consistency, and real-world polish** — making sure every user-facing feature works correctly, looks professional, and handles edge cases gracefully. All 234 automated tests pass, the admin dashboard is functional, the chat system works end-to-end, and the visual design is consistent across all pages.
