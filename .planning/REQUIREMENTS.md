# KalaSetu v2 — Requirements

## Categories
- **BUG** — Critical bugs that affect reliability or security
- **STUB** — Half-built features that need completion
- **UI** — User interface and experience improvements
- **FEAT** — New feature development
- **PERF** — Performance optimization

---

## BUG — Critical Bug Fixes

### BUG-01: Booking race condition
- **Priority:** Critical
- **Phase:** 1
- **Files:** `kalasetu-backend/controllers/bookingController.js:66-74`
- **Problem:** Overlapping booking check happens before creation with no transaction lock between check and insert. Two concurrent requests for the same artisan/time slot can both pass the overlap check and create duplicate bookings.
- **Solution:** Wrap the overlap-check + insert in a MongoDB transaction using `session.startTransaction()`. Alternatively, use an atomic `findOneAndUpdate` with a uniqueness constraint on artisan + time slot.
- **Acceptance:** Concurrent booking requests for the same slot result in exactly one booking; the second request receives a 409 Conflict response.

### BUG-02: NotificationContext infinite refresh loop
- **Priority:** Critical
- **Phase:** 1
- **Files:** `kalasetu-frontend/src/context/NotificationContext.jsx:56`
- **Problem:** `useEffect(() => { refresh(); }, [refresh])` — the `refresh` function recreates on every render because it depends on state that changes when it runs, causing an infinite loop of API calls.
- **Solution:** Use `useRef` for a stable callback reference, or use `useCallback` with proper dependency management to prevent the function identity from changing on every render.
- **Acceptance:** NotificationContext makes exactly one initial fetch on mount, then only refetches on explicit triggers (e.g., polling interval, user action). No runaway network requests.

### BUG-03: File upload validation missing
- **Priority:** High
- **Phase:** 1
- **Files:** `kalasetu-backend/routes/uploadRoutes.js`, upload-related controllers
- **Problem:** No file type or size validation before sending to Cloudinary. Malicious files or oversized uploads are sent directly to the cloud service.
- **Solution:** Add multer middleware with file size limits (max 10MB for images, 50MB for videos). Validate MIME types against an allowlist (image/jpeg, image/png, image/webp, video/mp4). Reject disallowed types with 400 response before Cloudinary upload.
- **Acceptance:** Uploads exceeding size limits or with disallowed MIME types are rejected with clear error messages. Valid uploads proceed normally.

### BUG-04: Auth endpoint rate limiting insufficient
- **Priority:** High
- **Phase:** 1
- **Files:** `kalasetu-backend/server.js`, auth route files
- **Problem:** No specific rate limiting on authentication endpoints, making brute-force attacks feasible.
- **Solution:** Add express-rate-limit middleware to auth routes: 20 login attempts per 15 minutes per IP, 5 registration attempts per hour per IP. Return 429 with Retry-After header.
- **Acceptance:** Exceeding rate limits returns 429 responses with appropriate headers. Normal usage is unaffected.

### BUG-05: Empty catch blocks suppress errors
- **Priority:** Medium
- **Phase:** 1
- **Files:** `kalasetu-frontend/src/components/search/AdvancedFilters.jsx:17`, `kalasetu-frontend/src/pages/RegisterPage.jsx:65`, `kalasetu-frontend/src/pages/UserRegisterPage.jsx:70`
- **Problem:** `} catch (_) {}` silently swallows errors with no logging or user feedback.
- **Solution:** Replace empty catches with proper error handling: log to analytics (Sentry/PostHog), show toast notifications for user-facing errors, and use `console.warn` for non-critical paths in development.
- **Acceptance:** No empty catch blocks remain. Errors are logged to analytics and user-facing failures show toast notifications.

---

## STUB — Feature Completion

### STUB-01: Payment refund/dispute workflow
- **Priority:** High
- **Phase:** 2
- **Files:** `kalasetu-backend/controllers/paymentController.js`, new dispute model
- **Problem:** Payment refund endpoints exist as stubs. No actual refund processing or dispute tracking.
- **Solution:** Implement admin-approved refund workflow:
  1. User requests refund via API (reason, evidence)
  2. Create RefundRequest model (status: pending/approved/rejected/processed)
  3. Admin reviews in admin panel (new admin route + UI)
  4. On approval, trigger Razorpay refund API
  5. Update booking and payment status
  6. Notify both parties via email + push notification
