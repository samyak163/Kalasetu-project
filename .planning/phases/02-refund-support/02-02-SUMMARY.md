---
phase: 02-refund-support
plan: 02
subsystem: support-tickets
tags: [backend, tickets, admin, email, notifications]
dependency_graph:
  requires: [02-01]
  provides: [support-ticket-api, admin-ticket-management]
  affects: [userAuthController, adminDashboard]
tech_stack:
  added: [zod-validation]
  patterns: [embedded-messages, auto-generated-ids, dynamic-imports, non-blocking-notifications]
key_files:
  created:
    - kalasetu-backend/models/supportTicketModel.js
    - kalasetu-backend/controllers/supportController.js
    - kalasetu-backend/routes/supportRoutes.js
  modified:
    - kalasetu-backend/controllers/userAuthController.js
    - kalasetu-backend/controllers/adminDashboardController.js
    - kalasetu-backend/routes/adminRoutes.js
    - kalasetu-backend/utils/email.js
    - kalasetu-backend/server.js
decisions:
  - decision: "Use embedded messages array instead of separate Message collection"
    rationale: "Ticket conversations are typically short (<100 messages per research); embedding simplifies queries and ensures atomic updates"
  - decision: "Dynamic import SupportTicket in userAuthController stubs"
    rationale: "Avoids circular dependency issues in large controller file with many existing imports"
  - decision: "Filter internal notes from user-facing getTicketById"
    rationale: "Admins need internal discussion capability without exposing sensitive context to users"
  - decision: "Use 'users' permission for support ticket admin routes"
    rationale: "No dedicated 'support' permission exists; user management permission is semantically appropriate"
metrics:
  duration: 320s
  completed: 2026-02-13
---

# Phase 02 Plan 02: Support Ticket System Summary

**One-liner:** Complete support ticket backend with embedded messages, user/admin APIs, stub wiring, and multi-channel notifications.

## What Was Built

### User-Facing Support API
- **SupportTicket Model**: Mongoose schema with embedded messages, auto-generated ticket numbers (TKT-{timestamp}-{count}), and compound indexes for efficient querying
- **User Endpoints**:
  - `POST /api/support` - Create ticket with Zod validation (subject 3-200 chars, description 10-5000 chars)
  - `GET /api/support` - List user's tickets with pagination and status filter, excluding messages for performance
  - `GET /api/support/:id` - View single ticket with ownership check, internal notes filtered out
  - `POST /api/support/:id/messages` - Add message with 100-message soft limit and closed-ticket prevention
- **Stub Wiring**: Replaced `contactSupport` and `reportIssue` stubs in userAuthController with real ticket creation using dynamic imports

### Admin Ticket Management
- **Admin Endpoints**:
  - `GET /api/admin/support/tickets` - List with pagination, search (ticketNumber/subject/userName/userEmail), and multi-filter (status/category/priority/assignedTo)
  - `GET /api/admin/support/tickets/stats` - Aggregate counts by status, category, and actionable priority
  - `POST /api/admin/support/tickets/:id/respond` - Add response with internal note toggle, auto-assignment, and status transition from open→in_progress
  - `PATCH /api/admin/support/tickets/:id/status` - Change status with resolvedAt/closedAt tracking and system message logging
- **Permission Model**: All routes use `checkPermission('users', 'view')` since no dedicated support permission exists

### Notification System
- **Multi-Channel**: Email (sendTicketResponseEmail, sendTicketStatusEmail), in-app Notification documents, and OneSignal push notifications
- **Non-Blocking**: All notification sends wrapped in try/catch to prevent critical path failures
- **Triggers**: Ticket creation (user notification), admin response (if not internal note), status change (resolved/closed)

