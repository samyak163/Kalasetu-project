# ROADMAP.md - KalaSetu Future Vision & Development Plan

This document outlines the complete vision for KalaSetu, what currently exists, what's missing, and the roadmap for technical and business improvements.

---

## Current State Overview

### What You Have Now

| Feature | Status | Quality |
|---------|--------|---------|
| User Registration/Login | Working | Needs email verification fixes |
| Artisan Registration/Login | Working | Needs profile completion flow |
| Artisan Profiles | Working | Basic, needs enhancement |
| Search (Algolia) | Working | Basic implementation |
| Booking System | Partially Working | Many gaps |
| Payments (Razorpay) | Basic Implementation | Missing refunds, disputes |
| Chat (Stream) | Integrated | Basic, needs booking integration |
| Video Calls (Daily.co) | Integrated | Basic implementation |
| Push Notifications (OneSignal) | Integrated | Not fully utilized |
| Admin Panel | Basic | Missing many features |
| Reviews | Basic | Missing verification |
| Analytics (PostHog, Sentry, LogRocket) | Integrated | Good foundation |

### What's Broken or Missing (from BUGS.md)
- Messages page crashes (missing ChatContext)
- Bookings dashboard is a stub
- N+1 query performance issues
- Security vulnerabilities (XSS, ReDoS)
- No email verification for Firebase users
- Payment webhooks not idempotent
- 60+ bugs documented

---

## PHASE 1: Foundation Fixes (4-6 weeks)

### 1.1 Critical Bug Fixes
- [ ] Fix MessagesPage ChatContext crash
- [ ] Implement actual Bookings page
- [ ] Fix N+1 queries in dashboard
- [ ] Fix XSS and ReDoS vulnerabilities
- [ ] Encrypt sensitive data (bank details)
- [ ] Fix AuthContext hydration issues

### 1.2 Security Hardening
- [ ] Implement proper rate limiting per endpoint
- [ ] Add webhook idempotency
- [ ] Set up CSP headers
- [ ] Implement refresh token rotation
- [ ] Add brute force protection on auth endpoints
- [ ] Input sanitization across all endpoints

### 1.3 Code Quality
- [ ] Remove all console.log statements
- [ ] Add PropTypes to all React components
- [ ] Add proper error boundaries
- [ ] Implement consistent error handling
- [ ] Add database indexes for common queries
- [ ] Set up proper logging (Winston/Pino)

### 1.4 Testing Foundation
- [ ] Set up Jest for backend testing
- [ ] Set up React Testing Library for frontend
- [ ] Write tests for auth flows
- [ ] Write tests for payment flows
- [ ] Set up E2E testing with Playwright/Cypress

---

## PHASE 2: Core Feature Completion (6-8 weeks)

### 2.1 Booking System Enhancement

**Current State:** Basic booking creation, no proper flow

**Needed:**
- [ ] Booking request → Artisan approval workflow
- [ ] Calendar-based availability checking
- [ ] Booking modification requests
- [ ] Cancellation with reason tracking
- [ ] Rescheduling functionality
- [ ] Booking reminders (email + push)
- [ ] No-show handling
- [ ] Booking history with filtering
- [ ] Recurring bookings support

**Data Model Changes:**
```javascript
// Add to bookingModel.js
cancellationReason: String,
cancellationRequestedBy: { type: ObjectId, ref: 'User' },
rescheduledFrom: { type: ObjectId, ref: 'Booking' },
remindersSent: [{
  type: { type: String, enum: ['email', 'push', 'sms'] },
  sentAt: Date
}],
isRecurring: Boolean,
recurringPattern: {
  frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'] },
  endDate: Date
}
```

### 2.2 Payment System Completion

**Current State:** Basic payment creation, no refunds/disputes

