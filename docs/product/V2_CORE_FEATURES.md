# KalaSetu V2 — Core Features Deep Plan

> **Status:** Planning
> **Last Updated:** 2026-02-16
> **Starting Version:** 1.0.0
> **Used by:** `/daily` skill for session planning

---

## How to Read This Document

Each feature includes:
- **What:** The feature itself
- **Why:** The problem it solves, from whose perspective
- **Gap:** What exists today vs what's missing
- **Depth:** Implementation notes (not just "add X" — the actual thinking)

Versions are ordered by dependency and impact:
- **1.0.0** — V1 Fixes & Missing Essentials (ship what should already exist)
- **1.1.0** — Revenue & Marketplace Maturity (make money, build trust)
- **1.2.0** — Experience & Engagement (make users stay and come back)
- **1.3.0** — Growth & Reach (scale to more users, more languages, mobile)
- **2.0.0** — Platform Evolution (architecture, testing, developer experience)

---

## V2 1.0.0 — Fixes & Missing Essentials

These aren't new features. These are things that should exist in V1 but don't — gaps that users will hit immediately.

### 1.0.0-A: Booking Flow Fixes

#### A1. Link Payment to Booking Confirmation
- **Why (Customer):** Right now, booking and payment are disconnected. A customer books, then has to separately find where to pay. There's no "Pay Now" button on the booking confirmation.
- **Gap:** BookingsTab shows bookings, PaymentButton exists, but there's no flow from "Booking Confirmed" → "Pay Now" → "Payment Success" → "Booking Paid". The user is left guessing.
- **Depth:** After artisan accepts a booking, the booking status should change to `confirmed` AND the customer should see a prominent "Pay Now" CTA. The payment should be pre-filled with the booking amount, service name, and artisan. After payment, the booking status should update to `paid`. This is a single flow, not two separate actions.

#### A2. User-Side Booking Cancellation
- **Why (Customer):** Customers can't cancel bookings from the frontend. Only artisans can cancel. This is asymmetric and frustrating.
- **Gap:** Backend supports cancellation via `protectAny`, but the frontend OrderHistoryTab has no "Cancel" button for users. Only artisans see cancel in BookingsTab.
- **Depth:** Add cancel button to OrderHistoryTab for bookings in `pending` or `confirmed` status. Show cancellation policy before confirming. If payment was made, auto-create a refund request. If booking was `pending` (not yet accepted), cancel immediately without refund flow.

#### A3. Booking Modification (Date/Time Change)
- **Why (Customer + Artisan):** Plans change. Right now the only option is cancel and rebook. That's a terrible experience — they lose the chat channel, payment, everything.
- **Gap:** No modify endpoint exists. No UI for it.
- **Depth:** Add `PATCH /api/bookings/:id` with `proposedStart` and `proposedEnd`. Original booking stays active until the other party accepts the modification. Show modification request in both dashboards. If rejected, original booking stands. Don't create a new payment — reuse existing.

#### A4. Review Prompt After Booking Completion
- **Why (Customer):** Users forget to review. There's no nudge after a booking is marked complete.
- **Gap:** OrderHistoryTab shows completed bookings but no "Leave Review" CTA. Users must navigate to a separate RatingsTab. Most won't.
- **Depth:** When a booking moves to `completed`, show an in-app notification with "How was your experience with [artisan]?" linking directly to a review form. After 24 hours, send a push notification. After 72 hours, send an email. The review form should be pre-filled with the booking details (service, date, artisan) so the user just rates and writes.

#### A5. "Add to Calendar" After Booking
- **Why (Customer + Artisan):** After booking, neither party has an easy way to add it to their calendar.
- **Gap:** No calendar integration exists.
- **Depth:** Generate an `.ics` file download link and a "Add to Google Calendar" link on the booking confirmation page. Include service name, artisan name, date/time, and any notes. This is a simple URL construction — no API needed.

### 1.0.0-B: Artisan Availability System

#### B1. Weekly Schedule Management
- **Why (Artisan):** The Availability model exists in the backend but has no controller, no routes, no UI. Artisans can't set their working hours.
- **Gap:** `availabilityModel.js` defines `weeklySchedule` and `blockedDates` but nothing reads or writes to it. Bookings don't check availability.
- **Depth:** Build a full availability system:
  - UI: Weekly grid where artisans set hours for each day (Mon-Sun). "I work 9am-6pm on weekdays, 10am-2pm on Saturday, closed Sunday."
  - UI: Calendar view to block specific dates (vacation, festivals).
  - Backend: `GET/PUT /api/artisan/availability` endpoints.
  - Integration: Booking creation checks availability before allowing. If artisan is unavailable, show "Not available on this date" instead of creating a booking that gets rejected.

#### B2. Buffer Time Between Bookings
- **Why (Artisan):** An artisan who does 1-hour pottery sessions needs 30 minutes between sessions to clean up and prepare. Without buffer time, back-to-back bookings are exhausting.
- **Gap:** No concept of buffer time exists.
- **Depth:** Add `bufferMinutes` field to availability settings. When checking if a time slot is free, account for buffer before and after existing bookings. Show this in the booking calendar as "unavailable" without explanation (don't expose the artisan's internal schedule).

