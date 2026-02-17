# KalaSetu V1 Scope

> **Status:** Implemented (current production state)
> **Last Updated:** 2026-02-16

---

## What V1 Is

V1 is the complete artisan marketplace platform as it exists today. It covers the full lifecycle: artisan onboarding, customer discovery, booking, payment, communication, and reviews.

---

## V1 Feature Scope

### Included in V1

**Authentication**
- [x] Dual auth system (artisan + customer) with JWT cookies
- [x] Admin authentication (separate cookie)
- [x] Firebase social login for artisans
- [x] OTP email verification
- [x] reCAPTCHA bot protection
- [x] Password reset flows for all user types
- [x] Rate limiting on auth endpoints

**Artisan Platform**
- [x] Profile creation and management (bio, skills, location, images)
- [x] Custom profile slugs (vanity URLs)
- [x] Service listing and management
- [x] Availability scheduling
- [x] Portfolio with multi-image projects
- [x] Dashboard with booking and earnings stats
- [x] Customer list with per-customer stats
- [x] Document upload for verification (Aadhar, PAN, etc.)
- [x] Bank details for payouts

**Customer Experience**
- [x] Browse artisan profiles (paginated, cached)
- [x] Algolia-powered search with faceted filtering
- [x] Nearby artisan discovery (geospatial)
- [x] Bookmark artisans
- [x] View public portfolios and services
- [x] Order history and rating history

**Marketplace**
- [x] Booking system (create, accept/reject, complete, cancel)
- [x] Razorpay payment processing (orders, verification, webhooks)
- [x] Refund request system
- [x] Review and rating system with helpful toggle

**Communication**
- [x] Real-time chat (Stream Chat)
- [x] Video calls (Daily.co)
- [x] Call history tracking
- [x] Push notifications (OneSignal)
- [x] Email notifications (Resend + React Email)
- [x] Contact form

**Admin Panel**
- [x] Platform-wide dashboard statistics
- [x] Artisan verification and management
- [x] User management
- [x] Review moderation (flag, hide, delete, restore)
- [x] Payment and refund administration
- [x] Booking administration
- [x] Support ticket management
- [x] Platform settings

**Infrastructure**
- [x] Cloudinary image uploads (signed)
- [x] SEO metadata and sitemap generation
- [x] Background jobs (QStash)
- [x] Redis caching (Upstash)
- [x] Analytics (PostHog, Sentry, LogRocket)
- [x] Environment validation
- [x] Centralized error handling
- [x] Zod request validation

### NOT in V1 (Deferred to V2)

- [ ] Backend test suite
- [ ] TypeScript migration (frontend)
- [ ] Multi-language support (i18n)
- [ ] Mobile app
- [ ] Artisan subscription tiers
- [ ] Platform commission system
- [ ] Escrow payments
- [ ] Advanced analytics dashboard for artisans
- [ ] Automated artisan verification (document AI)
- [ ] Dispute resolution system
- [ ] Artisan-to-artisan collaboration

---

## V1 Technical Boundaries

| Area | V1 Approach |
|------|-------------|
| Frontend | React (JSX) + Vite + Tailwind |
| Backend | Node.js + Express + MongoDB |
| Auth | JWT in HTTP-only cookies |
| Payments | Razorpay (INR only) |
| Search | Algolia (server-side indexing) |
| Hosting | Render (backend) + Vercel (frontend) |
| Testing | Manual testing (no automated test suite) |
| Monitoring | PostHog + Sentry + LogRocket |

---

## V1 Success Criteria

1. Artisans can create profiles, list services, and receive bookings
2. Customers can discover artisans, book services, and pay
3. Both parties can communicate via chat and video
4. Admin can manage the platform end-to-end
5. Platform is deployed and accessible on the web

---

*See `docs/product/V2_SCOPE.md` for future scope.*
