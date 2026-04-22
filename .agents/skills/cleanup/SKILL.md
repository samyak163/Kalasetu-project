---
name: cleanup
description: Clear team resources after the session is done. Gracefully shuts down teammates and removes team state.
user-invocable: true
---

# Team Cleanup

Gracefully shut down all teammates and remove team resources. Run at end of a team session, after `/handover` if state needs preserving.

## Usage

```
/cleanup                  # Graceful shutdown — wait for teammate confirmations
/cleanup force            # Force cleanup — don't wait, just shut down
```

## Steps

### 1. Check Team Status

Read team config at `~/.Codex/teams/{team-name}/config.json` to find all members.

Check TaskList for current state:
- How many tasks completed
- How many tasks still in_progress
- How many tasks still pending

### 2. Warn About Incomplete Work

If any tasks are `in_progress`:

```
WARNING: [N] tasks still in progress:
- [task subject] (owner: [name])
- [task subject] (owner: [name])

Shutting down will lose any uncommitted work from these teammates.
```

Ask user for confirmation unless `force` was specified.

### 3. Send Shutdown Requests

For each active teammate:
```
SendMessage:
  type: "shutdown_request"
  recipient: [teammate name]
  content: "Session complete, shutting down team"
```

Wait for each teammate to confirm (they respond with `shutdown_response`).

### 4. Delete Team

After all teammates have confirmed (or after timeout in force mode):

```
TeamDelete
```

This removes:
- Team directory: `~/.Codex/teams/{team-name}/`
- Task directory: `~/.Codex/tasks/{team-name}/`

### 5. Report

```
Team "[name]" cleaned up.
- [N] teammates shut down
- [M] tasks completed
- [K] tasks cancelled (were pending/in_progress)
```

## Recommended Session End Sequence

```
1. /handover              # Save session state
2. /cleanup               # Shut down team
3. Review uncommitted work
4. /commit (if needed)    # Commit any remaining changes
```

## Rules

- Always try graceful shutdown first — teammates can save uncommitted state
- Force mode still sends shutdown requests, just doesn't wait for confirmation
- Run `/handover` BEFORE `/cleanup` if you need to preserve session state
- TeamDelete will fail if teammates haven't exited yet — retry after a moment
- If a teammate rejects shutdown (still working), ask user how to proceed
