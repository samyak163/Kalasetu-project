# KalaSetu v2 — Roadmap

## Overview
8 phases progressing from critical fixes → stub completion → UI polish → new features → performance. Each phase builds on the previous, ensuring a stable foundation before adding complexity.

---

### Phase 1: Critical Bug Fixes
**Goal:** Eliminate security vulnerabilities and reliability issues that affect current users.

**Requirements:** BUG-01, BUG-02, BUG-03, BUG-04, BUG-05

| Task | Requirement | Scope |
|------|------------|-------|
| Add MongoDB transactions to booking creation | BUG-01 | Backend |
| Fix NotificationContext infinite refresh loop | BUG-02 | Frontend |
| Add file upload validation (type + size) | BUG-03 | Backend |
| Add rate limiting to auth endpoints | BUG-04 | Backend |
| Replace empty catch blocks with error handling | BUG-05 | Frontend |

**Dependencies:** None — can start immediately.
**Estimated complexity:** Medium (mostly targeted fixes in known locations).
**Success criteria:** No race conditions in bookings, no infinite loops, uploads validated, auth rate-limited, no empty catches.
**Plans:** 3 plans (all Wave 1 — parallel)

Plans:
- [x] 01-01-PLAN.md — Booking race condition fix (transaction) + auth rate limiting
- [x] 01-02-PLAN.md — NotificationContext infinite loop fix + empty catch block replacements
- [x] 01-03-PLAN.md — File upload validation (shared multer config + error handling)

**Status:** ✓ Complete (2026-02-13)

---

### Phase 2: Refund & Support
**Goal:** Complete the payment refund workflow and support ticket system so users have recourse when things go wrong.

**Requirements:** STUB-01, STUB-02

| Task | Requirement | Scope |
|------|------------|-------|
| Implement RefundRequest model + admin-approved workflow | STUB-01 | Backend + Admin UI |
| Implement SupportTicket model + CRUD + admin panel | STUB-02 | Backend + Admin UI |

**Dependencies:** Phase 1 (bug-free foundation).
**Estimated complexity:** High (new models, admin UI, Razorpay refund API integration).
**Success criteria:** Users can request refunds and create support tickets. Admins can manage both from the panel. Email notifications sent at each status change.

---

### Phase 3: Verification & Recording
**Goal:** Complete phone verification and video recording stubs for trust and record-keeping.

**Requirements:** STUB-03, STUB-04

| Task | Requirement | Scope |
|------|------------|-------|
| Integrate MSG91 for SMS OTP verification | STUB-03 | Backend |
| Enable Daily.co recording + VideoCall model | STUB-04 | Backend + Frontend |

**Dependencies:** Phase 1 (rate limiting patterns reused for OTP).
**Estimated complexity:** Medium (third-party API integrations with existing endpoint stubs).
**Success criteria:** Phone numbers verifiable via OTP. Video calls recordable and recordings accessible from booking detail.

---

### Phase 4: Homepage & Polish
**Goal:** Improve first impressions and clean up the codebase.

**Requirements:** UI-01, UI-04, UI-05

| Task | Requirement | Scope |
|------|------------|-------|
| Build enhanced homepage (hero, featured, categories, how-it-works, testimonials) | UI-01 | Frontend |
| Add contextual empty states with CTAs across all list views | UI-04 | Frontend |
| Delete orphaned files, remove dead imports | UI-05 | Frontend |

**Dependencies:** Phase 1 (error handling patterns from BUG-05 inform UI-04).
**Estimated complexity:** Medium (frontend-heavy, design work).
**Success criteria:** Homepage showcases marketplace value. All list views have meaningful empty states. No dead code.

---

### Phase 5: Dark Mode & i18n
**Goal:** Support user preferences for theme and language.

**Requirements:** UI-02, UI-03

| Task | Requirement | Scope |
|------|------------|-------|
| Implement ThemeContext + dark mode across all components | UI-02 | Frontend |
| Configure i18next + translate all strings to Hindi/English | UI-03 | Frontend |

**Dependencies:** Phase 4 (homepage and empty states should exist before theming/translating them).
**Estimated complexity:** High (touches every component for dark mode; translation volume is large).
**Success criteria:** Full dark mode support. All UI text available in Hindi and English. Preferences persist.

---

### Phase 6: Availability & Reviews
**Goal:** Add core features that improve the booking experience and artisan-customer interaction.

**Requirements:** FEAT-01, FEAT-02

| Task | Requirement | Scope |
|------|------------|-------|
| Build availability calendar (model, API, frontend component, booking integration) | FEAT-01 | Full stack |
| Add artisan review response system | FEAT-02 | Full stack |

**Dependencies:** Phase 1 (booking race condition fix), Phase 2 (refund system for booking disputes).
**Estimated complexity:** High (new data models, calendar UI, booking flow changes).
**Success criteria:** Artisans manage availability visually. Users book from available slots. Artisans respond to reviews. No double-booking.

---

### Phase 7: Analytics & Packages
**Goal:** Give artisans business intelligence tools and flexible service offerings.

**Requirements:** FEAT-03, FEAT-04

| Task | Requirement | Scope |
|------|------------|-------|
| Build artisan analytics dashboard (metrics, charts, date ranges) | FEAT-03 | Full stack |
| Implement service packages/bundles | FEAT-04 | Full stack |

**Dependencies:** Phase 6 (availability data feeds into analytics; booking flow changes from FEAT-01 should be stable).
**Estimated complexity:** Medium-High (aggregation queries, chart library, schema extensions).
**Success criteria:** Artisans see accurate business metrics with charts. Service bundles bookable at discounted prices.

---

### Phase 8: Performance Optimization
**Goal:** Reduce load times and improve scalability.

**Requirements:** PERF-01, PERF-02, PERF-03, PERF-04

| Task | Requirement | Scope |
|------|------------|-------|
| Implement route-level code splitting with React.lazy | PERF-01 | Frontend |
| Move email sending to QStash queue | PERF-02 | Backend |
| Tune MongoDB connection pool settings | PERF-03 | Backend |
| Optimize remaining admin dashboard queries | PERF-04 | Backend |

**Dependencies:** All previous phases (optimize after features are stable; code splitting needs final route structure).
**Estimated complexity:** Medium (well-defined optimizations with measurable outcomes).
**Success criteria:** Initial bundle < 500KB. API responses faster without sync email. No connection pool exhaustion. Admin dashboard < 2s load.

---

## Phase Dependency Graph

```
Phase 1 (Bugs) ──┬──→ Phase 2 (Refund/Support) ──→ Phase 6 (Availability/Reviews)
                  │                                          │
                  ├──→ Phase 3 (Verify/Record)               ↓
                  │                                  Phase 7 (Analytics/Packages)
                  ├──→ Phase 4 (Homepage/Polish) ──→ Phase 5 (Dark Mode/i18n)
                  │                                          │
                  └─────────────────────────────────────────→ Phase 8 (Performance)
```

## Coverage Verification
All 22 requirements mapped to phases:
- Phase 1: 5 requirements (BUG-01 through BUG-05)
- Phase 2: 2 requirements (STUB-01, STUB-02)
- Phase 3: 2 requirements (STUB-03, STUB-04)
- Phase 4: 3 requirements (UI-01, UI-04, UI-05)
- Phase 5: 2 requirements (UI-02, UI-03)
- Phase 6: 2 requirements (FEAT-01, FEAT-02)
- Phase 7: 2 requirements (FEAT-03, FEAT-04)
- Phase 8: 4 requirements (PERF-01 through PERF-04)
- **Total: 22/22 requirements covered**
