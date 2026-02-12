---
phase: 02-refund-support
plan: 01
subsystem: refund-system
tags: [refunds, admin, razorpay, webhooks, email]
completed: 2026-02-13

dependency_graph:
  requires:
    - Payment model
    - Razorpay integration
    - Email service
    - Admin authentication
  provides:
    - RefundRequest model
    - User refund endpoints
    - Admin refund management
    - Webhook refund handlers
    - Refund email notifications
  affects:
    - Payment workflow
    - Admin dashboard
    - User experience

tech_stack:
  added:
    - Zod validation for refund requests
    - Mongoose RefundRequest schema
  patterns:
    - Cumulative refund validation
    - Non-blocking notifications
    - Webhook event handling
    - Dynamic model imports

key_files:
  created:
    - kalasetu-backend/models/refundRequestModel.js
    - kalasetu-backend/controllers/refundController.js
    - kalasetu-backend/routes/refundRoutes.js
  modified:
    - kalasetu-backend/server.js
    - kalasetu-backend/controllers/adminDashboardController.js
    - kalasetu-backend/controllers/paymentController.js
    - kalasetu-backend/routes/adminRoutes.js

decisions:
  - key: cumulative-refund-check
    choice: Query all non-final refunds and sum amounts before allowing new request
    rationale: Prevents over-refunding when multiple partial refunds exist
    alternatives: [Track single refund amount in Payment model, Allow over-refund]

  - key: immediate-processing-on-approval
    choice: Skip 'approved' state and go directly to 'processing' after admin approval
    rationale: Refund is initiated immediately via Razorpay API call
    alternatives: [Two-step approval, Batch processing]

  - key: non-blocking-notifications
    choice: Wrap all email/push/in-app notifications in try/catch
    rationale: Critical path (refund approval/webhook) should never fail due to notification errors
    alternatives: [Queue notifications, Block on notification failure]

  - key: dynamic-model-imports
    choice: Use dynamic imports for User/Artisan models in webhook handlers
    rationale: Avoids circular dependencies; allows polymorphic requestedBy field
    alternatives: [Static imports with careful ordering, Separate tables]

metrics:
  duration: 296s
  tasks: 2
  files_created: 3
  files_modified: 4
  commits: 2
  loc_added: ~850
---

# Phase 02 Plan 01: Refund Request Backend Summary

**One-liner:** Complete refund request system with user-facing API, admin approval workflow, Razorpay integration, webhook handlers, and multi-channel notifications.

## Objective

Build the complete refund request backend enabling users to request refunds for captured payments with admin oversight, preventing refund abuse while providing customer recourse. This implements the STUB-01 requirement from the roadmap.

## What Was Built

### Task 1: RefundRequest Model + User-Facing API
- **RefundRequest Mongoose schema** with polymorphic requestedBy (User/Artisan), status enum (pending → approved/rejected → processing → processed/failed), admin response, evidence attachments, and Razorpay integration fields
- **Compound indexes** on `{status, createdAt}`, `{payment, status}`, `{requestedBy, createdAt}` for query performance
- **createRefundRequest endpoint** with Zod validation, payer authorization check, payment status validation, and cumulative refund check (prevents requesting more than payment amount across multiple refunds)
- **getUserRefundRequests endpoint** with pagination, status filter, and payment population
- **getRefundRequestById endpoint** with authorization check and full population (payment, booking, requester, admin)
- **Routes mounted** at `/api/refunds` with `protectAny` middleware (supports both User and Artisan accounts)

### Task 2: Admin Refund Management + Webhooks + Notifications
- **getAllRefundRequests** with pagination, status filter, date range, and search by payment ID (uses same pattern as other admin controllers with `escapeRegex`)
- **getRefundRequestsStats** using aggregation to get counts by status and total amounts (pending, processing, processed)
- **approveRefundRequest** that: validates pending status, sets admin response, calls `refundPayment()` Razorpay API, stores razorpayRefundId, sends email/in-app/push notifications (all non-blocking), handles Razorpay failures by marking as 'failed'
- **rejectRefundRequest** that: requires admin reason, sets admin response, sends notifications
- **Admin routes** mounted at `/api/admin/refunds/*` using existing `payments.refund` permission
- **Webhook handlers** updated:
  - `refund.created` → updates RefundRequest to 'processed', sends "refund processed" notifications
  - `refund.failed` → updates RefundRequest to 'failed', sends "refund failed" notifications
