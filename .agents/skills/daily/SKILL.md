---
name: daily
description: Daily command center — reads project state, creates today's task workflow, and asks questions where needed. PLANNER ONLY — does not execute tasks.
user-invocable: true
---

# Daily Command Center

Living daily planner that reads project state, creates a tracked task list, and tells you what to work on.

**Critical rule: `/daily` is a PLANNER.** It creates the plan. It does NOT execute tasks.

## Usage

```
/daily              # Full daily scan — generate today's plan
/daily check        # Quick status check
/daily decide       # Show pending decisions
/daily note "text"  # Add an architecture note
/daily log          # Show session history
```

## Steps

### Step 1: Quick Context Load

Read ONLY these files:
1. `docs/development/DAILY_STATUS.md` — previous daily state
2. `docs/development/daily-archive/INDEX.md` — accumulated history
3. `docs/product/V1_SCOPE.md` — current scope

Plus:
```bash
git log --oneline -5
git status --short
```

### Step 2: Analyze and Ask

Determine:
1. What was done last session? (from archive INDEX + git log)
2. What's next? (from previous action queue, V2 priorities)
3. Any blockers?

Ask 1-2 targeted questions using AskUserQuestion.

### Step 3: Generate Action Queue

| # | Task | Exec Mode | Time | Depends On |
|---|------|-----------|------|------------|
| 1 | **Task** — description | This session | quick | — |
| 2 | **Task** — description [ASK] | This session | medium | #1 |
| 3 | **Task** — description | Agent team | medium | — |

**Exec modes:** This session, Agent team, Delegate (ChatGPT/Copilot), Background

**Autonomy markers:**
- _(no marker)_ — Pure code, spec confirmed
- `[ASK]` — Needs user decision first
- `[CHECK]` — Quick OK needed

### Step 4: Create TaskList

For every row, call TaskCreate then TaskUpdate to set dependencies.

### Step 5: Archive + Update DAILY_STATUS.md

If date changed: archive old DAILY_STATUS to `daily-archive/YYYY-MM-DD.md`, update INDEX.md.

### Step 6: Show Summary

- Today's focus
- Action queue table
- TaskList created
- Agent team recommendation (if parallel candidates found)
- "Run task #1 when ready"