#### B3. Maximum Bookings Per Day
- **Why (Artisan):** Some artisans can only handle 3 clients per day. Without a limit, they get overwhelmed and start rejecting bookings manually, which hurts their response rate.
- **Gap:** No limit exists. Unlimited bookings can be created for any date.
- **Depth:** Add `maxBookingsPerDay` to availability settings. Check count of active bookings for the requested date before allowing new ones. If limit reached, show "Fully booked on this date" to the customer.

### 1.0.0-C: Communication Improvements

#### C1. Booking-Attached Chat Context
- **Why (Both):** When a customer chats with an artisan, there's no context about WHICH booking they're discussing. If a customer has booked twice, the conversation is confusing.
- **Gap:** Chat channels are created on booking confirmation, but there's no booking reference visible in the chat UI. The channel has a `bookingId` in metadata, but the frontend doesn't display it.
- **Depth:** In the chat interface, show a pinned header: "Booking: [Service Name] on [Date] — Status: [Confirmed/Paid]". Link to the booking details. When a new message is sent from the booking page, pre-populate the channel with booking context. This turns generic chat into booking-specific communication.

#### C2. Automated Status Messages in Chat
- **Why (Both):** When a booking status changes (accepted, paid, completed, cancelled), neither party gets a message in their chat thread. They have to check the dashboard.
- **Gap:** Status changes happen in the backend but don't trigger chat messages.
- **Depth:** When booking status changes, send an automated message in the booking's chat channel: "Booking confirmed by [artisan]", "Payment of ₹[amount] received", "Service marked as completed". Use Stream Chat's system messages so they look different from regular messages.

#### C3. Quick Reply Templates for Artisans
- **Why (Artisan):** Artisans get the same questions repeatedly: "What's your availability?", "Do you travel to [location]?", "How much for [service]?". Typing the same answers wastes time.
- **Gap:** No template system exists.
- **Depth:** Let artisans create up to 10 quick reply templates in their settings. In the chat interface, show a "Quick Replies" button that opens a list of saved templates. Tapping one inserts the text (editable before sending). Templates are stored in the artisan's profile document, not in Stream Chat.

### 1.0.0-D: Admin Panel Gaps

#### D1. Audit Log Viewer
- **Why (Admin):** The backend already tracks admin actions in `activityLog` (verify artisan, moderate review, approve refund, etc.), but there's no UI to view them. If something goes wrong, admins can't trace who did what.
- **Gap:** `Admin.logActivity()` is called in 11+ controller actions. The data exists in MongoDB. But there's no `/admin/audit-log` page.
- **Depth:** New admin page showing a filterable, searchable log of all admin actions. Columns: timestamp, admin name, action type, target (artisan/user/review/payment), details. Filter by admin, action type, date range. This is read-only — just a viewer for existing data.

#### D2. Admin User Management
- **Why (Admin):** Super admins can't create new admin accounts or manage permissions from the UI. The only way to create an admin is via the `npm run create:admin` CLI script.
- **Gap:** No `/admin/team` or `/admin/admins` page exists. No endpoints for admin CRUD.
- **Depth:** Add `GET/POST/PUT/DELETE /api/admin/admins` endpoints (super_admin only). Frontend page showing all admin accounts with role, permissions, last login, activity count. Super admin can create new admins, edit roles/permissions, deactivate accounts. This is critical when the team grows beyond one person.

#### D3. Bulk Operations
- **Why (Admin):** When 50 artisans register in a week, verifying them one by one is painful. When 20 reviews get flagged, moderating them individually is slow.
- **Gap:** Every admin action is one-at-a-time. No multi-select, no batch actions.
- **Depth:** Add checkboxes to all admin tables. Selected items get a batch action bar: "Verify All", "Suspend All", "Approve All Refunds", "Delete Selected Reviews". Backend needs batch endpoints: `POST /api/admin/artisans/bulk-verify`, `POST /api/admin/reviews/bulk-moderate`, etc. Limit batch size to 50 to prevent timeouts.

#### D4. Content Management (Homepage & Announcements)
- **Why (Admin):** The homepage content (hero text, featured categories, "how it works" section) is hardcoded in the frontend. To change anything, a developer must edit code and deploy.
- **Gap:** No CMS exists. All content is in React components.
- **Depth:** Create a simple admin content editor for: homepage hero text, featured artisans (manually curated list), announcement banner (dismissible site-wide banner for maintenance, festivals, etc.), and category ordering. Store in a `SiteContent` collection. Frontend fetches on load and renders dynamically. Keep it simple — Markdown text fields, not a full WYSIWYG editor.

### 1.0.0-E: Profile & Discovery Fixes

