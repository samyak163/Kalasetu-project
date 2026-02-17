# KalaSetu -- Core Features

Comprehensive inventory of all implemented features in the KalaSetu artisan marketplace, organized by domain.

---

## 1. Authentication and Identity

| Feature | Description | Status |
|---------|-------------|--------|
| Artisan registration | Email-based artisan account creation (`/api/auth/register`) | Implemented |
| Artisan login | Email/password auth, JWT in HTTP-only cookie (`ks_auth`) | Implemented |
| User registration | Separate customer account creation (`/api/users/register`) | Implemented |
| User login | Customer auth with dedicated JWT cookie | Implemented |
| Admin login | Standalone admin auth with `admin_token` cookie (`/api/admin/auth/login`) | Implemented |
| Firebase social login | Artisan auth via Firebase (Google, social providers) | Implemented |
| OTP verification | Email-based one-time password for registration/login (`/api/otp`) | Implemented |
| reCAPTCHA verification | Server-side Google reCAPTCHA v3 bot protection | Implemented |
| Forgot password (Artisan) | Password reset with email-based token | Implemented |
| Forgot password (User) | Password reset with email-based token | Implemented |
| Password change | Authenticated users and admins can change passwords | Implemented |
| Rate limiting | Per-IP rate limiters on login, registration, and OTP endpoints | Implemented |
| Dual-auth middleware | `protectAny` authenticates either user type, sets `req.accountType` | Implemented |

---

## 2. Artisan Features

| Feature | Description | Status |
|---------|-------------|--------|
| Profile management | Bio, skills, location, contact details (`/api/artisan/profile`) | Implemented |
| Profile photo upload | Cloudinary-backed image upload with cache invalidation | Implemented |
| Custom profile slug | Vanity URL slug for public profile | Implemented |
| Document upload | Identity/business docs (Aadhar, PAN, etc.) to Cloudinary | Implemented |
| Verification status | Identity and document verification tracking | Implemented |
| Bank details | Bank account details for payouts | Implemented |
| Email/phone verification | Re-verification flows for both email and phone | Implemented |
| Service management | CRUD for artisan services with public listing | Implemented |
| Availability scheduling | Define availability windows with get/upsert operations | Implemented |
| Portfolio management | Projects with multi-image support, cover image, reordering | Implemented |
| Dashboard statistics | Aggregated booking and earnings data (`/api/artisan/dashboard/stats`) | Implemented |
| Customer list | View customers with per-customer booking stats | Implemented |
| Booking management | View, accept, reject, and complete bookings | Implemented |
| Earnings tracking | Payment earnings and financial summary | Implemented |

---

## 3. Customer Features

| Feature | Description | Status |
|---------|-------------|--------|
| Browse artisans | Paginated listing with Redis caching (`/api/artisans`) | Implemented |
| View artisan profile | Fetch by MongoDB ID, public ID, or custom slug | Implemented |
| Nearby artisans | Geospatial search using MongoDB 2dsphere indexes | Implemented |
| Search artisans | Algolia InstantSearch with faceted filtering and suggestions | Implemented |
| Bookmark artisans | Add, remove, and list bookmarked artisans | Implemented |
| View public portfolio | Browse artisan portfolio projects without auth | Implemented |
| View artisan services | List services offered by a specific artisan | Implemented |
| Profile management | Update customer profile information | Implemented |
| Order history | View past and current orders with statuses | Implemented |
| Rating history | View submitted reviews and ratings | Implemented |

---

## 4. Marketplace

### Bookings

| Feature | Description | Status |
|---------|-------------|--------|
| Create booking | Book artisan services with date and details | Implemented |
| View bookings | Both customers and artisans can view their bookings | Implemented |
| Respond to booking | Artisans accept or reject booking requests | Implemented |
| Complete booking | Artisans mark bookings as completed | Implemented |
| Cancel booking | Either party can cancel via `protectAny` middleware | Implemented |

### Payments

| Feature | Description | Status |
|---------|-------------|--------|
| Create payment order | Generate Razorpay order linked to booking | Implemented |
| Verify payment | Server-side Razorpay signature verification | Implemented |
| Payment history | List all payments for authenticated user | Implemented |
| Razorpay webhooks | Automated status updates via webhook with signature verification | Implemented |

### Refunds

| Feature | Description | Status |
|---------|-------------|--------|
| Request refund | Users request refund for completed payment | Implemented |
| View refund requests | List refund requests and view details | Implemented |

