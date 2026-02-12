---
phase: 02-refund-support
plan: 03
subsystem: admin-ui
tags: [admin, refunds, ui, react]
completed: 2026-02-13

dependency_graph:
  requires:
    - Admin authentication
    - Refund backend endpoints (02-01)
    - AdminPayments component pattern
  provides:
    - AdminRefunds UI component
    - Refund management interface
    - Admin refund workflow
  affects:
    - Admin panel navigation
    - Admin UX consistency

tech_stack:
  added:
    - React hooks (useState, useEffect, useCallback)
    - AdminRefunds page component
  patterns:
    - Consistent admin page pattern (stats/filters/table/pagination/modal)
    - Non-blocking stats fetch
    - Confirm-before-action pattern
    - Inline reject form pattern

key_files:
  created:
    - kalasetu-frontend/src/pages/admin/AdminRefunds.jsx
  modified:
    - kalasetu-frontend/src/App.jsx
    - kalasetu-frontend/src/components/admin/AdminLayout.jsx

decisions:
  - key: inline-reject-form
    choice: Show reject reason textarea in detail modal instead of separate modal
    rationale: Simpler UX, fewer clicks, follows form-in-modal pattern
    alternatives: [Separate reject modal, Alert prompt with input]

  - key: confirm-approve-only
    choice: Confirmation dialog for approve, reject requires reason in modal
    rationale: Approve is immediate and critical (triggers Razorpay), reject needs reason anyway
    alternatives: [Confirm both, Confirm neither]

  - key: status-badge-colors
    choice: Amber (pending), Blue (approved/processing), Green (processed), Red (rejected/failed)
    rationale: Matches payment status colors, consistent with AdminPayments pattern
    alternatives: [Different color scheme, Custom brand colors]

  - key: refunds-menu-position
    choice: Place Refunds between Payments and Bookings in sidebar
    rationale: Logical grouping (Payments → Refunds → Bookings), refunds are payment-related
    alternatives: [After Bookings, Separate section]

metrics:
  duration: 209s
  tasks: 2
  files_created: 1
  files_modified: 2
  commits: 2
  loc_added: ~600
---

# Phase 02 Plan 03: Admin Refund UI Summary

**One-liner:** Complete admin refund management UI with stats, filters, table, detail modal, and approve/reject actions following AdminPayments pattern.

## Objective

Build the admin panel UI for managing refund requests, providing admins with visual tools to review, approve, and reject refund requests from users. This connects the refund backend (plan 02-01) with an intuitive admin interface following existing admin panel patterns for consistency.

## What Was Built

### Task 1: AdminRefunds.jsx Page Component
- **Complete page component** matching AdminPayments.jsx structure with stats cards, filters, table, pagination, and modal
- **Stats cards** (5 cards): Total Requests, Pending (amber), Processing (blue), Processed (green with amount), Rejected (red)
- **Filters section**:
  - Search input for payment ID, user name, or email
  - Status dropdown: all, pending, approved, processing, processed, rejected, failed
  - Start date and End date inputs for date range filtering
  - Clear filters button
- **Table columns**: ID (truncated), Requester (name + email), Payment ID, Amount (formatted INR), Status (badge), Requested Date, Actions
- **Loading skeletons** using `SKELETON_ROWS` constant
- **Empty state** when no refunds found
- **Error handling** with retry button
- **Pagination** using `getPaginationRange` helper
- **Detail modal** with:
  - Full refund information (ID, status, requester, payment ID, amount, reason, evidence)
  - Admin response display (if exists)
  - Razorpay refund ID (if processed)
  - Failure reason (if failed)
  - Approve/Reject buttons (only for pending status)
  - Inline reject form with textarea for reason
- **Actions**:
  - View details (Eye icon, always visible)
  - Approve (CheckCircle icon, pending only, confirmation required)
  - Reject (XCircle icon, pending only, shows reason form in modal)
- **API integration**:
  - GET `/api/admin/refunds` with pagination, filters, search
  - GET `/api/admin/refunds/stats` for stats cards
  - POST `/api/admin/refunds/:id/approve` for approval
  - POST `/api/admin/refunds/:id/reject` with reason for rejection
- **Brand colors** used for primary elements (brand-500/brand-700)
- **Status badges** with semantic colors matching AdminPayments
- **useCallback** hook to fix ESLint exhaustive-deps warning
- **Icons from lucide-react**: Search, Eye, RefreshCcw, AlertTriangle, CheckCircle, XCircle, X

### Task 2: Mount AdminRefunds Route in Admin Panel
- **Import added** to App.jsx: `import AdminRefunds from './pages/admin/AdminRefunds';`
- **Route mounted** at `/admin/refunds` in admin Routes section (between payments and bookings)
- **Sidebar menu item** added to AdminLayout:
  - Name: "Refunds"
  - Icon: RefreshCcw
  - Path: `/admin/refunds`
  - Permission: `['payments', 'refund']` (reuses existing permission from backend)
  - Position: Between Payments and Bookings for logical grouping
- **Navigation** enabled via sidebar link

## Deviations from Plan

None - plan executed exactly as written.

## Implementation Highlights