- **Email templates** for all refund states: approved, rejected, processed, failed (using brand color #A55233, responsive HTML, CTA buttons)
- **Non-blocking notifications** via helper functions that wrap email/push/in-app in try/catch to prevent critical path failures

## Deviations from Plan

None - plan executed exactly as written.

## Implementation Highlights

**Cumulative Refund Check:**
```javascript
const existingRefunds = await RefundRequest.find({
  payment: paymentId,
  status: { $in: ['pending', 'approved', 'processing', 'processed'] }
});
const totalExistingRefunds = existingRefunds.reduce((sum, refund) => sum + refund.amount, 0);
if (amount + totalExistingRefunds > payment.amount) {
  return res.status(400).json({ message: 'Refund amount exceeds available balance' });
}
```

**Immediate Razorpay Call on Approval:**
Admin approval directly calls Razorpay and sets status to 'processing' (not 'approved'). If Razorpay fails, status is set to 'failed' with error message.

**Dynamic Model Imports in Webhooks:**
Avoids circular dependencies by dynamically importing User/Artisan models:
```javascript
const RequesterModel = refundRequest.requestedByModel === 'User'
  ? (await import('../models/userModel.js')).default
  : (await import('../models/artisanModel.js')).default;
```

**Polymorphic Schema Pattern:**
```javascript
requestedBy: { type: ObjectId, refPath: 'requestedByModel' },
requestedByModel: { type: String, enum: ['User', 'Artisan'] }
```

## Testing Notes

**Manual verification needed:**
1. User can create refund request for captured payment
2. Cumulative refund check prevents over-refunding
3. Admin can list, filter, search refund requests
4. Admin can approve request (triggers Razorpay API)
5. Admin can reject request with reason
6. Webhook events update status to processed/failed
7. Email notifications sent on all status changes
8. In-app notifications created for all status changes
9. Notifications don't block critical path (try/catch)

**Edge cases handled:**
- Only payer can request refund
- Only captured payments can be refunded
- Multiple partial refunds tracked cumulatively
- Razorpay API failures handled gracefully
- Notification failures don't crash webhook handler
- Admin must provide rejection reason

## Performance Considerations

- **Indexes:** Compound indexes on commonly queried fields (status, createdAt, payment, requestedBy)
- **Aggregation:** Stats endpoint uses MongoDB aggregation instead of loading all documents
- **Lean queries:** Webhook handlers use `.lean()` for read-only operations
- **Non-blocking notifications:** All notification sends are fire-and-forget with error handling

## Security Notes

- Authorization: Only payer can request refund, only requester can view details
- Admin permission: Uses existing `payments.refund` permission (no new permissions needed)
- Webhook verification: Signature verification prevents fake refund events
- Validation: Zod schema validates all user input
- NoSQL injection: Uses `escapeRegex()` for search inputs

## Self-Check

✓ **PASSED**

Files created:
- ✓ kalasetu-backend/models/refundRequestModel.js
- ✓ kalasetu-backend/controllers/refundController.js
- ✓ kalasetu-backend/routes/refundRoutes.js

Files modified:
- ✓ kalasetu-backend/server.js (refundRoutes import and mount)
- ✓ kalasetu-backend/controllers/adminDashboardController.js (4 new functions + helpers)
- ✓ kalasetu-backend/controllers/paymentController.js (webhook handlers updated)
- ✓ kalasetu-backend/routes/adminRoutes.js (4 new routes)

Commits exist:
- ✓ 45b0994: feat(02-01): add RefundRequest model and user-facing refund endpoints
- ✓ 073f916: feat(02-01): add admin refund management and webhook handlers

Exports verified:
- ✓ RefundRequest model loads without errors
- ✓ refundController exports all 3 functions
- ✓ adminDashboardController exports all 4 new functions
- ✓ Routes mounted correctly

## Next Steps

1. **Frontend UI** (Plan 02): User refund request form, refund list page, admin refund management panel
2. **Testing**: Write integration tests for refund flow (user request → admin approve → webhook → email)
3. **Monitoring**: Add Sentry alerts for refund failures
4. **Documentation**: Update API docs with refund endpoints

## Notes

- No new dependencies added (all libraries already installed)
- Follows existing patterns from Payment and Booking controllers
- Email templates use brand color #A55233 consistently
- All notification errors logged but don't throw
- Webhook handlers are idempotent (check for existing refund before processing)
