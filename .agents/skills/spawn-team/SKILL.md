---
name: spawn-team
description: Manually initiate a named agent team for coordinated parallel work. Use when multiple independent tasks can run simultaneously.
user-invocable: true
---

# Spawn Agent Team

Create a named team of coordinated agents for parallel work on complex tasks. Uses TeamCreate + Task tool to spin up teammates with shared task lists and inter-agent messaging.

## Usage

```
/spawn-team                                    # Auto-detect from current TaskList
/spawn-team coding-session                     # Named team, auto-assign from tasks
/spawn-team api-sprint "API + Frontend work"   # Named team with description
```

## When to Use Teams vs Subagents

| Scenario | Use | Why |
|----------|-----|-----|
| Write 3 independent test files | **Subagents** (Task tool) | No coordination needed, fire-and-forget |
| Research 4 topics in parallel | **Subagents** | Independent reads, no shared state |
| Implement API + Frontend simultaneously | **Team** | Shared interfaces, may need to coordinate contracts |
| Build feature across backend + frontend | **Team** | Cross-layer work needs sync points |
| Code review + security review | **Subagents** | Independent analysis, no coordination |
| Multi-phase coding session with gates | **Team** | Leader orchestrates gates between phases |

**Rule of thumb:** If agents need to talk to each other or share interfaces, use a team. If they just do independent work and return results, use subagents.

## Steps

### 1. Read Current Task State

Check TaskList for pending, unblocked tasks. If no TaskList exists, read `docs/development/DAILY_STATUS.md` action queue.

Identify tasks that can run in parallel (no `blockedBy` dependencies between them).

### 2. Create the Team

```
TeamCreate:
  team_name: [provided name or "session-YYYY-MM-DD"]
  description: [provided description or auto-generated from tasks]
```

### 3. Spawn Teammates

For each parallel workstream, spawn a teammate:

```
Task:
  subagent_type: [see Agent Type Guide below]
  team_name: [team name from step 2]
  name: [descriptive name, e.g., "api-builder", "frontend-builder"]
  prompt: [full task context + quality gate instructions]
  mode: bypassPermissions  # or default for sensitive work
```

### 4. Assign Tasks

Use TaskUpdate to assign tasks to teammates by setting `owner` to the teammate's name.

### 5. Report to User

Show:
- Team name and member count
- Task assignments (who owns what)
- Dependency chain (what runs now vs what's blocked)
- Quality gates planned between phases

## Agent Type Selection Guide

| Work Type | subagent_type | Tools Available |
|-----------|--------------|-----------------|
| Write/edit code | `general-purpose` | All tools (Read, Write, Edit, Bash, Grep, Glob) |
| Code review | `code-reviewer` | Read-only + analysis |
| Explore codebase | `Explore` | Read-only, fast search |
| Architecture planning | `Plan` | Read-only analysis |
| Security review | `security-reviewer` | Read-only + security analysis |

## Teammate Prompt Template

Every teammate prompt should include:

```
You are [role] on team "[team-name]".

YOUR TASK:
[Specific task description]

CONTEXT:
- Project: KalaSetu (Node.js/Express + MongoDB + React JSX artisan marketplace)
- Backend: kalasetu-backend/ (ES modules, asyncHandler, Zod validation, dual auth)
- Frontend: kalasetu-frontend/ (React 18 JSX, Tailwind, React Router v7)
- [Relevant file paths and interfaces]

QUALITY GATES:
- Run /build-check before marking complete
- Follow dual auth patterns (protect, userProtect, protectAny)
- Use asyncHandler for all async route handlers
- Validate requests with Zod via validateRequest middleware

WHEN DONE:
- Mark your task completed with TaskUpdate
- Send a message to the team lead summarizing what you built
```

## Rules

- Maximum 4 teammates at once (context + resource constraint)
- Each teammate gets exactly 1 task at a time
- Leader resolves cross-agent conflicts (shared interfaces, API contract mismatches)
- All teammates must run quality checks before marking tasks complete
- Use `/broadcast` to announce blocking changes
- Use `/cleanup` when all work is done
- Prefer subagents (Task tool without team) for truly independent work