- **Acceptance:** Full refund lifecycle works: user requests → admin sees in panel → admin approves/rejects → Razorpay processes refund → both parties notified.

### STUB-02: Support ticket system
- **Priority:** High
- **Phase:** 2
- **Files:** `kalasetu-backend/controllers/userAuthController.js:336-353`, new SupportTicket model
- **Problem:** Help/support endpoints return stub responses. User support requests are silently dropped with no audit trail.
- **Solution:**
  1. Create SupportTicket model (subject, description, category, status, priority, messages array, timestamps)
  2. Wire existing stub endpoints to create real tickets
  3. Add admin notification queue for new tickets
  4. Admin panel UI for ticket management (list, respond, close)
  5. Email notifications to user on ticket updates
- **Acceptance:** Users can create support tickets, receive confirmation, and get email updates. Admins can view, respond to, and close tickets from the admin panel.

### STUB-03: Phone/SMS OTP verification via MSG91
- **Priority:** Medium
- **Phase:** 3
- **Files:** `kalasetu-backend/controllers/artisanProfileController.js:305-310`
- **Problem:** Phone verification endpoints exist but lack SMS provider integration. Phone numbers cannot actually be verified.
- **Solution:**
  1. Integrate MSG91 SDK for Indian phone numbers
  2. Implement OTP generation (6-digit, 5-minute expiry)
  3. Rate limit: max 3 OTP requests per phone per hour
  4. Store OTP hash in Redis (Upstash) with TTL
  5. Verify endpoint compares submitted OTP
  6. Mark phone as verified on artisan/user profile
- **Acceptance:** Users can request OTP, receive SMS within 30 seconds, submit OTP to verify phone. Rate limiting prevents abuse. Verified status visible on profile.

### STUB-04: Video call recording via Daily.co
- **Priority:** Medium
- **Phase:** 3
- **Files:** `kalasetu-backend/controllers/videoController.js`, `kalasetu-backend/controllers/jobHandlers.js:74`
- **Problem:** Video call functionality works but recording is not implemented. The TODO marker in jobHandlers indicates unfinished VideoCall model integration.
- **Solution:**
  1. Enable Daily.co cloud recording via API (start/stop recording endpoints)
  2. Create/complete VideoCall model (participants, duration, recordingUrl, status)
  3. Webhook handler for recording completion
  4. Upload completed recordings to Cloudinary (or store Daily.co URL)
  5. Link recordings to bookings
  6. UI to access past recordings from booking detail page
- **Acceptance:** Video calls can be recorded. Recordings are accessible from the booking detail page. Both parties can replay recordings.

---

## UI — User Interface & Experience

### UI-01: Homepage improvements
- **Priority:** High
- **Phase:** 4
- **Files:** `kalasetu-frontend/src/pages/HomePage.jsx` (or create), related components
- **Description:** Current homepage needs enhancement to properly showcase the marketplace.
- **Requirements:**
  1. Hero section with value proposition and CTA
  2. Featured artisans carousel (top-rated, recently active)
  3. Category cards grid (link to search with category filter)
  4. "How it works" section (3-4 steps with icons)
  5. Testimonials section (real reviews from database)
  6. Responsive design, brand colors, smooth animations
- **Acceptance:** Homepage loads with all sections populated. Category cards link to filtered search. Featured artisans are dynamically fetched. Mobile-responsive.

### UI-02: Dark mode completion
- **Priority:** Medium
- **Phase:** 5
- **Files:** `kalasetu-frontend/src/context/ThemeContext.jsx` (if exists), Tailwind config, all component files
- **Description:** Implement full dark mode support across the application.
- **Requirements:**
  1. ThemeContext with system preference detection and manual toggle
  2. Tailwind `dark:` variant classes on all components
  3. Persistent theme preference in localStorage
  4. Smooth transition between modes
  5. Dark variants for brand colors, cards, modals, forms, tables
  6. Toggle in header/settings
- **Acceptance:** All pages render correctly in both light and dark mode. Theme persists across sessions. No readability issues in either mode.