**Needed:**
- [ ] Full refund flow
- [ ] Partial refund support
- [ ] Dispute handling system
- [ ] Payout to artisans (withdrawal system)
- [ ] Payment splitting (platform fee)
- [ ] Transaction history with receipts
- [ ] Invoice generation (PDF)
- [ ] Tax documentation (GST compliance)
- [ ] Multiple payment methods
- [ ] Subscription/package payments

**New API Endpoints:**
```
POST /api/payments/:id/refund
POST /api/payments/:id/dispute
GET /api/payments/artisan/payouts
POST /api/payments/artisan/withdraw
GET /api/payments/invoice/:id
```

### 2.3 Review System Enhancement

**Current State:** Basic review creation

**Needed:**
- [ ] Verified purchase badge
- [ ] Photo/video reviews
- [ ] Review responses from artisan
- [ ] Review reporting/flagging
- [ ] Review moderation queue
- [ ] Review helpfulness voting
- [ ] Review analytics for artisans
- [ ] Automated review requests after booking

### 2.4 Messaging System Completion

**Current State:** Stream Chat integrated but basic

**Needed:**
- [ ] Auto-create chat when booking confirmed
- [ ] Booking-specific chat channels
- [ ] File/image sharing in chat
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message templates for common responses
- [ ] Chat export for disputes
- [ ] Block/report functionality
- [ ] Automated messages (booking confirmations)

### 2.5 Video Consultation Enhancement

**Current State:** Basic Daily.co integration

**Needed:**
- [ ] Scheduled video call reminders
- [ ] Call recording (with consent)
- [ ] Screen sharing for demonstrations
- [ ] Virtual background for artisans
- [ ] Call quality monitoring
- [ ] Fallback to audio-only
- [ ] Post-call summary/notes
- [ ] Integration with booking system

---

## PHASE 3: Business Features (8-12 weeks)

### 3.1 Artisan Business Tools

**Portfolio Enhancement:**
- [ ] Before/after gallery
- [ ] Video portfolio uploads
- [ ] Work process documentation
- [ ] Client testimonial videos
- [ ] Portfolio categories/sections

**Business Management:**
- [ ] Expense tracking
- [ ] Income reports with charts
- [ ] Tax summary generation
- [ ] Client notes/CRM
- [ ] Service pricing history
- [ ] Promotional pricing/discounts
- [ ] Gift cards support

**Availability Management:**
- [ ] Google Calendar sync
- [ ] Buffer time between bookings
- [ ] Holiday/vacation mode
- [ ] Travel availability (if artisan travels)
- [ ] Multiple location support
- [ ] Working hours by day

### 3.2 Customer Features

**Enhanced Discovery:**
- [ ] Saved/favorite artisans
- [ ] Recently viewed
- [ ] Personalized recommendations
- [ ] "Artisans near me" with map view
- [ ] Filter by availability
- [ ] Price range filtering
- [ ] Instant booking vs request booking

**Customer Dashboard:**
- [ ] Upcoming bookings calendar
- [ ] Spending analytics
- [ ] Loyalty points system
- [ ] Referral program
- [ ] Saved payment methods
- [ ] Address book for service locations

### 3.3 Trust & Safety

**Verification System:**
- [ ] Identity verification (Aadhaar/PAN)
- [ ] Business verification
- [ ] Skill certification badges
- [ ] Background check integration
- [ ] Insurance verification
- [ ] "KalaSetu Verified" badge

**Safety Features:**
- [ ] Emergency contact during appointments
- [ ] Location sharing during service
- [ ] Safe messaging (no external contact sharing)
- [ ] Fraud detection system
- [ ] Suspicious activity alerts

### 3.4 Marketing & Growth

**SEO & Discoverability:**
- [ ] Dynamic sitemap generation
- [ ] Schema.org markup for artisans
- [ ] Meta tags optimization
- [ ] Google My Business integration
- [ ] Social sharing cards

**Promotions:**
- [ ] Coupon/promo code system
- [ ] First booking discount
- [ ] Referral rewards
- [ ] Seasonal promotions
- [ ] Bundle pricing
- [ ] Flash deals

---

