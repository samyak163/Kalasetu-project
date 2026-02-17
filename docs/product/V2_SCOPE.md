# KalaSetu V2 Scope

> **Status:** Planning
> **Last Updated:** 2026-02-16
> **Depends on:** V1 stabilization
> **Deep Plan:** See `docs/product/V2_CORE_FEATURES.md` for the full versioned feature breakdown with implementation depth

---

## What V2 Is

V2 builds on the stable V1 marketplace with features that improve trust, scale, and revenue. It focuses on three pillars: **quality assurance** (testing, TypeScript), **marketplace maturity** (commissions, disputes, verification), and **reach** (mobile, multi-language).

---

## V2 Feature Scope

### Testing and Code Quality

- [ ] Backend test suite (Jest or Vitest for API routes, controllers, middleware)
- [ ] Integration tests for critical flows (booking + payment + notification)
- [ ] Frontend TypeScript migration
- [ ] CI pipeline enforcement (tests must pass before merge)
- [ ] API contract testing

### Marketplace Maturity

- [ ] Platform commission system (percentage per booking)
- [ ] Escrow payment flow (hold funds until service completion)
- [ ] Dispute resolution system (customer/artisan disputes with admin mediation)
- [ ] Automated payout scheduling for artisans
- [ ] Invoice generation (PDF) for completed bookings
- [ ] Booking cancellation policies (configurable per artisan)

### Trust and Verification

- [ ] Automated document verification (OCR/AI for Aadhar, PAN)
- [ ] Artisan skill certification badges
- [ ] Customer identity verification
- [ ] Review authenticity checks (only verified bookings can review)
- [ ] Fraud detection (suspicious booking patterns, fake reviews)

### Search and Discovery

- [ ] Advanced filtering (price range, rating, availability, distance)
- [ ] Artisan recommendations (based on browsing history)
- [ ] Category landing pages with curated artisans
- [ ] Featured/promoted artisan listings

### Multi-Language Support

- [ ] i18n framework integration (React i18next or similar)
- [ ] Hindi translation (primary Indian language)
- [ ] Regional language support (Marathi, Tamil, Bengali, etc.)
- [ ] RTL support if needed

### Mobile Application

- [ ] React Native or Flutter mobile app
- [ ] Push notification deep linking
- [ ] Offline-capable artisan profiles
- [ ] Camera integration for portfolio uploads
- [ ] Location-based artisan discovery (GPS)

### Artisan Tools

- [ ] Artisan subscription tiers (free, premium, business)
- [ ] Analytics dashboard (views, conversion rates, earnings trends)
- [ ] Automated booking reminders
- [ ] Calendar sync (Google Calendar, iCal)
- [ ] Artisan-to-artisan collaboration/referrals
- [ ] Bulk service management

### Customer Experience

- [ ] Saved searches and alerts
- [ ] Booking templates (repeat bookings)
- [ ] Group bookings (events, workshops)
- [ ] Gift cards / vouchers
- [ ] Loyalty program

### Infrastructure

- [ ] Database read replicas for scaling
- [ ] CDN for static assets
- [ ] API versioning (v1, v2)
- [ ] Rate limiting per user (not just per IP)
- [ ] Webhook system for third-party integrations
- [ ] Comprehensive logging and audit trail

---

## V2 Technical Approach

| Area | V1 | V2 Target |
|------|-----|-----------|
| Frontend | React (JSX) | React (TypeScript) |
| Testing | Manual | Automated (Jest/Vitest + integration) |
| Payments | Direct Razorpay | Escrow + commission |
| Mobile | PWA only | Native app (React Native) |
| i18n | English only | Multi-language |
| Verification | Manual admin | Automated (AI/OCR) |
| Analytics | PostHog (basic) | Custom artisan analytics dashboard |

---

## V2 Priorities (Ordered)

1. **Backend test suite** -- Foundation for everything else
2. **Commission system** -- Revenue model
3. **Dispute resolution** -- Trust at scale
4. **TypeScript migration** -- Code quality
5. **Multi-language** -- Market reach
6. **Mobile app** -- User accessibility
7. **Everything else** -- As resources allow

---

## V2 Success Criteria

1. 80%+ backend test coverage on critical paths
2. Platform takes commission on every transaction
3. Disputes resolved within 48 hours (admin SLA)
4. At least Hindi + English language support
5. Mobile app on Google Play Store
6. Zero unhandled payment edge cases

---

## Version Roadmap

| Version | Theme | What Ships |
|---------|-------|------------|
| **1.0.0** | Fixes & Essentials | Booking flow fixes, availability system, communication improvements, admin gaps, profile/discovery fixes, system stability |
| **1.1.0** | Revenue & Trust | Commission system, escrow payments, dispute resolution, invoices, cancellation policies |
| **1.2.0** | Experience & Engagement | Availability calendar, instant booking, packages, custom quotes, recurring bookings, badges, artisan tools, loyalty/referral |
| **1.3.0** | Growth & Reach | Multi-language (Hindi + regional), React Native mobile app, analytics dashboards, SEO/content marketing |
| **2.0.0** | Platform Evolution | Backend test suite, TypeScript migration, service layer architecture, event-driven system, API versioning, security hardening |

For the full feature breakdown with "what, why, gap, depth" for every feature, see **`docs/product/V2_CORE_FEATURES.md`**.

---

*See `docs/product/V1_SCOPE.md` for current state.*