**Inline Reject Form:**
Instead of a separate modal or alert prompt, the reject form appears inline in the detail modal:
```jsx
{showRejectForm && selectedRefund.status === 'pending' && (
  <div className="border-t border-gray-200 pt-4">
    <textarea
      value={rejectReason}
      onChange={(e) => setRejectReason(e.target.value)}
      placeholder="Enter reason for rejection..."
      rows={4}
    />
  </div>
)}
```

**Confirmation for Approve Only:**
Approve action shows window.confirm (immediate Razorpay call), reject requires reason input (no separate confirmation needed since reason is deliberate):
```jsx
const handleApprove = async (id) => {
  if (!window.confirm('Are you sure you want to approve this refund request? This will initiate a refund via Razorpay.')) return;
  // ... proceed with approval
};
```

**Non-blocking Stats Fetch:**
Stats fetch errors don't block main table or show error UI (stats are optional):
```jsx
const fetchStats = async () => {
  try {
    const response = await api.get('/api/admin/refunds/stats');
    if (response.data.success) {
      setStats(response.data.data);
    }
  } catch {
    // Non-critical error - stats are optional
  }
};
```

**Status Badge Mapping:**
```jsx
const badgeClasses = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  processed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800'
};
```

**useCallback for fetchRefunds:**
Used `useCallback` to wrap `fetchRefunds` and include it in useEffect dependencies without causing infinite loop:
```jsx
const fetchRefunds = useCallback(async () => {
  // ... fetch logic
}, [page, status, startDate, endDate, search]);

useEffect(() => {
  fetchRefunds();
  fetchStats();
}, [fetchRefunds]);
```

## Testing Notes

**Manual verification needed:**
1. Admin can access /admin/refunds via sidebar link
2. Stats cards display correct counts and amounts
3. Table displays refund requests with correct data
4. Filters work (search, status, date range)
5. Pagination works correctly
6. View details modal shows full refund information
7. Approve action shows confirmation and calls API
8. Reject action shows reason form and requires input
9. Loading states display during API calls
10. Error states display on API failures with retry button
11. Empty state shows when no refunds found

**Edge cases handled:**
- Stats fetch failure doesn't block table
- Empty refunds list shows appropriate message
- Pending refunds show approve/reject actions
- Non-pending refunds only show view action
- Reject requires non-empty reason
- Modal closes after successful action
- Pagination disabled when on first/last page

## UI/UX Consistency

**Follows AdminPayments.jsx pattern:**
- Same layout structure (stats → filters → table → pagination)
- Same Tailwind classes for consistency
- Same card styling (`bg-white rounded-xl shadow-sm border`)
- Same table styling with hover states
- Same pagination UI with Previous/Next buttons
- Same modal overlay pattern
- Same loading skeleton pattern
- Same error banner with retry button
- Same empty state message

**Brand color usage:**
- Primary actions: brand-500/brand-700 (view details links, focus rings)
- Status badges: Semantic colors (amber/blue/green/red)
- Sidebar active state: brand-500
- Tables/cards: Neutral grays

## Performance Considerations

- **useCallback** prevents unnecessary fetchRefunds recreation
- **Loading skeletons** provide immediate feedback
- **Pagination** limits data transfer (10 items per page)
- **Non-blocking stats** prevent UI blocking on stats failures
- **Lean queries** expected from backend (populated refs)

## Security Notes

- Authorization: Admin authentication required via AdminAuthProvider
- Permission: Uses existing `payments.refund` permission (no new permissions needed)
- CSRF: Protected by admin_token HTTP-only cookie
- XSS: React auto-escapes all displayed data
- Confirmation: Approve action requires explicit confirmation

## Self-Check

**PASSED**

Files created:
- ✓ kalasetu-frontend/src/pages/admin/AdminRefunds.jsx (595 lines)

Files modified:
- ✓ kalasetu-frontend/src/App.jsx (AdminRefunds import and route)
- ✓ kalasetu-frontend/src/components/admin/AdminLayout.jsx (Refunds menu item)

Commits exist:
- ✓ c3952be: feat(02-03): add AdminRefunds page component
- ✓ 20c2a5c: feat(02-03): mount AdminRefunds route in admin panel

ESLint verification:
- ✓ No errors in AdminRefunds.jsx
- ✓ No errors in App.jsx
- ✓ No errors in AdminLayout.jsx

API endpoints called:
- ✓ GET /api/admin/refunds (list with filters)
- ✓ GET /api/admin/refunds/stats (stats cards)
- ✓ POST /api/admin/refunds/:id/approve (approve action)
- ✓ POST /api/admin/refunds/:id/reject (reject action)

## Next Steps

1. **Manual testing**: Login as admin, test refund management flow end-to-end
2. **Backend integration**: Ensure backend endpoints from 02-01 are deployed and working
3. **User-facing refund UI** (Plan 02-04): User refund request form and refund list page
4. **E2E testing**: Test complete refund flow (user request → admin approve → webhook → email)
5. **Monitoring**: Add analytics for admin refund actions

## Notes

- No new dependencies added (all libraries already installed)
- Follows existing admin panel patterns for consistency
- Uses same constants (DEFAULT_PAGE_SIZE, SKELETON_ROWS, getPaginationRange)
- Reuses existing permission (`payments.refund`) from backend
- All API calls have proper error handling
- Modal UX simplified with inline reject form instead of nested modals
- Duration: 209 seconds (~3.5 minutes)