## PHASE 4: Scale & Monetization (12-16 weeks)

### 4.1 Platform Monetization

**Revenue Streams:**
```
1. Commission per booking (10-20%)
2. Featured listing/promotion
3. Subscription tiers for artisans
4. Lead generation fees
5. Premium verification badges
6. Advertising from related businesses
```

**Artisan Subscription Tiers:**
```
FREE TIER:
- Basic profile
- Up to 5 portfolio items
- Standard search placement
- 20% commission

PROFESSIONAL (₹999/month):
- Enhanced profile
- Unlimited portfolio
- Priority in search
- 15% commission
- Analytics dashboard
- Booking calendar sync

PREMIUM (₹2499/month):
- All Professional features
- Featured placement
- 10% commission
- Dedicated support
- Custom booking page URL
- API access for website integration
```

### 4.2 Admin & Operations

**Admin Dashboard Enhancement:**
- [ ] Revenue analytics
- [ ] User growth metrics
- [ ] Booking analytics
- [ ] Category performance
- [ ] Geographic heat maps
- [ ] Support ticket system
- [ ] Content moderation queue
- [ ] Fraud alerts dashboard
- [ ] Payout management
- [ ] Fee configuration

**Operations Tools:**
- [ ] Bulk email/notification sending
- [ ] A/B testing framework
- [ ] Feature flags system
- [ ] Maintenance mode
- [ ] Database backup monitoring
- [ ] Performance monitoring dashboard

### 4.3 API & Integrations

**Third-Party Integrations:**
- [ ] WhatsApp Business API
- [ ] Google Calendar API
- [ ] Instagram portfolio import
- [ ] Facebook business page sync
- [ ] Accounting software (Tally, Zoho)
- [ ] CRM integrations

**Public API:**
- [ ] API documentation (Swagger)
- [ ] API key management
- [ ] Rate limiting per key
- [ ] Webhook notifications
- [ ] OAuth2 for partners

### 4.4 Mobile App

**React Native App:**
- [ ] iOS and Android apps
- [ ] Push notification deep linking
- [ ] Offline mode for viewing
- [ ] Biometric authentication
- [ ] Native payment integration
- [ ] Camera for portfolio uploads
- [ ] Location services

---

## PHASE 5: Advanced Features (16-24 weeks)

### 5.1 AI & Automation

**Smart Features:**
- [ ] AI-powered service recommendations
- [ ] Automated pricing suggestions
- [ ] Chatbot for common queries
- [ ] Image quality analysis for portfolios
- [ ] Sentiment analysis on reviews
- [ ] Demand prediction for artisans
- [ ] Smart scheduling optimization

### 5.2 Multi-Language & Localization

**i18n Implementation:**
- [ ] Hindi language support
- [ ] Regional language support (Marathi, Tamil, etc.)
- [ ] RTL support where needed
- [ ] Currency localization
- [ ] Date/time format localization
- [ ] Localized email templates

### 5.3 Community Features

**Artisan Community:**
- [ ] Artisan forums/groups
- [ ] Skill sharing/mentorship
- [ ] Collaborative projects
- [ ] Events/workshops listing
- [ ] Success stories showcase
- [ ] Artisan of the month

### 5.4 Enterprise Features

**For Large Organizations:**
- [ ] Corporate accounts
- [ ] Bulk booking management
- [ ] Invoice consolidation
- [ ] Dedicated account manager
- [ ] Custom reporting
- [ ] SLA guarantees

---

## Technical Architecture Improvements

### Backend Improvements

**Database Optimization:**
```javascript
// Implement read replicas
// Add caching layer (Redis already integrated)
// Implement database sharding strategy
// Add full-text search with Elasticsearch
```

**API Improvements:**
```javascript
// GraphQL API option
// API versioning (/api/v1/, /api/v2/)
// Request/response compression
// ETags for caching
// Pagination standardization
```