### Email Templates
- **sendTicketResponseEmail**: Brand-colored (#A55233) header, ticket info box, admin response in highlight box, CTA to view ticket
- **sendTicketStatusEmail**: Status-specific header color (resolved: green, closed: gray), status badge, conditional CTA based on finality

## Deviations from Plan

None - plan executed exactly as written.

## Key Implementation Details

### Ticket Number Generation
Pre-save hook generates unique ticket numbers using `TKT-{Date.now()}-{padded count}` pattern. Only sets if `!this.ticketNumber`, allowing manual override if needed.

### Message Ownership
Both user-facing and admin endpoints track sender info in embedded message schema:
```javascript
sender: {
  senderId: ObjectId,
  senderModel: 'User' | 'Artisan' | 'Admin',
  senderName: String
}
```

### Internal Notes
Admin can set `internal: true` on messages. User-facing `getTicketById` filters these out:
```javascript
filteredTicket.messages = filteredTicket.messages.filter(msg => !msg.internal);
```

### Status Transitions
- User creates ticket → status: 'open'
- Admin responds → status: 'in_progress' (if currently 'open')
- Admin explicitly sets status → 'resolved' or 'closed' (sets resolvedAt/closedAt and closedBy)

### Search Implementation
Admin list endpoint uses `escapeRegex()` helper to prevent NoSQL injection in regex queries, matching across ticketNumber, subject, createdBy.userName, and createdBy.userEmail.

## Testing Notes

### Manual Verification Performed
- ✅ Model loads without errors: `node -e "import('./kalasetu-backend/models/supportTicketModel.js')"`
- ✅ Controller exports 5 functions: createTicket, getUserTickets, getTicketById, addMessage, createTicketFromStub
- ✅ Routes mounted at /api/support in server.js
- ✅ Stubs replaced (no remaining TODO comments except unrelated getOrders)
- ✅ Admin functions exported: getAllSupportTickets, getSupportTicketsStats, respondToTicket, updateTicketStatus
- ✅ Admin routes mounted at /api/admin/support/tickets
- ✅ Email templates exported: sendTicketResponseEmail, sendTicketStatusEmail

### Recommended E2E Tests
- User creates ticket → verify ticketNumber generated and in-app notification created
- User lists tickets → verify pagination and status filter
- User views ticket → verify internal notes excluded
- User adds message → verify 100-message limit and closed-ticket check
- Admin lists tickets → verify search and multi-filter
- Admin responds → verify status transition and user notification
- Admin closes ticket → verify closedAt set and user email sent

## Files Modified

### Created (3 files)
- `kalasetu-backend/models/supportTicketModel.js` (81 lines) - Schema with embedded messages and auto-ticketNumber
- `kalasetu-backend/controllers/supportController.js` (210 lines) - User-facing ticket CRUD
- `kalasetu-backend/routes/supportRoutes.js` (13 lines) - User ticket endpoints

### Modified (5 files)
- `kalasetu-backend/controllers/userAuthController.js` - Replaced contactSupport and reportIssue stubs with real ticket creation
- `kalasetu-backend/controllers/adminDashboardController.js` (+271 lines) - Added 4 admin ticket functions
- `kalasetu-backend/routes/adminRoutes.js` (+8 lines) - Mounted admin support routes
- `kalasetu-backend/utils/email.js` (+143 lines) - Added 2 ticket email templates
- `kalasetu-backend/server.js` (+2 lines) - Imported and mounted supportRoutes

## Commits

- **a1cbb4c**: feat(02-02): implement support ticket system with user endpoints and stub wiring
- **8f89b40**: feat(02-02): implement admin support ticket management and email notifications

## Next Steps

Plan 02-03 (if exists) will likely build the frontend UI for support tickets. Plan 02-04 (if exists) may handle integration with refund requests (relatedEntities.refundRequest already supported in schema).

## Self-Check: PASSED

All created files exist:
- ✅ kalasetu-backend/models/supportTicketModel.js
- ✅ kalasetu-backend/controllers/supportController.js
- ✅ kalasetu-backend/routes/supportRoutes.js

All commits exist:
- ✅ a1cbb4c
- ✅ 8f89b40

All functions verified via node imports. No blockers. Ready for phase continuation.
