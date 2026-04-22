# Workflow Details

## Plan Mode Structure
1. **Exploration** — Read codebase patterns, identify integration points
2. **Comparison** — Research 2-3 approaches, pros/cons for KalaSetu
3. **Task Creation** — Break into 3-7 tasks with TaskCreate, set dependencies
4. **Approval** — ExitPlanMode, wait for user approval
5. **Implementation** — Build in current session, mark tasks in_progress -> completed
6. **Review** — code-reviewer agent, security-reviewer if payment/auth code

**Auto-enter plan mode when:**
- Payment flow changes (Razorpay integration)
- Auth middleware changes (affects both user types)
- Database schema/model changes
- 3+ files affected
- New external service integration
- Security-sensitive code (auth, payments, uploads)

**Skip plan mode when:**
- Config-only changes (env vars, CORS origins)
- Single-file bug fixes
- Documentation updates
- Running quality gates (/build-check, /test-check, /review-code)

## Quality Gates

**After writing ANY code:**
1. Run `/review-code` on changed files
2. Fix all CRITICAL and HIGH issues before next task

**After security-sensitive code (auth, payments, uploads):**
1. Run `/review-security` agent
2. Fix all CRITICAL issues immediately

**Before any commit:**
1. `/build-check` — lint passes (when configured)
2. `/test-check` — tests pass (when tests exist)

## Session Start Protocol
1. Read `docs/development/HANDOVER.md` for session state
2. Check `git log --oneline -5` for recent work
3. Read `docs/development/DAILY_STATUS.md` for pending actions
4. Ask user what to work on (or suggest from DAILY_STATUS)

Daily command center: `/daily` for full state scan + action plan.

## Parallel Execution Philosophy

Use agent teams for coordinated parallel work:
- **Independent implementation tasks run concurrently** via agent teams
- **Be explicit about execution mode** — state which are parallel vs sequential
- **Design decisions stay with the human** — agent teams implement, not decide
- **Quality gates are non-negotiable** regardless of execution mode
- **Review agents stay independent** — never put them in teams where they'd influence each other

Manual overrides: `/spawn-team`, `/broadcast`, `/cleanup`.

## Research Cache System
Persistent cache: fetches once, reuses forever.

**Invoke:** `/research-cache [topic]` (e.g., razorpay-webhooks, mongoose-aggregation)
**Flow:** Check cache -> fresh (<30d): return cached -> stale: re-fetch -> new: fetch and save
**Storage:** `research-cache/INDEX.md` + `research-cache/[topic].md`

**Cache:** Express/MongoDB patterns, Razorpay flows, Algolia indexing, React patterns.
**Don't cache:** Real-time data, rapidly changing APIs, one-off research.
