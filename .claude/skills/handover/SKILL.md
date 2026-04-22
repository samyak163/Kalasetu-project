---
name: handover
description: Generate or update the session handover document. Run at end of session to save state for the next session.
user-invocable: true
---

# Update Session Handover

Read current session state and update `docs/development/HANDOVER.md` with everything the next session needs.

## Usage

```
/handover                          # Auto-detect scenario, update all sections
/handover "built payment flow"     # Debrief mode — explain what changed and why
/handover changes                  # Quick summary of changed files
/handover context-overflow         # Mid-task handoff due to context limit
/handover debug                    # Handing off active debug investigation
/handover reset                    # Clear dynamic sections for fresh start
```

## Steps

### 1. Gather Current State

```bash
git branch --show-current
git log --oneline -5
git status --short
git diff --stat
```

### 2. Read Current HANDOVER.md

Read `docs/development/HANDOVER.md`.

### 3. Fill Dynamic Sections

- **Current State:** Date, branch, build status, session mood
- **Work Summary:** What was done, what's remaining, what's blocked
- **Files Modified:** With what-changed notes (debrief mode = detailed per-file)
- **Decisions Made:** Every choice with reasoning and rejected alternatives
- **Gotchas & Warnings:** Things next session needs to be careful about
- **Next Steps:** Exact instructions, not vague direction
- **Handoff Scenario:** Normal / Context Overflow / Debug / Parallel / Interrupted

### 4. Write Updated File

### 5. Confirm to User

Report what was captured and remind to `/commit` if uncommitted changes exist.

## Rules

- **Do NOT ask the user questions.** Gather everything from git and context.
- **Be specific.** "Implemented payment verification" not "worked on payments."
- **Record decisions with WHY.**
- **Next steps must be actionable.**