### UI-03: i18n Hindi + English
- **Priority:** Medium
- **Phase:** 5
- **Files:** `kalasetu-frontend/src/` (i18next config if initialized), new translation files
- **Description:** Add full Hindi and English internationalization.
- **Requirements:**
  1. Configure i18next with React (if not already done)
  2. Extract all user-facing strings into translation keys
  3. Create `en.json` and `hi.json` translation files
  4. Language switcher in header/settings
  5. Persist language preference
  6. RTL not needed (Hindi is LTR)
  7. Date/number formatting per locale
- **Acceptance:** All UI text renders in selected language. Language switcher works. Preference persists. No hardcoded English strings remain in components.

### UI-04: Better empty states and error feedback
- **Priority:** Medium
- **Phase:** 4
- **Files:** Various pages and components across frontend
- **Description:** Replace generic or missing empty states with informative, branded components.
- **Requirements:**
  1. Audit all list/table views for empty state handling
  2. Create contextual empty state illustrations/messages (no bookings yet, no reviews, no messages, etc.)
  3. Add actionable CTAs in empty states (e.g., "Browse artisans" on empty bookings)
  4. Consistent error feedback with toast notifications
  5. Use existing EmptyState component from `components/ui`
- **Acceptance:** Every list/table view has a meaningful empty state with CTA. Errors show toast notifications with retry options where applicable.

### UI-05: Orphaned code cleanup
- **Priority:** Low
- **Phase:** 4
- **Files:** `kalasetu-frontend/src/components/profile/tabs/USERsTab.jsx`, any dead imports
- **Description:** Remove dead code identified during codebase analysis.
- **Requirements:**
  1. Delete `USERsTab.jsx` (confirmed orphaned, replaced by `MyClientsTab.jsx`)
  2. Scan for and remove dead imports across the codebase
  3. Remove any unused component files
  4. Verify no references break after cleanup
- **Acceptance:** No orphaned files remain. Build succeeds. No import errors.

---

## FEAT — New Features

### FEAT-01: Artisan availability calendar
- **Priority:** High
- **Phase:** 6
- **Files:** New frontend component, new backend endpoints, Booking model updates
- **Description:** Visual calendar showing artisan free/busy slots integrated with the booking system.
- **Requirements:**
  1. Backend: Availability model or extend Artisan schema (recurring weekly schedule + date overrides)
  2. Backend: API endpoints to set/get availability, check slot openness
  3. Frontend: Calendar component (week/month view) showing available slots
  4. Frontend: Slot selection integrates with booking flow
  5. Artisan dashboard: Manage availability (set working hours, block dates)
  6. Conflict detection with existing bookings
- **Acceptance:** Artisans can set weekly availability and block specific dates. Users see visual calendar with available slots. Booking a slot updates availability. No double-booking possible.

### FEAT-02: Review response system
- **Priority:** Medium
- **Phase:** 6
- **Files:** Review model, `kalasetu-backend/controllers/reviewController.js`, frontend review components
- **Description:** Allow artisans to respond to customer reviews.
- **Requirements:**
  1. Extend Review model with `artisanResponse` field (text, timestamp)
  2. API endpoint: artisan can add one response per review (no editing after 48h)
  3. Frontend: Response form on artisan's review management page
  4. Frontend: Display responses below reviews on artisan profile
  5. Notification to user when artisan responds to their review
- **Acceptance:** Artisans can respond to reviews. Responses display publicly. Users get notified. One response per review enforced.

### FEAT-03: Artisan analytics dashboard
- **Priority:** Medium
- **Phase:** 7
- **Files:** New backend analytics endpoints, new frontend dashboard component
- **Description:** Dashboard showing artisans their business metrics and trends.
- **Requirements:**
  1. Backend aggregation queries for: profile views, booking count/revenue (daily/weekly/monthly), popular services, review ratings over time, conversion rate (views → bookings)
  2. Frontend dashboard with charts (use lightweight chart library, e.g., Recharts)
  3. Date range selector (7d, 30d, 90d, custom)
  4. Key metrics cards at top (total revenue, avg rating, total bookings, profile views)
  5. Export data as CSV (optional)
- **Acceptance:** Artisans see accurate metrics on their dashboard. Charts render correctly. Data matches actual bookings/reviews. Date range filtering works.

### FEAT-04: Service packages/bundles
- **Priority:** Medium
- **Phase:** 7
- **Files:** Artisan model (services schema), booking flow, frontend components
- **Description:** Artisans can create bundled service packages at a discounted price.
- **Requirements:**
  1. Extend Artisan services schema with package type (individual or bundle)
  2. Bundle definition: name, included services, bundle price, savings display
  3. Frontend: Package creation UI in artisan dashboard
  4. Frontend: Package display on artisan profile (show savings)
  5. Booking flow supports selecting a package
  6. Payment calculates bundle price correctly
