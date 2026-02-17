# Daily Development Workflow

> **For:** Solo developer building KalaSetu with Claude Code
> **Last Updated:** February 2026

---

## Tool Hierarchy

Three layers. One primary tool per layer. Everything else is secondary.

| Layer | Primary Tool | Purpose |
|-------|-------------|---------|
| **Project Tracking** | GSD (`/gsd:*`) | Phases, state, progress, session persistence |
| **Feature Design** | Plan Mode (built-in) | Architecture decisions, approach design |
| **Specialist Review** | Task Agents | Code review, security, research |

**Decision rule:** Spans sessions -> GSD. Needs design discussion -> Plan Mode. Needs expert review -> Agent.

---

## Start of Day

### 1. Resume Context

```
/gsd:resume-work
```

Reads STATE.md, shows where you left off, suggests next actions.

If this is the first session using GSD, or you need a status overview:

```
/gsd:progress
```

### 2. Set One Goal

Pick **one** focus for the day. Not three. Not five. One.

```
"Today: [specific feature or task]"
```

Claude checks V1_SCOPE.md and CORE_FEATURES.md to confirm it's in scope.

### 3. Daily Check-In Questions

Ask any of these to orient Claude:

- "Am I building the right thing?"
- "What's blocking progress?"
- "What did we decide last session about [topic]?"

Claude reads CLAUDE.md, git log, and GSD state automatically. If it seems lost:

```
"Read CLAUDE.md and orient yourself. Check git log."
```

---

## The Build Cycle

```
Orient -> Plan -> Code -> Check -> Review -> Commit -> Repeat
```

### For each feature or task:

1. **Orient** -- `/gsd:progress` or read the current phase plan
2. **Plan** -- Claude enters Plan Mode for non-trivial work (3+ files, architectural choices)
3. **Code** -- Claude implements. You review. Push back if something feels wrong.
4. **Check** -- Run `npm run dev` (backend) and check for errors after every meaningful change
5. **Test** -- Verify the feature works (manual testing until test suite exists)
6. **Review** -- code-reviewer agent for complex changes
7. **Commit** -- `/commit` when a logical unit is done

### Quick tasks (no planning needed):

```
/gsd:quick
```

Skips research/verification agents. Good for one-off fixes, small additions.

---

## When to Use What

### Core Decision Matrix

| Situation | Use This | Not This |
|-----------|----------|----------|
| "What should I build next?" | `/gsd:progress` | Reading docs manually |
| "Plan this phase's tasks" | `/gsd:plan-phase N` | Manual task breakdown |
| "Execute this phase" | `/gsd:execute-phase N` | Building without tracking |
| "How should I implement X?" | Plan Mode | Jumping straight to code |
| "Build this new feature" | `/feature-dev` or Plan Mode | Coding without analysis |
| "Build this UI component" | `/frontend-design` | Generic code generation |
| "Fix this bug" | Just fix it (simple) or `/gsd:debug` (complex) | Over-planning a fix |
| "Quick one-off task" | `/gsd:quick` | Full phase ceremony |
| "Review this code" | `/code-review` or `/review-pr` | Skipping review |
| "Commit this work" | `/commit` | Writing commit messages yourself |
| "Commit + push + PR" | `/commit-push-pr` | Three separate commands |
| "I'm stuck on a bug" | `/gsd:debug "description"` | Random debugging |
| "Where was I?" | `/gsd:resume-work` | Reading git log manually |
| "Stopping for today" | `/gsd:pause-work` then `/commit` | Leaving uncommitted work |
| "Capture this idea" | `/gsd:add-todo` | Forgetting it |
| "Verify this phase works" | `/gsd:verify-work N` | Claiming done without proof |
| "Update CLAUDE.md" | `/revise-claude-md` | Manual edits to CLAUDE.md |
| "Audit my Claude setup" | `/claude-automation-recommender` | Guessing what's missing |
| "Clean dead branches" | `/clean_gone` | Manual branch deletion |

### `/feature-dev` vs Plan Mode

| Use `/feature-dev` when | Use Plan Mode when |
|------------------------|--------------------|
| Building a new feature with clear scope | Multiple valid approaches to compare |
| Want guided codebase analysis first | Refactoring existing code |
| Don't know where to start | Architecture decisions (not just features) |
| Want structured walkthrough | Want conversational back-and-forth |

### GSD Phase Workflow (Project Level)

```
/gsd:discuss-phase N         (optional: capture your vision first)
/gsd:plan-phase N            (creates PLAN.md with concrete tasks)
  YOU review + edit           (discuss with Claude if anything is unclear)
/gsd:execute-phase N         (parallel agents execute all plans)
/gsd:verify-work N           (validate features through UAT)
/gsd:progress                (check status, route to next phase)
```

---

## Development Commands Reference

### Backend (kalasetu-backend/)

```bash
npm run dev              # Start dev server with nodemon (port 5000)
npm start                # Production server
npm run seed:core        # Seed categories + demo accounts
npm run create:admin     # Create admin account
npm run cleanup:dry      # Preview cleanup
npm run cleanup          # Remove non-demo data
npm run check:artisans   # Verify artisan data
npm run workflow:test    # Run booking workflow simulation
npm run generate:db-doc  # Generate database documentation
```

