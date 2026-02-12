# KalaSetu v2 — Project Definition

## Core Value
Connecting traditional Indian artisans with customers through a trusted digital marketplace, enabling discovery, booking, communication, and payment in one platform.

## Project Type
Brownfield — improving and extending an existing live application.

## Validated Requirements (Working Features)
These features are implemented and functional:

| Area | Status | Notes |
|------|--------|-------|
| Artisan authentication (JWT/cookie) | Working | `ks_auth` HTTP-only cookie |
| User/customer authentication | Working | Separate auth flow, same cookie mechanism |
| Admin authentication | Working | `admin_token` cookie, separate middleware |
| Artisan profiles (CRUD, Cloudinary images) | Working | Profile editor, gallery, services |
| Search (Algolia InstantSearch) | Working | Full-text + faceted search |
| Bookings (create, manage, status) | Working | Race condition bug exists (BUG-01) |
| Payments (Razorpay integration) | Working | Refund flow is stub (STUB-01) |
| Real-time chat (Stream Chat) | Working | 1:1 artisan-user messaging |
| Video calls (Daily.co) | Working | Recording is stub (STUB-04) |
| Reviews (create, display) | Working | Artisan response not implemented (FEAT-02) |
| Admin panel (dashboard, CRUD) | Working | Brand-colored, N+1 queries fixed |
| Push notifications (OneSignal) | Working | Infinite loop bug exists (BUG-02) |
| SEO (meta tags, sitemap) | Working | Dynamic per-page SEO |
| PWA support | Working | Vite PWA plugin configured |

## Active Requirements (This Milestone)
See `REQUIREMENTS.md` for full details. Summary:

- **5 Critical Bugs** — Race condition, notification loop, upload validation, rate limiting, empty catches
- **4 Stub Completions** — Refund workflow, support tickets, SMS OTP, video recording
- **5 UI/UX Items** — Homepage, dark mode, i18n, empty states, orphan cleanup
- **4 New Features** — Availability calendar, review responses, analytics dashboard, service packages
- **4 Performance Items** — Code splitting, email queuing, connection pool, query optimization

**Total: 22 requirements across 8 phases**

## Constraints

| Constraint | Rationale |
|-----------|-----------|
| React + Express + MongoDB stack | Existing codebase; no framework migration |
| MSG91 for SMS/OTP | India-focused marketplace; cheaper for Indian numbers |
| Admin-approved refunds | Marketplace trust; prevents refund abuse |
| Hindi + English i18n | Two most common Indian languages; extensible later |
| Cloudinary for media | Existing integration; signed uploads |
| Razorpay for payments | Indian payment gateway; already integrated |
| Brand color `#A55233` | Established visual identity with `brand-50`–`brand-900` tokens |

## Tech Stack Summary
- **Frontend:** React 19, Vite 7, Tailwind CSS 3, React Router 7, Jotai
- **Backend:** Node.js 18+, Express 4, Mongoose 8, ES modules
- **Database:** MongoDB (Atlas)
- **Services:** Algolia, Stream Chat, Daily.co, Razorpay, Cloudinary, OneSignal, QStash, Upstash Redis
- **Analytics:** PostHog, Sentry, LogRocket

## Team
Single developer with Claude Code assistance.

## Milestone History
| Version | Name | Status |
|---------|------|--------|
| v1 | Initial overhaul (16-task bug fix + accessibility) | Completed |
| v2 | Full feature milestone (this document) | In Progress |