- **Acceptance:** Artisans can create service bundles. Bundles display with savings. Users can book bundles. Payment amount reflects bundle pricing.

---

## PERF — Performance Optimization

### PERF-01: Frontend bundle code splitting
- **Priority:** High
- **Phase:** 8
- **Files:** `kalasetu-frontend/src/App.jsx`, route definitions, Vite config
- **Problem:** Vendor-stream chunk is 1.4MB, index chunk is 1.6MB. All code loads upfront.
- **Solution:**
  1. `React.lazy()` + `Suspense` for route-level code splitting
  2. Lazy load heavy modules: video call (Daily.co), chat (Stream), admin panel, Algolia search
  3. Vite `manualChunks` config to split vendor bundles
  4. Preload critical routes, lazy load secondary routes
- **Acceptance:** Initial bundle under 500KB. Video/chat/admin load on demand. Lighthouse performance score improves. No visible loading regressions.

### PERF-02: Email queuing via QStash
- **Priority:** Medium
- **Phase:** 8
- **Files:** `kalasetu-backend/utils/email.js`, QStash integration
- **Problem:** Emails sent synchronously during registration and booking, adding latency to API responses.
- **Solution:**
  1. Create email queue endpoint that QStash calls
  2. Replace direct email sends with QStash publish calls
  3. QStash handles retries on failure
  4. Keep synchronous email as fallback if QStash unavailable
- **Acceptance:** Registration and booking API responses are faster (no email wait). Emails still delivered reliably via QStash queue. Fallback works if QStash is down.

### PERF-03: MongoDB connection pool tuning
- **Priority:** Low
- **Phase:** 8
- **Files:** `kalasetu-backend/config/db.js`
- **Problem:** Default MongoDB connection pool size (10) may be insufficient under load.
- **Solution:**
  1. Increase `maxPoolSize` to 20-30 in Mongoose connection options
  2. Add `minPoolSize: 5` for warm connections
  3. Set `serverSelectionTimeoutMS` and `socketTimeoutMS` appropriately
  4. Add connection pool monitoring in production
- **Acceptance:** Connection pool configured with appropriate sizes. No connection timeout errors under normal load.

### PERF-04: Admin dashboard query optimization
- **Priority:** Low
- **Phase:** 8
- **Files:** `kalasetu-backend/controllers/adminDashboardController.js`
- **Problem:** Some admin dashboard queries may still have suboptimal patterns despite previous fixes.
- **Solution:**
  1. Audit remaining dashboard queries for N+1 patterns
  2. Replace any remaining sequential queries with aggregation pipelines
  3. Add MongoDB indexes for commonly filtered/sorted fields
  4. Consider Redis caching for dashboard stats (5-minute TTL)
- **Acceptance:** Admin dashboard loads within 2 seconds. No N+1 query patterns. Database indexes cover common queries.

---

## Requirement Coverage Matrix

| REQ ID | Phase | Category | Priority |
|--------|-------|----------|----------|
| BUG-01 | 1 | Bug | Critical |
| BUG-02 | 1 | Bug | Critical |
| BUG-03 | 1 | Bug | High |
| BUG-04 | 1 | Bug | High |
| BUG-05 | 1 | Bug | Medium |
| STUB-01 | 2 | Stub | High |
| STUB-02 | 2 | Stub | High |
| STUB-03 | 3 | Stub | Medium |
| STUB-04 | 3 | Stub | Medium |
| UI-01 | 4 | UI | High |
| UI-02 | 5 | UI | Medium |
| UI-03 | 5 | UI | Medium |
| UI-04 | 4 | UI | Medium |
| UI-05 | 4 | UI | Low |
| FEAT-01 | 6 | Feature | High |
| FEAT-02 | 6 | Feature | Medium |
| FEAT-03 | 7 | Feature | Medium |
| FEAT-04 | 7 | Feature | Medium |
| PERF-01 | 8 | Performance | High |
| PERF-02 | 8 | Performance | Medium |
| PERF-03 | 8 | Performance | Low |
| PERF-04 | 8 | Performance | Low |