#### E1. Artisan Profile Preview
- **Why (Artisan):** Artisans can't see how their profile looks to customers. They edit fields but never see the public view.
- **Gap:** The profile editor and the public profile page are completely separate. No "Preview" button.
- **Depth:** Add a "Preview Profile" button in the profile editor that opens the public profile page (using the artisan's publicId) in a new tab. Simple routing — no new components needed.

#### E2. Profile Completeness Score
- **Why (Artisan):** Many artisans register, fill in name and email, and stop. Their profiles are empty — no photo, no services, no portfolio. They wonder why they get no bookings.
- **Gap:** `ProfileCompletionBar` component exists in the frontend but needs to be prominent and actionable.
- **Depth:** Calculate completion score based on: has profile photo (15%), has bio (10%), has location (10%), has at least 1 service (20%), has at least 1 portfolio project (15%), has bank details (10%), has verified documents (10%), has working hours set (10%). Show this prominently on the artisan dashboard with specific "Complete this" CTAs for each missing item. Artisans with <70% completion get a weekly email nudge.

#### E3. Recently Viewed Artisans
- **Why (Customer):** Users browse multiple artisan profiles before deciding. There's no way to get back to one they viewed yesterday without searching again.
- **Gap:** No view history tracked anywhere.
- **Depth:** Store last 20 viewed artisan IDs in localStorage (no backend needed for V1). Show a "Recently Viewed" section on the homepage and search results page. Each item shows artisan name, photo, craft, and rating. Clicking goes back to their profile.

#### E4. Similar Artisans on Profile Page
- **Why (Customer):** When a customer views an artisan profile, there's no "You might also like" section. It's a dead end — they either book or leave.
- **Gap:** No recommendation system exists.
- **Depth:** At the bottom of every artisan profile page, show 4-6 artisans in the same category and nearby location. Query: same craft category, sorted by rating, within 50km (or same city if no geo). This is a simple MongoDB query, not ML-based recommendations. Label it "Similar Artisans Near You".

#### E5. Artisan Response Time Indicator
- **Why (Customer):** Customers don't know if an artisan responds in 1 hour or 3 days. This uncertainty prevents bookings.
- **Gap:** No response time tracking exists.
- **Depth:** Track the time between booking creation and artisan's first action (accept/reject/message). Calculate average response time over last 10 bookings. Display on the artisan profile: "Usually responds within 2 hours" / "Usually responds within 1 day" / "Response time varies". If no data, show nothing. This builds trust and sets expectations.

### 1.0.0-F: System Stability

#### F1. Structured Logging
- **Why (Operations):** The backend uses `console.log` everywhere. In production, these are unstructured, unsearchable, and mixed with noise.
- **Gap:** No logging library. `audit.js` logs to console. Error middleware logs to console.
- **Depth:** Add Winston or Pino. Replace all `console.log` with structured logs: `logger.info('Booking created', { bookingId, userId, artisanId })`. Add request ID to every log for traceability. In production, output JSON format for log aggregation. In development, output pretty-printed for readability.

#### F2. Health Check Endpoint
- **Why (Operations):** There's no way to check if the backend is running, if MongoDB is connected, if Redis is reachable.
- **Gap:** No `/health` or `/api/health` endpoint.
- **Depth:** Add `GET /api/health` that returns: server status, MongoDB connection state, Redis connection state (optional), uptime, memory usage. Used by Render for health checks and monitoring. Return 200 if healthy, 503 if degraded. No auth required.

#### F3. Graceful Shutdown
- **Why (Operations):** When the server restarts (deploy, crash), active requests are dropped mid-flight. Database connections aren't properly closed.
- **Gap:** No SIGTERM/SIGINT handlers in server.js.
- **Depth:** Add signal handlers that: stop accepting new connections, wait for active requests to complete (30s timeout), close MongoDB connection, close Redis connection, then exit. This prevents dropped requests during deployments.

#### F4. Rate Limiting on Public Endpoints
- **Why (Security):** Only auth endpoints have rate limiting. Public search, artisan listing, and profile endpoints have no protection against abuse.
- **Gap:** `express-rate-limit` only applied to `/api/auth` and `/api/users` auth routes.
- **Depth:** Add tiered rate limiting: auth endpoints (strict: 5/min), write endpoints (moderate: 30/min), read endpoints (generous: 100/min). Use Redis-backed rate limiter for consistency across server instances.

---

## V2 1.1.0 — Revenue & Marketplace Maturity

These features turn KalaSetu from a free platform into a sustainable business.

### 1.1.0-A: Platform Commission System

#### A1. Commission on Every Transaction
- **Why (Business):** KalaSetu currently processes payments but takes zero commission. There's no revenue model.
- **Gap:** Payments go directly from customer to artisan via Razorpay. The platform gets nothing.
- **Depth:** Introduce a configurable commission rate (default 10%, adjustable per artisan tier in admin settings). When creating a Razorpay order, the payment is split: 90% to artisan, 10% to platform. Use Razorpay Route (split payments) or hold full amount and disburse to artisan minus commission. Track commission separately in the Payment model: `platformCommission`, `artisanAmount`, `commissionRate`. Admin dashboard shows total commission earned.

#### A2. Artisan Tier System
- **Why (Business + Artisan):** Not all artisans are equal. High-performing artisans should get lower commission rates as an incentive. New artisans might need a free trial period.
- **Gap:** All artisans are treated identically.
- **Depth:** Three tiers:
  - **Starter** (free for 3 months, then 15% commission): New artisans. Basic profile, up to 5 services.
  - **Professional** (10% commission): Verified artisans with 10+ completed bookings and 4.0+ rating. Unlimited services, priority in search.
  - **Premium** (7% commission): Top artisans with 50+ bookings and 4.5+ rating. Featured placement, analytics dashboard, lower commission.
  - Auto-upgrade based on milestones. Admin can manually adjust tier.

### 1.1.0-B: Escrow Payment Flow

#### B1. Hold-and-Release Payments
- **Why (Customer + Artisan):** Customers fear paying upfront for a service that might not be delivered. Artisans fear doing work and not getting paid.
- **Gap:** Currently, payment goes directly to artisan on capture. No hold period.
- **Depth:** New payment flow:
  1. Customer pays → funds held in platform's Razorpay account
  2. Artisan delivers service → marks booking as completed
  3. Customer confirms satisfaction (or 48h auto-confirm) → funds released to artisan minus commission
  4. If dispute → funds held until resolution
  - Add `paymentStatus` states: `held`, `released`, `disputed`, `refunded`
  - Razorpay Route API supports this natively

#### B2. Deposit/Partial Payment
- **Why (Customer):** For expensive services (₹10,000+ wedding mehendi), paying the full amount upfront is risky. A deposit gives commitment without full risk.
- **Gap:** Only full payment is supported.
- **Depth:** Artisans can set a deposit percentage per service (default 100%, min 25%). Customer pays deposit at booking, remainder on completion. Two Razorpay orders per booking. Booking tracks `depositPaid`, `remainderPaid`, `depositAmount`, `remainderAmount`.

### 1.1.0-C: Dispute Resolution

#### C1. Formal Dispute System
- **Why (Both):** Currently, unhappy customers can only create support tickets or request refunds. There's no structured mediation.
- **Gap:** Support tickets are generic. Refunds are binary (approve/reject). No middle ground.
- **Depth:** New `Dispute` model and workflow:
  - Either party can open a dispute on an active booking
  - Dispute includes: reason (categories: quality, no-show, different-from-described, late, rude, other), evidence (photos, screenshots), desired resolution (refund, partial refund, redo service)
  - Admin sees dispute queue with both sides' evidence
  - Admin can: fully refund, partially refund, reject dispute, offer platform credit
  - Dispute affects artisan rating only if resolved in customer's favor
  - SLA: admin must respond within 24h, resolve within 72h
  - Both parties notified at every step

#### C2. Cancellation Policy Framework
- **Why (Both):** There's no clear cancellation policy. When can you cancel? Do you get a refund? How much?
- **Gap:** Cancellation exists but there's no policy engine. Manual admin decisions for every refund.
- **Depth:** Three cancellation tiers (artisan chooses one):
  - **Flexible:** Free cancellation up to 24h before booking. 50% refund within 24h.
  - **Moderate:** Free cancellation up to 48h before. 50% refund 24-48h. No refund within 24h.
  - **Strict:** Free cancellation up to 7 days before. 50% refund 2-7 days. No refund within 48h.
  - Policy is visible on the artisan profile and booking confirmation page
  - Auto-calculated refund amount based on policy — no admin intervention needed for policy-compliant cancellations

### 1.1.0-D: Invoice & Financial Tools

#### D1. Automatic Invoice Generation
- **Why (Both):** After payment, neither party gets a proper invoice/receipt. They only see a transaction in the dashboard.
- **Gap:** No invoice generation exists. No PDF output.
- **Depth:** Generate PDF invoice after every successful payment:
  - Customer invoice: service details, artisan info, amount, GST (if applicable), payment ID, date
  - Artisan receipt: earnings summary, commission deducted, net amount, payout reference
  - Downloadable from booking details page and payment history
  - Use a library like `pdf-lib` or `@react-pdf/renderer` (backend)
  - Email invoice to customer automatically

#### D2. Artisan Earnings Dashboard (Enhanced)
- **Why (Artisan):** Current earnings view shows basic stats. Artisans need to see trends, upcoming payouts, tax-relevant summaries.
- **Gap:** EarningsTab exists but is basic — total earned, recent payments. No graphs, no projections, no tax summary.
- **Depth:** Enhanced dashboard with:
  - Monthly earnings bar chart (last 12 months)
  - Breakdown by service type (which service earns most)
  - Commission paid to platform (for artisan's tax records)
  - Pending payouts (escrowed but not yet released)
  - YTD earnings summary (for ITR filing)
  - Export to CSV/Excel for accounting

---

## V2 1.2.0 — Experience & Engagement

These features make users stay longer, come back more often, and tell their friends.

### 1.2.0-A: Enhanced Booking Experience

#### A1. Availability Calendar View (Customer-Facing)
- **Why (Customer):** Customers currently pick a date blind and hope the artisan is free. This leads to rejected bookings and frustration.
- **Gap:** Backend availability model exists (from 1.0.0-B), but the customer-facing booking form doesn't show it.
- **Depth:** Replace the basic datetime picker with a visual calendar:
  - Green days = available, Gray days = unavailable, Yellow days = limited slots
  - Clicking a day shows available time slots
  - Grayed-out slots for past dates, blocked dates, fully booked dates
  - Time slots based on artisan's service duration + buffer time
  - Real-time — if another customer books while you're looking, the slot disappears

#### A2. Instant vs Request-Based Booking
- **Why (Both):** Some artisans want to approve every booking manually. Others want customers to book directly without waiting for approval.
- **Gap:** All bookings require artisan approval (status goes `pending` → `confirmed`).
- **Depth:** Artisans choose booking mode in settings:
  - **Request mode** (current): Booking goes to `pending`, artisan accepts/rejects
  - **Instant mode**: Booking goes directly to `confirmed`, artisan gets notified. Only available for time slots that are marked as available.
  - Show "Instant Book" badge on artisan profiles that support it. Customers prefer instant booking — it's a competitive advantage.

#### A3. Service Packages & Bundles
- **Why (Artisan + Customer):** An artisan might offer "Wedding Mehendi Package: bride + 4 bridesmaids, includes trial session, ₹15,000" instead of pricing each service separately.
- **Gap:** Services are individual items only. No bundling.
- **Depth:** New `ServicePackage` model: name, description, included services (refs to ArtisanService), package price (usually discounted vs individual), validity period, max bookings. Display on artisan profile as a highlighted "Package Deal" section. When booked, creates multiple linked bookings (one per included service) under a single payment.

#### A4. Custom Quote Requests
- **Why (Customer):** Not everything has a fixed price. "I want a custom oil painting of my family" can't be priced in advance.
- **Gap:** All services have fixed prices. No quote mechanism.
- **Depth:** Add a "Request Quote" option alongside "Book Now" for services marked as `customPricing: true`. Customer describes what they want (text + reference images). Artisan receives the request, reviews, and sends back a quote with price and timeline. Customer accepts or negotiates. On acceptance, a booking is created with the quoted price. This is especially important for custom/bespoke artisan work.

#### A5. Recurring Bookings
- **Why (Customer):** A customer taking weekly pottery classes or monthly rangoli sessions shouldn't have to book 12 times.
- **Gap:** Each booking is one-time only.
- **Depth:** When booking, customer can choose frequency: one-time, weekly, bi-weekly, monthly. System creates a "booking series" — the first booking is created immediately, subsequent ones are auto-created 48h before the next occurrence. Customer can pause or cancel the series. Artisan sees "Recurring" badge on these bookings. Payment is per-session (not upfront for the whole series).

### 1.2.0-B: Trust & Verification

#### B1. Artisan Skill Badges
- **Why (Customer):** "Verified" just means documents were checked. It doesn't say anything about skill level.
- **Gap:** Only document verification exists. No skill-based trust signals.
- **Depth:** Badge system:
  - **Identity Verified** (existing): Documents checked by admin
  - **Rising Star**: 5+ completed bookings, 4.0+ rating
  - **Established**: 25+ bookings, 4.3+ rating, 6+ months on platform
  - **Master Artisan**: 100+ bookings, 4.7+ rating, 12+ months
  - **Quick Responder**: Average response time < 2 hours
  - **Top Rated**: In top 10% of artisans in their category
  - Auto-calculated nightly via background job. Displayed on profile and search results.

#### B2. Review Photo Uploads
- **Why (Customer):** Reviews without photos are just text. Photos of the actual work done are 10x more convincing.
- **Gap:** Review model has an `images` field but the frontend review form doesn't support image upload.
- **Depth:** Add image upload (max 5 photos) to the review submission form. Show photos in a gallery below the review text. This is powerful — potential customers can see actual completed work, not just portfolio photos that the artisan curated.

#### B3. Artisan Response to Reviews
- **Why (Artisan):** Artisans can't respond to reviews publicly. If a customer leaves an unfair review, the artisan has no voice.
- **Gap:** Review model doesn't have an artisan response field. Backend has no endpoint for artisan replies.
- **Depth:** Add `artisanResponse` field to Review model (text, timestamp). Add `POST /api/reviews/:id/respond` (artisan-only, one response per review). Display response below the review on the profile page, clearly labeled "Response from [artisan name]". This is standard on Google Maps, Yelp, Airbnb — expected by both parties.

### 1.2.0-C: Discovery & Personalization

#### C1. Saved Searches & Alerts
- **Why (Customer):** "Notify me when a potter joins in Mumbai" — this doesn't exist. Customers have to manually search repeatedly.
- **Gap:** No saved search functionality.
- **Depth:** On the search results page, add a "Save Search" button that stores the query + filters. In user settings, show saved searches with option to enable "email me when new artisans match this search" (weekly digest). Backend: scheduled job runs weekly, queries new artisans matching saved search criteria, sends email if new matches found.

#### C2. Category Landing Pages
- **Why (Customer):** Clicking "Pottery" in the category list goes to a generic search results page. There's no curated experience.
- **Gap:** Categories exist but have no dedicated landing pages.
- **Depth:** Each category gets its own landing page: `/categories/pottery`. Content: hero image, category description, top-rated artisans in this category, recent work (portfolio projects), average pricing, FAQ ("What to expect from a pottery session"). Admin can customize hero image and description via the content management system (1.0.0-D4).

#### C3. Featured/Promoted Artisan Listings
- **Why (Business + Artisan):** Premium artisans (1.1.0-A2) should get visibility advantages. This is also a potential revenue stream.
- **Gap:** All artisans are treated equally in search results (sorted by relevance/rating).
- **Depth:** "Featured" artisans appear in a highlighted carousel at the top of search results and category pages. Selection criteria: Premium tier artisans, admin-curated picks, or paid promotion (future). Max 3-5 featured per category. Rotate weekly to give different artisans exposure. Clearly labeled "Featured" so customers know it's curated, not organic.

#### C4. Artisan Recommendations (Collaborative Filtering)
- **Why (Customer):** "Customers who booked this artisan also booked..." — this drives discovery.
- **Gap:** No recommendation engine exists. Only "Similar Artisans" (same category, same area) from 1.0.0-E4.
- **Depth:** Track booking patterns: if customer A booked artisan X and artisan Y, and customer B booked artisan X, recommend artisan Y to customer B. This is collaborative filtering. Start simple: co-booking analysis via MongoDB aggregation. No ML needed for V2. Run nightly, cache results. Display on artisan profile pages and homepage.

### 1.2.0-D: Artisan Business Tools

#### D1. QR Code for Offline Marketing
- **Why (Artisan):** Artisans meet customers at markets, fairs, and festivals. They hand out business cards. A QR code that links to their KalaSetu profile bridges offline to online.
- **Gap:** No QR code generation exists.
- **Depth:** Generate a QR code on the artisan dashboard that links to their public profile (`kalasetu.com/[publicId]`). Downloadable as PNG (for printing on cards, posters). Include artisan name and "Book on KalaSetu" text below the QR. Free for all tiers.

#### D2. Customer CRM Notes
- **Why (Artisan):** When a repeat customer books, the artisan doesn't remember their preferences. "This customer likes blue glaze on their pottery" or "Allergic to henna dye X".
- **Gap:** No notes system exists. MyClientsTab shows stats but no notes.
- **Depth:** Add a private notes field per customer in the artisan's client list. Only the artisan can see it. Rich text not needed — plain text up to 500 characters. Visible when viewing the client profile and when a new booking comes in from this client. Stored in a new `ArtisanCustomerNote` collection (artisanId, userId, note, updatedAt).

#### D3. Promotional Tools (Discount Codes)
- **Why (Artisan):** Artisans want to run promotions: "10% off your first booking", "₹200 off during Diwali". Currently impossible.
- **Gap:** No discount/coupon system exists.
- **Depth:** Artisans create discount codes in their dashboard: code string, discount type (percentage or fixed), discount amount, valid date range, max uses, min order value. Customer enters code during booking. Backend validates and adjusts price. Discount shown on invoice. Artisan absorbs the discount (platform commission calculated on discounted price). Admin can also create platform-wide codes.

#### D4. Calendar Sync (Google Calendar)
- **Why (Artisan):** Artisans manage their life outside KalaSetu too. They need bookings to show up in their personal calendar automatically.
- **Gap:** No calendar integration beyond the basic "Add to Calendar" from 1.0.0-A5.
- **Depth:** Google Calendar OAuth integration. When enabled, confirmed bookings auto-create Google Calendar events. Cancelled bookings auto-delete events. Two-way sync is complex — start with one-way (KalaSetu → Google Calendar). Use Google Calendar API. Alternative: generate an iCal subscription URL that Google Calendar can subscribe to (simpler, no OAuth needed).

### 1.2.0-E: Customer Engagement

#### E1. Loyalty Program
- **Why (Business):** Repeat customers are the lifeblood of a marketplace. Reward them.
- **Gap:** No loyalty or rewards system.
- **Depth:** Simple points system: earn 1 point per ₹100 spent. Points can be redeemed for discounts (100 points = ₹50 off). Points expire after 12 months. Show points balance in user dashboard. This encourages repeat bookings and platform stickiness. Track in a `LoyaltyPoints` collection.

#### E2. Referral Program
- **Why (Growth):** Word-of-mouth is the cheapest acquisition channel. Incentivize it.
- **Gap:** No referral system exists.
- **Depth:** Each user gets a unique referral code. When a new user registers with the code AND completes their first booking: referrer gets ₹100 credit, new user gets ₹50 off first booking. Track in a `Referral` collection: referrerId, referredUserId, status (pending/completed), reward. Cap at 10 referrals per user per month (fraud prevention).

#### E3. Gift Cards / Vouchers
- **Why (Customer):** "Book a pottery session for my friend's birthday" — gift cards enable this.
- **Gap:** No gift card system.
- **Depth:** Customer buys a gift card (₹500, ₹1000, ₹2000, or custom amount). Generates a unique code. Recipient enters code during booking to apply credit. Gift cards don't expire for 12 months. Non-refundable. Track in a `GiftCard` collection.

---

## V2 1.3.0 — Growth & Reach

### 1.3.0-A: Multi-Language Support (i18n)

#### A1. Framework Setup
- **Why (Market):** India has 22 official languages. English-only excludes the majority of artisans and customers.
- **Depth:** Integrate `react-i18next`. Extract all hardcoded strings into translation files. Start with English (default) and Hindi. Language selector in header (already exists as `LanguageSwitcher` component). Store preference in localStorage and user profile.

#### A2. Hindi Translation
- **Depth:** Full Hindi translation of all UI strings, emails, notifications, and error messages. This is the single highest-impact language after English for the Indian market. Professional translation, not machine — especially for craft-specific terminology.

#### A3. Regional Language Support
- **Depth:** Phase 2 languages: Marathi, Tamil, Bengali, Telugu, Kannada. These cover the major artisan communities. Community-contributed translations via a translation portal or Google Sheets workflow.

### 1.3.0-B: Mobile Application

#### B1. React Native App
- **Why (Market):** 80%+ of Indian internet users are mobile-first. The PWA works but a native app provides push notifications, camera access, and offline capabilities that PWA can't match.
- **Depth:** Share API layer with web frontend. Reuse business logic. Native components for: camera (portfolio uploads), location services (nearby artisans), push notifications (deep linking to bookings/chat). Start with Android (95% of Indian smartphone market). iOS later.

#### B2. Offline-Capable Artisan Profiles
- **Why (Customer + Artisan):** Many artisans are in areas with spotty internet. Customers might browse at home (WiFi) and visit the artisan's area (no signal). Cached profiles mean they can still access contact info and directions.
- **Depth:** Cache artisan profiles, service listings, and portfolio images locally. Show "Offline" indicator when cached. Sync when connection returns. Use React Native's AsyncStorage + image caching.

### 1.3.0-C: Advanced Analytics

#### C1. Artisan Analytics Dashboard
- **Why (Artisan):** "How many people viewed my profile?" "Which service gets the most clicks?" "Am I getting better or worse?" Artisans need data to improve.
- **Gap:** Basic stats exist. No trends, no insights.
- **Depth:** Track: profile views (daily/weekly/monthly), search impressions (how often they appear in search), click-through rate (impressions → profile views), booking conversion rate (views → bookings), earnings trend, review sentiment trend. Use PostHog events for tracking, aggregate via scheduled jobs. Show charts in the artisan dashboard.

#### C2. Admin Analytics & Reporting
- **Why (Business):** Admins need to understand platform health: GMV, take rate, user acquisition, artisan churn, category performance, geographic distribution.
- **Depth:** Enhanced admin dashboard: GMV chart (total transaction volume over time), commission revenue, user acquisition funnel (signup → first booking), artisan retention (monthly active artisans), category performance (which categories generate most revenue), geographic heat map (where are users/artisans), support ticket resolution time, review sentiment. Exportable to PDF for stakeholder reports.

### 1.3.0-D: SEO & Marketing

#### D1. Blog / Content Marketing
- **Why (Growth):** Organic search traffic from content about Indian crafts, artisan stories, festival guides drives free user acquisition.
- **Depth:** Simple blog system: admin creates posts (Markdown), each post gets a URL (`/blog/[slug]`), proper SEO metadata, social sharing. Content ideas: artisan success stories, craft guides ("How to choose a good potter"), festival buying guides, regional craft spotlights.

#### D2. Social Media Sharing
- **Why (Growth):** Artisans should be able to share their KalaSetu profile on Instagram, WhatsApp, Facebook.
- **Depth:** Share buttons on artisan profiles and portfolio projects. Generate Open Graph images dynamically (artisan photo + name + craft + rating). WhatsApp share is especially important in India — generate a formatted message with a link.

---

## V2 2.0.0 — Platform Evolution

### 2.0.0-A: Code Quality & Testing

#### A1. Backend Test Suite
- **Why (Engineering):** Zero automated tests means every change is a risk. The backend has 25 controllers and 28 route files — manual testing doesn't scale.
- **Depth:** Vitest + Supertest for API testing. Priority order:
  1. Auth flows (both user types, admin)
  2. Booking lifecycle (create → accept → pay → complete → review)
  3. Payment flows (create order → verify → webhook → refund)
  4. Middleware (auth, validation, rate limiting)
  5. Edge cases (double booking, expired tokens, concurrent payments)
  - Target: 80% coverage on controllers and middleware. 100% on auth and payment flows.
  - In-memory MongoDB (mongodb-memory-server) for isolated tests.

#### A2. Frontend TypeScript Migration
- **Depth:** Gradual migration: start with new files, then migrate existing files by priority. Add `tsconfig.json`, rename `.jsx` → `.tsx` one directory at a time. Start with `lib/` (API client, utils), then `contexts/`, then `components/ui/`, then pages. Use `// @ts-check` in JS files during transition.

#### A3. CI Pipeline Enforcement
- **Depth:** GitHub Actions workflow: lint → type check → test → build. Tests must pass before merge to main. Lint warnings treated as errors. Build must succeed. Add test coverage reporting. Block PRs that decrease coverage.

### 2.0.0-B: Architecture Improvements

#### B1. Service Layer
- **Why (Engineering):** Controllers are fat — they contain business logic, database queries, external service calls, and response formatting. This makes them hard to test and reuse.
- **Depth:** Extract business logic into service classes: `BookingService`, `PaymentService`, `NotificationService`, `AuthService`. Controllers become thin routing layers that call services. Services can be unit-tested without HTTP context. This is the single biggest architectural improvement.

#### B2. Event-Driven Architecture
- **Why (Engineering):** When a booking is created, the controller does: create booking, send notification, create chat channel, index in Algolia, log analytics. If one fails, the whole request might fail or succeed partially.
- **Depth:** Introduce an event bus (start with in-process EventEmitter, evolve to Redis pub/sub). When a booking is created, emit `booking.created` event. Listeners handle notifications, chat, indexing, analytics independently. If one listener fails, others still succeed. Add retry logic per listener.

#### B3. API Versioning
- **Why (Engineering):** When V2 changes payment flow (escrow), existing API clients break. Without versioning, you can't evolve the API safely.
- **Depth:** Prefix all routes with `/api/v1/`. New V2 routes under `/api/v2/`. Both versions can coexist. V1 routes deprecated with warning header. Frontend updated to use V2. Mobile app can stay on V1 until updated.

#### B4. Database Optimization
- **Depth:** Cursor-based pagination (instead of offset-based skip/limit — skip is O(n) in MongoDB). Compound indexes on common query patterns (artisan category + location, booking artisan + status + date). Read preference secondaryPreferred for non-critical reads. Connection pool sizing based on load. Query explain plans for all aggregation pipelines.

### 2.0.0-C: Security Hardening

#### C1. Two-Factor Authentication
- **Depth:** Optional 2FA for artisans and admins (required for admin). TOTP-based (Google Authenticator / Authy). Backup codes for recovery. Enable in account settings.

#### C2. Content Security Policy
- **Depth:** Add CSP headers: restrict script sources, image sources (only Cloudinary and self), frame sources (only Daily.co for video), connect sources (only known API domains). Prevents XSS even if a vulnerability exists.

#### C3. Request Signing for Sensitive Operations
- **Depth:** Payment creation, bank detail updates, and admin actions require a signed request (hash of request body + timestamp + secret). Prevents replay attacks and request tampering. Implement as middleware.

### 2.0.0-D: Nice-to-Have Features

#### D1. Group Bookings
- **Why (Customer):** "I need 3 mehendi artists for my wedding" or "Book a pottery workshop for 10 people".
- **Depth:** New booking type: group. Specify number of participants. Artisan sets group pricing (per-person or flat rate). Max group size per artisan setting. Creates a single booking with multiple participant slots.

#### D2. Artisan-to-Artisan Collaboration
- **Why (Artisan):** A mehendi artist gets a request she can't fulfill alone. She wants to invite another artist to collaborate.
- **Depth:** Artisans can tag other artisans as "collaborators" on a booking. Revenue split defined per collaborator. Customer sees "Team of 2 artisans" on their booking. Both artisans get the booking in their dashboard.

#### D3. Artisan Workshops/Classes
- **Why (Artisan + Customer):** Beyond 1-on-1 services, artisans could offer group classes: "Learn pottery basics — Saturday 10am, ₹500/person, max 8 spots".
- **Depth:** New content type: Workshop. Has: title, description, date/time, duration, max participants, price per person, location (or "online" for video). Customers register (not book). Payment on registration. Artisan sees participant list. Post-workshop, all participants can review. This opens an entirely new revenue stream.

#### D4. Marketplace for Artisan Products
- **Why (Business):** Some artisans also sell finished products (pots, paintings, jewelry), not just services. Adding product listings makes KalaSetu a complete artisan economy.
- **Depth:** This is a major undertaking — essentially an e-commerce module. Consider it for V3, not V2. If included in V2, keep it minimal: product listing (name, photos, price, description, shipping), cart, checkout via Razorpay, order tracking. No inventory management initially.

---

## Priority Matrix

| Version | Theme | Impact | Effort | Ship When |
|---------|-------|--------|--------|-----------|
| 1.0.0 | Fixes & Essentials | High (fixes broken UX) | Medium | Immediately |
| 1.1.0 | Revenue & Trust | Critical (business model) | High | Month 1-2 |
| 1.2.0 | Experience | High (retention) | High | Month 3-5 |
| 1.3.0 | Growth | High (scale) | Very High | Month 6-9 |
| 2.0.0 | Evolution | Medium (tech debt) | Very High | Month 9-12+ |

---

## What KalaSetu Is NOT Building

To stay focused, these are explicitly out of scope even for V2:

- **Not a logistics platform** — No delivery tracking, no shipping management (artisans provide services, not products in V2)
- **Not a social network** — No feeds, no following, no artisan-to-artisan messaging (keep it transactional)
- **Not an education platform** — Workshops are bookable events, not courses with modules/certificates
- **Not a hiring platform** — No full-time employment, no contracts (only booking-based transactions)
- **Not a design tool** — No canvas editor, no custom design builder (customers describe what they want in text)

---

*This document is used by the `/daily` skill for session planning. Update it as features are completed or priorities change.*
*Last updated: 2026-02-16*
