# Session Handover

> **Purpose:** Bridge between sessions. Read at the start of every new session. Update at the end.
> **Rule:** This file gets OVERWRITTEN each session, not appended. It's always the current state.

---

## How This File Works

### Starting a Session

1. Read this file first
2. Check "Current State" for where things stand
3. Read "Next Steps" for what to do next
4. Read any files listed in "Context Files to Read"

**Do NOT re-explain the project, stack, or architecture.** That's in CLAUDE.md and the docs. This file is for SESSION CONTINUITY only.

### Ending a Session

Before stopping, update these sections:

1. **Current State** -- Branch, build status, what we're working on
2. **Work Summary** -- What was done, what's remaining
3. **Decisions** -- Any choices made and WHY (most valuable part)
4. **Next Steps** -- Exact instructions for the next session
5. **Scenario** -- Which handoff scenario applies (see bottom)

### Relationship to Other Tools

| Tool | What It Tracks | This File Adds |
|------|---------------|----------------|
| CLAUDE.md | Stable project facts, file paths | Session-specific state (overwritten each time) |
| Git log | What code changed | What we were THINKING and what's NOT in the code |
| DAILY_STATUS.md | Daily plan and task tracking | WHY decisions were made, gotchas, human context |

---

## Project Quick Reference

| What | Value |
|------|-------|
| Project | KalaSetu -- artisan marketplace platform |
| Stack | React + Vite + Tailwind (frontend), Node.js + Express (backend), MongoDB |
| Auth | JWT in HTTP-only cookies, dual user types (artisan + customer) |
| Build tool | Vite (frontend), nodemon (backend dev) |
| Platform | Web (deployed on Render) |
| Status | V1 (production, active development) |
| Instructions | `CLAUDE.md` |
| Workflow | `docs/development/DAILY_WORKFLOW.md` |
| V1 Scope | `docs/product/V1_SCOPE.md` |
| Architecture | `docs/technical/ARCHITECTURE.md` |
| Branch strategy | `main` (production) |

---

## Current State

> **UPDATE THIS SECTION EVERY SESSION**

| Field | Value |
|-------|-------|
| **Date** | _[today's date]_ |
| **Branch** | _[current branch]_ |
| **Build status** | _[passing / failing / unknown]_ |
| **Test status** | _[passing / failing / no tests]_ |
| **Session mood** | _[smooth / rough / exploratory / debugging]_ |

---

## Work Summary

> **UPDATE THIS SECTION EVERY SESSION**

### What Was Done This Session

-

### What's Remaining

-

### What's Blocked

-

### Files Modified

| File | What Changed | Why |
|------|-------------|-----|
| | | |

---

## Decisions Made

> **UPDATE THIS SECTION EVERY SESSION** -- This is the most valuable part. Decisions without recorded reasoning get re-debated every session.

| Decision | Choice | Why | Rejected Alternative |
|----------|--------|-----|---------------------|
| | | | |

---

## Gotchas & Warnings

> Things the next session needs to be careful about.

-

---

## Next Steps

> **UPDATE THIS SECTION EVERY SESSION** -- Exact instructions, not vague direction.

### Immediate (Do First)

1.

### After That

1.

### Context Files to Read (If Needed)

- CLAUDE.md (always)
-

---

## Handoff Scenario

> **CHECK ONE** -- tells the next session what kind of resumption this is.

### [ ] Normal End of Day

Standard handoff. Previous session completed a logical unit of work.

**Resume with:** Read "Next Steps" above and start building.

### [ ] Context Window Overflow (/clear)

Previous session ran out of context mid-task. Work is INCOMPLETE.

| Field | Value |
|-------|-------|
| **Exact stopping point** | _[what line/file/function we were in the middle of]_ |
| **Uncommitted changes** | _[yes/no -- describe if yes]_ |
| **Partial implementation** | _[what's half-built and needs finishing]_ |
| **Resume action** | _[exact command or step to continue from]_ |

**Resume with:** Pick up EXACTLY where the last session stopped. Don't re-plan. Don't re-read docs. Just continue the implementation from the stopping point.

### [ ] Long Break (Days/Weeks Away)

It's been a while. More context needed.

**Resume with:**
1. Read this file (you're doing that now)
2. `git log --oneline -15` for recent work
3. Read `docs/product/V1_SCOPE.md` to re-confirm scope
4. Ask user: "What should we focus on?"

### [ ] Parallel Sessions Active

Multiple Claude sessions running simultaneously on different tasks.

| Session | Focus | Branch | Don't Touch |
|---------|-------|--------|-------------|
| **A** | _[task]_ | _[branch]_ | _[files session B owns]_ |
| **B** | _[task]_ | _[branch]_ | _[files session A owns]_ |

**Resume with:** Check which session you are. Only work on your assigned files. Run `git status` first to avoid conflicts.

### [ ] Interrupted Mid-Feature (Urgent Bug/Task)

Was building something, got pulled to fix something else.

| Field | Value |
|-------|-------|
| **Feature in progress** | _[what was being built]_ |
| **Feature branch** | _[branch name]_ |
| **Feature state** | _[committed / uncommitted / stashed]_ |
| **Interrupting task** | _[what pulled us away]_ |
| **Interruption resolved?** | _[yes / no / in progress]_ |

**Resume with:** If interruption is resolved, switch back to feature branch and continue from "What's Remaining" above. If not, finish the interruption first.

### [ ] Debug Session Handoff

Handing off an active debugging investigation.

| Field | Value |
|-------|-------|
| **Bug description** | _[what's broken]_ |
| **Symptoms** | _[what the user sees]_ |
| **Hypotheses tested** | _[what we tried and what we learned]_ |
| **Current hypothesis** | _[what we think the cause is]_ |
| **Next diagnostic step** | _[what to try next]_ |

**Resume with:** Read "Hypotheses tested" to avoid re-trying failed approaches. Start with "Next diagnostic step."

### [ ] Architecture/Planning Discussion

Session was discussing approaches, not writing code.

| Field | Value |
|-------|-------|
| **Topic** | _[what we were designing]_ |
| **Options considered** | _[approaches discussed]_ |
| **Leaning toward** | _[which approach and why]_ |
| **Unresolved questions** | _[what still needs answering]_ |
| **Decision needed from user** | _[what the user needs to decide]_ |

**Resume with:** Summarize the options to the user and ask for a decision. Don't re-derive the options -- they're recorded above.

---

## Session Approach Notes

> How the previous session was working -- tone, pace, patterns.

-

---

## Template Reset

When starting a brand new task (not continuing previous work), reset the dynamic sections:

```
Ask Claude: "Reset the handover for a fresh start on [new task]"
```

Claude will clear the dynamic sections and fill in the new task context.

---

*Last updated: [date]*
*Updated by: [who]*