**Infrastructure:**
```
- Kubernetes deployment
- Auto-scaling configuration
- CDN for static assets
- Database connection pooling
- Queue system for heavy tasks (Bull/BullMQ)
- Microservices extraction (payments, notifications)
```

### Frontend Improvements

**Performance:**
```javascript
// Code splitting by route
// Image lazy loading (already using Cloudinary)
// Service worker optimization
// Bundle size analysis and reduction
// Server-side rendering (Next.js migration option)
```

**State Management:**
```javascript
// Consider React Query for server state
// Zustand or Jotai for client state
// Optimistic updates for better UX
```

**Testing:**
```javascript
// Unit tests for utilities
// Component tests with React Testing Library
// Integration tests for user flows
// Visual regression testing
```

---

## Business Logic Improvements

### Booking Flow Optimization

**Current Flow:**
```
User → Browse → Book → Pay → Service → Done
```

**Improved Flow:**
```
User → Browse → Favorite → Request Quote (optional)
                      ↓
              → Book (instant or request)
                      ↓
              → Artisan Confirms/Suggests Changes
                      ↓
              → User Confirms → Pay (full or deposit)
                      ↓
              → Reminders (24h, 1h before)
                      ↓
              → Service Delivered
                      ↓
              → Auto-request Review → User Reviews
                      ↓
              → Artisan Paid (after review window)
```

### Pricing Strategies

**Dynamic Pricing:**
- Peak hours pricing
- Weekend/holiday rates
- Last-minute discounts
- Early bird pricing
- Distance-based pricing for home visits

**Service Packages:**
- Single service
- Package deals (3 sessions, 5 sessions)
- Subscription services (monthly maintenance)
- Custom quotes for complex work

### Quality Control

**Artisan Onboarding:**
```
1. Application submission
2. Document verification
3. Portfolio review
4. Sample work evaluation (optional)
5. Training/orientation
6. Probation period with monitoring
7. Full activation
```

**Ongoing Quality:**
- Monthly rating threshold (4.0+ to stay listed)
- Response time monitoring
- Cancellation rate tracking
- Customer complaint handling
- Mystery shopper program

---

## Metrics to Track

### Business Metrics
- Monthly Active Users (MAU)
- Booking conversion rate
- Average booking value
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Net Promoter Score (NPS)
- Artisan retention rate
- Platform take rate

### Technical Metrics
- API response time (p50, p95, p99)
- Error rate
- Uptime percentage
- Database query performance
- Cache hit rate
- Page load time
- Core Web Vitals

---

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | 4-6 weeks | Bug fixes, security, code quality |
| Phase 2 | 6-8 weeks | Core feature completion |
| Phase 3 | 8-12 weeks | Business features |
| Phase 4 | 12-16 weeks | Scale & monetization |
| Phase 5 | 16-24 weeks | Advanced features |

**Total estimated time to full platform:** 12-18 months

---

## Immediate Next Steps (This Week)

1. **Fix Critical Bugs**
   - MessagesPage ChatContext crash
   - Implement Bookings page stub

2. **Security Audit**
   - Fix XSS vulnerability
   - Fix ReDoS vulnerability

3. **Set Up Testing**
   - Configure Jest
   - Write first auth tests

4. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - Deployment documentation

---

## Resources Needed

### Development Team (Ideal)
- 2 Full-stack developers
- 1 Frontend specialist (React)
- 1 Backend specialist (Node.js)
- 1 DevOps engineer (part-time)
- 1 QA engineer
- 1 UI/UX designer (part-time)

### Infrastructure Costs (Monthly Estimate)
```
Render/Railway backend: ₹2,000-5,000
MongoDB Atlas: ₹0-3,000 (free tier to M10)
Cloudinary: ₹0-2,000
Algolia: ₹0-5,000
Stream Chat: ₹0-8,000
Daily.co: ₹0-5,000
OneSignal: Free for basic
Sentry: ₹0-3,000
Domain + SSL: ₹1,000/year
---
Total: ₹5,000-31,000/month
```
