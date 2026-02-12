# KalaSetu v2 — Project State

## Current Status
- **Milestone:** v2 — Full Feature Milestone
- **Phase:** 2 — Refund & Support (In Progress)
- **Current Plan:** 02-02 (Complete)
- **Next action:** `/gsd:execute-phase 2 --plan 03` — Admin refund UI (if not already complete) or `--plan 04` — User refund UI

## Phase Progress

| Phase | Name | Status | Started | Completed |
|-------|------|--------|---------|-----------|
| 1 | Critical Bug Fixes | ✓ Complete | 2026-02-13 | 2026-02-13 |
| 2 | Refund & Support | In Progress | 2026-02-13 | — |
| 3 | Verification & Recording | Pending | — | — |
| 4 | Homepage & Polish | Pending | — | — |
| 5 | Dark Mode & i18n | Pending | — | — |
| 6 | Availability & Reviews | Pending | — | — |
| 7 | Analytics & Packages | Pending | — | — |
| 8 | Performance Optimization | Pending | — | — |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-13 | Use embedded messages for support tickets | Ticket conversations typically <100 messages; embedding simplifies queries and ensures atomic updates |
| 2026-02-13 | Dynamic import SupportTicket in userAuthController | Avoids circular dependency issues in large controller file with many existing imports |
| 2026-02-13 | Filter internal notes from user ticket views | Admins need internal discussion capability without exposing sensitive context to users |
| 2026-02-13 | Use 'users' permission for support ticket admin routes | No dedicated 'support' permission exists; user management permission is semantically appropriate |
| 2026-02-13 | Inline reject form in modal | Simpler UX with textarea in detail modal instead of separate modal; fewer clicks for admin |
| 2026-02-13 | Confirm approve only, reject requires reason | Approve is immediate/critical (Razorpay call), reject needs reason anyway so no extra confirmation |
| 2026-02-13 | Refunds between Payments and Bookings | Logical grouping in sidebar since refunds are payment-related operations |
| 2026-02-13 | Cumulative refund validation | Query all non-final refunds and sum amounts to prevent over-refunding when multiple partial refunds exist |
| 2026-02-13 | Non-blocking refund notifications | All email/push/in-app notifications wrapped in try/catch so critical path (approval/webhook) never fails due to notification errors |
| 2026-02-13 | Immediate Razorpay call on approval | Skip 'approved' state and go directly to 'processing' since refund is initiated immediately via Razorpay API |
| 2026-02-13 | 10MB size limit for all uploads | Balances user needs with bandwidth/storage costs; sufficient for high-quality images and scanned documents |
| 2026-02-13 | Use MulterError for validation failures | Enables centralized error handling in errorMiddleware with user-friendly JSON responses instead of raw HTML errors |
| 2026-02-13 | Separate imageUpload and documentUpload instances | Profile photos don't need PDF support; documents may be scanned as PDF; separation enforces correct types per use case |
| 2026-02-13 | Use useRef pattern for NotificationContext | Prevents infinite loop by keeping stable function reference while allowing access to latest closure values |
| 2026-02-13 | No user-facing toasts for non-critical errors | Facet loading and post-registration notification refresh failures are non-critical; Sentry tracking is sufficient |
| 2026-02-12 | Admin-approved refunds | Marketplace trust; prevents refund abuse |
| 2026-02-12 | MSG91 for SMS | India-focused; cheaper for Indian numbers |
| 2026-02-12 | Hindi + English i18n | Two most common Indian languages |
| 2026-02-12 | Bugs → Stubs → UI → Features → Perf ordering | Fix broken first, then build on solid foundation |
| 2026-02-12 | Skip domain research | Codebase analysis in .planning/codebase/ is comprehensive |

## Blockers
None.

## Performance Metrics

| Phase-Plan | Duration | Tasks | Files | Completion Date |
|------------|----------|-------|-------|-----------------|
| 01-02 | 144s | 2 | 4 | 2026-02-13 |
| 01-03 | 137s | 2 | 3 | 2026-02-13 |
| 02-01 | 296s | 2 | 7 | 2026-02-13 |
| 02-02 | 320s | 2 | 8 | 2026-02-13 |
| 02-03 | 209s | 2 | 3 | 2026-02-13 |

## Session Info

- **Last session:** 2026-02-13
- **Stopped at:** Completed 02-02-PLAN.md

## Notes
- v1 overhaul (16-task bug fix + accessibility) completed prior to this milestone
- Codebase analysis available in `.planning/codebase/` (ARCHITECTURE, CONCERNS, CONVENTIONS, INTEGRATIONS, STACK, STRUCTURE, TESTING)
- 3 pre-existing ESLint errors resolved in plan 01-02 (BUG-05)
- Workflow: Guided mode, thorough depth, auto-commit, parallel agents

## Plan 01-01 Execution Notes
- Completed: 2026-02-13
- Duration: 105 seconds
- Tasks: 2
- Files modified: 3
- Commits: dd4f734 (BUG-01), f1e90f0 (BUG-04)
- Decisions: MongoDB transactions for booking atomicity, login rate 20/15min, register rate 5/60min, no rate limit on logout
