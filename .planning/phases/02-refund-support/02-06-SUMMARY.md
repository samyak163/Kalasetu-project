---
phase: 02-refund-support
plan: 06
subsystem: user-experience
tags: [ui, support, ux, gap-closure]
dependency_graph:
  requires: ["02-02", "02-04"]
  provides: ["Enhanced help/support UI with category templates and ticket tracking"]
  affects: ["User profile page support workflow"]
tech_stack:
  added: ["lucide-react icons (Calendar, CreditCard, RotateCcw, UserIcon, AlertTriangle, HelpCircle, X, ChevronDown, Clock, MessageSquare)"]
  patterns: ["Category quick-pick pattern", "Inline expandable detail view", "Brand token consistency"]
key_files:
  created: []
  modified:
    - path: "kalasetu-frontend/src/components/profile/tabs/HelpSupportTab.jsx"
      changes: "Complete redesign with My Tickets section, 6 category cards, pre-filled forms, fixed API paths, brand tokens"
decisions:
  - summary: "Category-first help flow reduces friction compared to blank form"
    rationale: "Users don't have to think about subject/priority — click category, describe issue. Industry standard pattern (GitHub issues, Zendesk)."
  - summary: "My Tickets shows top 5 tickets inline, not separate page"
    rationale: "Users primarily need quick status check, not full ticket management. Dedicated ticket page would be over-engineering for v2 scope."
  - summary: "Silent fail on ticket fetch"
    rationale: "Non-critical feature — if tickets fail to load, rest of help tab (categories, FAQs) remains functional. Sentry will track failures."
  - summary: "Replace hardcoded hex with brand tokens"
    rationale: "Consistency with rest of codebase after v1 overhaul. Enables future theme changes without search-and-replace."
metrics:
  duration: 156
  tasks_completed: 1
  files_modified: 1
  commits: 1
  completed_at: "2026-02-13"
---

# Phase 02 Plan 06: Enhanced Help Support Tab Summary

**One-liner:** Category quick-pick cards with My Tickets tracking and fixed API paths replacing blank support form.

## What Was Built

Redesigned HelpSupportTab with streamlined user experience:

### My Support Tickets Section
- Fetches user's tickets from `GET /api/support` on mount
- Displays top 5 tickets with status badges (open=amber, in_progress=blue, resolved=green, closed=gray)
- Expandable ticket detail shows description, timestamps, and status-specific messages
- Auto-refreshes after ticket submission

### Category Quick-Pick Cards
Replaced blank form with 6 category cards:
1. **Booking Issue** (Calendar icon) — "Problems with a booking or appointment"
2. **Payment Problem** (CreditCard icon) — "Payment failed, wrong amount, or charges"
3. **Refund Help** (RotateCcw icon) — "Questions about refunds or returns"
4. **Account Help** (User icon) — "Login, password, or profile issues"
5. **Technical Issue** (AlertTriangle icon) — "App errors, bugs, or performance"
6. **Other** (HelpCircle icon) — "Anything else we can help with"

### Pre-Filled Support Form
- Subject auto-filled per category (e.g., "Booking Issue", "Payment Issue")
- Contextual placeholder text based on category
- Category selection can be closed/changed before submission
- Loading states during submission
- Success toast shows ticket number if returned

### Fixed API Paths
**Critical fix:** Corrected broken API paths from `02-04` stub routes:
- ✅ `POST /api/users/support/contact` (was `/api/support/contact`)
- ✅ `POST /api/users/support/report` (was `/api/support/report`)
- ✅ `GET /api/support` (for fetching tickets)

### Brand Token Consistency
Replaced all hardcoded colors:
- `text-[#A55233]` → `text-brand-500`
- `hover:text-[#8e462b]` → `hover:text-brand-600`
- `bg-[#A55233]` → `bg-brand-500`
- `focus:ring-[#A55233]` → `focus:ring-brand-500`

## Deviations from Plan

None — plan executed exactly as written.

## User Experience Improvements

**Before:** Blank form requiring subject, message, priority selection. No ticket tracking. Broken API paths (404 errors).

**After:**
1. One-click category selection
2. Pre-filled subject
3. Contextual guidance via placeholder text
4. See existing tickets and their status
5. Working API integration

**Impact:** Reduces support ticket creation friction from 4 fields to 1 (just describe the issue).

## Verification

✅ My Tickets section renders with loading state
✅ 6 category cards with icons and descriptions
✅ Category selection shows pre-filled form with contextual placeholders
✅ POST to `/api/users/support/contact` (correct path)
✅ POST to `/api/users/support/report` (correct path)
✅ GET from `/api/support` for ticket list
✅ No hardcoded hex colors — all use `brand-*` tokens
✅ ESLint passes with no errors or warnings
✅ Ticket list refreshes after submission
✅ Expandable ticket detail with status messages

## Self-Check: PASSED

**Files created:** None
**Files modified:**
- ✅ `kalasetu-frontend/src/components/profile/tabs/HelpSupportTab.jsx` — VERIFIED EXISTS

**Commits:**
- ✅ `8683e55` — VERIFIED EXISTS

## Integration Notes

This plan closes the gap between:
- Plan 02-02 (support ticket backend with `GET /api/support` routes)
- Plan 02-04 (stub ticket creation at `/api/users/support/*`)

The HelpSupportTab now correctly uses both backend systems:
- Stub routes for creating tickets (via userAuthRoutes)
- Full support routes for listing/viewing tickets (via supportRoutes)

## Next Steps

After plan 02-05 (user refund UI) completes, the entire refund & support phase will be ready for wave 4 verification.