### Frontend (kalasetu-frontend/)

```bash
npm run dev              # Vite dev server (port 5173)
npm run build            # Production build
npm run lint             # ESLint check
npm run preview          # Preview production build
```

### Git Workflow

```bash
git status               # Check working tree
git log --oneline -10    # Recent commits
```

---

## Skills Reference

### Daily Use (every session)

| Skill | What It Does | When |
|-------|-------------|------|
| `/commit` | Create git commit with proper message | When logical unit is done |
| `/commit-push-pr` | Commit, push, open PR in one flow | When ready to merge |
| `/clean_gone` | Remove dead git branches | Branch cleanup |

### Feature Development

| Skill | What It Does | When |
|-------|-------------|------|
| `/feature-dev` | Guided feature dev with codebase analysis | Starting any new feature |
| `/frontend-design` | Production-grade UI components | Building any UI element |

### Project Management (GSD)

| Skill | What It Does |
|-------|-------------|
| `/gsd:progress` | Check status, route to next action |
| `/gsd:resume-work` | Restore context from previous session |
| `/gsd:pause-work` | Save context for next session |
| `/gsd:plan-phase N` | Create execution plan for phase |
| `/gsd:execute-phase N` | Execute all plans in phase |
| `/gsd:quick` | Quick task with state tracking |
| `/gsd:debug "desc"` | Persistent debugging session |
| `/gsd:add-todo` | Capture idea as todo |
| `/gsd:check-todos` | List and work on pending todos |
| `/gsd:verify-work N` | Validate features through UAT |
| `/gsd:add-phase "desc"` | Add phase to roadmap |
| `/gsd:new-milestone "name"` | Start new milestone cycle |

### Quality and Review

| Skill | What It Does | When |
|-------|-------------|------|
| `/code-review` | Code review via specialized agent | After writing code |
| `/review-pr` | Full PR review with specialized agents | Before merging PRs |
| `/revise-claude-md` | Update CLAUDE.md with session learnings | After major decisions |
| `/claude-automation-recommender` | Audit Claude Code setup | Monthly maintenance |

---

## Agents Reference

### Custom Agents (`.claude/agents/`)

| Agent | Specialty |
|-------|-----------|
| **code-reviewer** | Architecture fit, bugs, quality |
| **security-reviewer** | API security, auth bypass, injection |
| **build-error-resolver** | Fix build errors |
| **planner** | Implementation planning for complex features |
| **architect** | System design decisions |
| **tdd-guide** | Test-driven development |
| **refactor-cleaner** | Dead code cleanup |
| **doc-updater** | Documentation updates |

### Built-in Agent Types (via Task tool)

| Agent Type | Use For |
|-----------|---------|
| **Explore** | Fast codebase exploration, finding files and patterns |
| **Plan** | Designing implementation approaches |
| **general-purpose** | Multi-step research, complex searches |
| **code-simplifier** | Simplifying code after implementation |

---

## Session Management

### Starting a Session

```
/gsd:resume-work              <- Full context restoration
```

Then set your goal:

```
"Today: [specific task]"
```

### During a Session

- `/gsd:add-todo` -- Capture ideas without losing focus
- `/gsd:quick` -- Handle small tasks without breaking flow
- Plan Mode -- Think through approach before building

### Ending a Session

```
/commit                        <- Clean working tree first
/gsd:pause-work                <- Save state + context
```

Ask Claude: "Update the handover before we stop."

---

## When Things Go Wrong

### Build Breaks

Check the error output. Claude identifies and fixes the issue. Run `npm run dev` to verify.

### Lost Context (New Session)

```
/gsd:resume-work
```

If still confused: "Read CLAUDE.md and the recent git log. Orient yourself."

### Stuck on a Problem

1. "I'm stuck on [problem]. Stop and think about this deeply."
2. If 2-3 attempts fail -- Claude says so
3. `/gsd:debug "description"` for persistent investigation
4. Take a break. Come back with fresh eyes.

### Too Many Tools / Confused

Come back to the three layers:

1. **Project:** `/gsd:progress` -> `/gsd:plan-phase` -> `/gsd:execute-phase`
2. **Feature:** Plan Mode -> implement -> test -> `/commit`
3. **Review:** code-reviewer / security-reviewer agents

Everything else is optional enhancement.

---

## Weekly Rhythm

| When | What |
|------|------|
| **Monday** | `/gsd:progress`. Review against V1_SCOPE.md. Set week's goal. |
| **Mid-week** | Build. Code. Ship. `/gsd:quick` for small tasks. |
| **Friday** | Test manually. Fix regressions. Clean commit state. |

### Monthly Maintenance

| Task | Command |
|------|---------|
| Audit Claude Code setup | `/claude-automation-recommender` |
| Update CLAUDE.md | `/revise-claude-md` |
| Clean branches | `/clean_gone` |
| GSD settings tune | `/gsd:settings` |

---

*This is your operating manual. Update when your workflow evolves.*