### Reviews

| Feature | Description | Status |
|---------|-------------|--------|
| Create review | Rating and written review after service | Implemented |
| View artisan reviews | Public listing of all reviews for an artisan | Implemented |
| Toggle helpful | Mark a review as helpful (toggle) | Implemented |

### Categories

| Feature | Description | Status |
|---------|-------------|--------|
| List categories | All artisan service categories | Implemented |
| Category services | Services within a specific category | Implemented |
| Service suggestions | Aggregated service name suggestions | Implemented |

---

## 5. Communication

| Feature | Description | Status |
|---------|-------------|--------|
| Chat tokens | Stream Chat auth token generation | Implemented |
| Direct messaging | One-to-one DM channels between customers and artisans | Implemented |
| Channel management | List channels, add/remove members | Implemented |
| Video rooms | Daily.co video call room creation and management | Implemented |
| Video tokens | Meeting token generation for authenticated participants | Implemented |
| Call history | Create, update, and list call records with duration/status | Implemented |
| Push notifications | Targeted push via OneSignal (individual, group, broadcast) | Implemented |
| Notification history | Past notifications, mark as read, cancel | Implemented |
| Email notifications | Transactional emails via Resend with React Email templates | Implemented |
| Contact form | Public contact form for unauthenticated visitors | Implemented |

---

## 6. Support

| Feature | Description | Status |
|---------|-------------|--------|
| Create support ticket | Any authenticated user can open a ticket | Implemented |
| View tickets | List own tickets and view details with message thread | Implemented |
| Add ticket message | Append follow-up messages to existing tickets | Implemented |

---

## 7. Admin and Platform

### Dashboard and Settings

| Feature | Description | Status |
|---------|-------------|--------|
| Dashboard statistics | Platform-wide stats (users, artisans, bookings, revenue) | Implemented |
| Admin profile management | Profile updates and password changes | Implemented |
| Permission-based access | Route-level permission checks via `checkPermission` | Implemented |
| Platform settings | View and update platform-wide configuration | Implemented |

### Artisan Administration

| Feature | Description | Status |
|---------|-------------|--------|
| List all artisans | Paginated list with filtering | Implemented |
| Verify artisan | Approve identity and document verification | Implemented |
| Update artisan status | Suspend or reactivate accounts | Implemented |
| Delete artisan | Permanently remove artisan and associated data | Implemented |

### Content Moderation

| Feature | Description | Status |
|---------|-------------|--------|
| Review moderation | List, flag, hide, delete, restore reviews | Implemented |
| Review statistics | Aggregate metrics (count, average, distribution) | Implemented |

### Financial Administration

| Feature | Description | Status |
|---------|-------------|--------|
| Payment listing | Platform-wide payment listing with filtering | Implemented |
| Payment statistics | Revenue and payment aggregate metrics | Implemented |
| Process refund | Admin-initiated refund processing | Implemented |
| Refund management | Approve/reject user-submitted refund requests | Implemented |

### Booking and Support Administration

| Feature | Description | Status |
|---------|-------------|--------|
| Booking management | Platform-wide listing, stats, admin cancellation | Implemented |
| Support tickets | List all tickets, respond, update status | Implemented |
| Ticket statistics | Open, resolved, response time metrics | Implemented |

---

## 8. Platform Infrastructure

| Feature | Description | Status |
|---------|-------------|--------|
| Image uploads | Signed Cloudinary uploads for profiles, portfolios, services, docs | Implemented |
| SEO meta tags | Dynamic server-rendered metadata for artisan profiles | Implemented |
| Sitemap generation | Dynamic XML sitemap for search engine indexing | Implemented |
| Background jobs | QStash webhook-driven processing for cleanup and reports | Implemented |
| Redis caching | Response caching with per-route TTL via Upstash Redis | Implemented |
| Algolia indexing | Server-side index sync for artisan search | Implemented |
| PostHog analytics | Server-side event tracking and API usage monitoring | Implemented |
| Sentry error tracking | Automated error capture and reporting | Implemented |
| LogRocket | Frontend session replay and error monitoring | Implemented |
| Environment validation | Startup-time validation of required env vars | Implemented |
| Centralized error handling | Unified error response formatting | Implemented |
| Request validation | Zod schema-based request validation | Implemented |

---

*Last updated: 2026-02-16*
