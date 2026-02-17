# Phase 2: Detailed Scope

> **Status:** Planning
> **Depends on:** Phase 1 complete
> **Estimated tasks:** 35-45 items

---

## Task Categories

### 1. Booking System Enhancement

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 1.1 | Add booking approval workflow (artisan accept/reject with response) | P0 | High |
| 1.2 | Implement calendar-based availability UI component | P0 | High |
| 1.3 | Add booking modification request flow | P1 | Medium |
| 1.4 | Add cancellation with reason tracking | P1 | Medium |
| 1.5 | Add rescheduling functionality | P1 | Medium |
| 1.6 | Implement booking reminders (email + push, 24h/1h) | P1 | Medium |
| 1.7 | Add booking history page with filtering | P1 | Medium |
| 1.8 | Update booking model with new fields | P0 | Low |

### 2. Payment System Completion

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 2.1 | Implement full refund flow (request -> review -> process) | P0 | High |
| 2.2 | Add partial refund support | P1 | Medium |
| 2.3 | Create transaction history page | P0 | Medium |
| 2.4 | Add payment receipts (downloadable) | P1 | Medium |
| 2.5 | Generate invoice PDF | P2 | High |
| 2.6 | Payment status tracking UI | P1 | Low |

### 3. Review System Enhancement

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 3.1 | Add verified purchase badge to reviews | P1 | Low |
| 3.2 | Implement photo reviews (upload images with review) | P1 | Medium |
| 3.3 | Add artisan response to reviews | P1 | Medium |
| 3.4 | Add review reporting/flagging from users | P2 | Low |
| 3.5 | Automated review request after booking completion | P2 | Medium |

### 4. Messaging Integration

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 4.1 | Auto-create chat channel on booking confirmation | P0 | Medium |
| 4.2 | Booking-specific chat channels (linked to booking) | P1 | Medium |
| 4.3 | File/image sharing in chat | P2 | Medium |
| 4.4 | Automated messages (booking confirmed, reminder, completed) | P1 | Medium |
| 4.5 | Block/report user in chat | P2 | Medium |

### 5. Video Call Scheduling

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 5.1 | Schedule video call linked to booking | P1 | Medium |
| 5.2 | Video call reminders (push + email) | P2 | Medium |
| 5.3 | Post-call notes feature | P2 | Low |

### 6. Dashboard Improvements

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 6.1 | Artisan booking calendar view | P0 | High |
| 6.2 | Artisan earnings chart (weekly/monthly) | P1 | Medium |
| 6.3 | Customer upcoming bookings view | P1 | Medium |
| 6.4 | Customer spending history | P2 | Medium |
| 6.5 | In-app notification center (bell icon + feed) | P0 | High |

---

## Data Model Changes

### Booking Model Additions
```javascript
cancellationReason: String,
cancellationRequestedBy: { type: ObjectId },
rescheduledFrom: { type: ObjectId, ref: 'Booking' },
modificationRequest: {
  requestedChanges: Object,
  status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  requestedAt: Date
},
remindersSent: [{
  type: { type: String, enum: ['email', 'push'] },
  sentAt: Date
}],
chatChannelId: String,
videoCallId: String
```

### Review Model Additions
```javascript
photos: [String],
artisanResponse: {
  text: String,
  respondedAt: Date
},
isVerifiedPurchase: Boolean,
reports: [{
  reportedBy: ObjectId,
  reason: String,
  reportedAt: Date
}]
```

---

## New API Endpoints

```
POST   /api/bookings/:id/approve
POST   /api/bookings/:id/reject
POST   /api/bookings/:id/modify
POST   /api/bookings/:id/reschedule
POST   /api/bookings/:id/reminder
GET    /api/bookings/history
POST   /api/payments/:id/refund
GET    /api/payments/history
GET    /api/payments/invoice/:id
POST   /api/reviews/:id/respond
POST   /api/reviews/:id/report
POST   /api/reviews/:id/photos
GET    /api/notifications (in-app notification feed)
PATCH  /api/notifications/:id/read
```

---

## Definition of Done (Phase 2)

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] 70%+ of P2 tasks completed
- [ ] All new endpoints have tests
- [ ] Demo script can be executed without errors
- [ ] Git tag `phase-2-marketplace` created
- [ ] Vercel deployment verified

---

*Last updated: 2026-02-17*
