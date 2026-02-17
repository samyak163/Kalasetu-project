# Phase 3: Detailed Scope

> **Status:** Planning
> **Depends on:** Phase 2 complete
> **Estimated tasks:** 40-50 items

---

## Task Categories

### 1. Artisan Onboarding Wizard

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 1.1 | Create multi-step onboarding wizard component | P0 | High |
| 1.2 | Step 1: Profile basics (name, bio, photo, location) | P0 | Medium |
| 1.3 | Step 2: Craft & services (category, service listings) | P0 | Medium |
| 1.4 | Step 3: Availability (working hours, calendar) | P0 | Medium |
| 1.5 | Step 4: Portfolio (upload first project) | P1 | Medium |
| 1.6 | Step 5: Verification (documents, bank details) | P1 | Medium |
| 1.7 | "Go Live" final step with profile preview | P0 | Medium |
| 1.8 | Onboarding progress persistence (resume incomplete setup) | P1 | Medium |

### 2. Discovery & Browsing Enhancement

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 2.1 | "Artisans Near Me" map view component | P0 | High |
| 2.2 | Category browsing page with visual cards | P1 | Medium |
| 2.3 | Recently viewed artisans (client-side storage) | P2 | Low |
| 2.4 | Personalized recommendations API | P1 | High |
| 2.5 | Advanced filter panel (price, rating, availability, distance) | P1 | Medium |
| 2.6 | Featured artisans section on homepage | P1 | Medium |
| 2.7 | Instant booking vs request booking toggle | P2 | Medium |

### 3. Artisan Business Tools

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 3.1 | Income report page with charts (weekly/monthly) | P0 | High |
| 3.2 | Downloadable financial summary (CSV/PDF) | P2 | Medium |
| 3.3 | Portfolio enhancement: before/after gallery | P1 | Medium |
| 3.4 | Working hours by day configuration | P1 | Medium |
| 3.5 | Holiday/vacation mode toggle | P2 | Low |
| 3.6 | Buffer time between bookings setting | P2 | Low |
| 3.7 | Promotional discount creation | P2 | Medium |

### 4. Trust & Safety

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 4.1 | "KalaSetu Verified" badge logic and display | P0 | Medium |
| 4.2 | Verification progress indicator for artisans | P1 | Medium |
| 4.3 | Review analytics for artisans (trends, sentiment) | P2 | Medium |
| 4.4 | Trust score calculation | P2 | High |

### 5. Admin Analytics Dashboard

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 5.1 | Revenue analytics page with charts | P0 | High |
| 5.2 | User growth metrics and charts | P1 | Medium |
| 5.3 | Booking analytics (conversion, categories, peak times) | P1 | Medium |
| 5.4 | Geographic distribution heat map | P2 | High |
| 5.5 | Platform health metrics page | P2 | Medium |

### 6. SEO & Marketing

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 6.1 | Schema.org markup for artisan profiles | P1 | Medium |
| 6.2 | Open Graph / Twitter Card meta tags | P1 | Low |
| 6.3 | Verify and enhance sitemap | P2 | Low |
| 6.4 | Canonical URLs for all public pages | P2 | Low |

### 7. Performance Optimization

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 7.1 | Route-based code splitting (React.lazy) | P0 | Medium |
| 7.2 | Image optimization with Cloudinary transformations | P1 | Medium |
| 7.3 | Redis cache TTL optimization | P2 | Low |
| 7.4 | Bundle size analysis and reduction | P1 | Medium |
| 7.5 | Core Web Vitals audit and fixes | P2 | Medium |

---

## New Components

### Frontend
- `OnboardingWizard` -- Multi-step artisan setup
- `MapView` -- Leaflet/Mapbox map for "Near Me"
- `IncomeChart` -- Recharts-based earnings visualization
- `AdvancedFilters` -- Filter panel for search
- `VerificationBadge` -- Trust indicator component
- `AdminAnalytics` -- Charts dashboard for admin
- `RecommendationCarousel` -- Personalized artisan suggestions

### Backend API Additions
```
GET    /api/artisans/nearby?lat=&lng=&radius=  (enhance existing)
GET    /api/artisans/featured
GET    /api/artisans/recommendations
GET    /api/artisan/income-report?period=
GET    /api/artisan/verification-status
PATCH  /api/artisan/availability/hours
PATCH  /api/artisan/vacation-mode
POST   /api/artisan/promotions
GET    /api/admin/analytics/revenue
GET    /api/admin/analytics/users
GET    /api/admin/analytics/bookings
GET    /api/admin/analytics/geography
```

---

## Definition of Done (Phase 3)

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] 60%+ of P2 tasks completed
- [ ] Full demo script executable without errors
- [ ] Lighthouse performance score > 80
- [ ] All new endpoints have tests
- [ ] Git tag `phase-3-production` created
- [ ] Vercel deployment verified
- [ ] Demo rehearsal completed

---

*Last updated: 2026-02-17*
