---
name: broadcast
description: Send a message to all active teammates at once. Use sparingly — only for blocking issues or team-wide announcements.
user-invocable: true
---

# Broadcast to Team

Send a message to every active teammate in the current team. Expensive operation — each broadcast sends a separate message to every teammate.

## Usage

```
/broadcast "Stop work — API contract changed"
/broadcast "Schema confirmed, unblock DB tasks"
/broadcast "Sync point: commit before integration"
```

## Steps

### 1. Verify Active Team

Read team config at `~/.Codex/teams/{team-name}/config.json` to confirm the team exists and has active members.

If no team exists, tell the user: "No active team. Run `/spawn-team` first."

### 2. Send Broadcast

```
SendMessage:
  type: "broadcast"
  content: [the message text]
  summary: [5-10 word preview for UI]
```

### 3. Confirm Delivery

Report: "Broadcast sent to [N] teammates: [summary of message]"

## When to Use

| Scenario | Use Broadcast? |
|----------|---------------|
| Blocking bug discovered that affects everyone | Yes |
| API contract or model schema changed | Yes |
| Decision made that changes the plan | Yes |
| "Stop work" signal | Yes |
| Responding to one teammate | No — use direct message |
| Sharing info relevant to 1-2 teammates | No — use direct message |
| Routine status updates | No — teammates report via TaskUpdate |

## Rules

- Use sparingly — each broadcast sends N separate messages (one per teammate)
- Always include a clear summary — teammates see the preview before the full message
- If only 1-2 teammates need the info, send direct messages instead
- Don't broadcast status updates — use TaskUpdate for progress tracking
