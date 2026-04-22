#!/bin/bash
# Dangerous Command Guard — blocks destructive commands that are hard to reverse.
# Runs as PreToolUse hook on Bash tool calls.
set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Exit early if no command
if [ -z "$command" ]; then
  exit 0
fi

# === BLOCKED COMMANDS (always deny) ===

# Force push (can destroy remote history)
if echo "$command" | grep -qE 'git\s+push\s+.*--force|git\s+push\s+-f\b'; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"BLOCKED: git push --force is destructive. Use --force-with-lease if you must force push, or ask the user for explicit confirmation first."}' >&2
  exit 2
fi

# Hard reset (destroys uncommitted work)
if echo "$command" | grep -qE 'git\s+reset\s+--hard'; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"BLOCKED: git reset --hard destroys uncommitted changes. Ask the user for explicit confirmation before running this command."}' >&2
  exit 2
fi

# Recursive force delete at root or broad paths
if echo "$command" | grep -qE 'rm\s+-rf\s+/|rm\s+-rf\s+\.|rm\s+-rf\s+~|rm\s+-rf\s+\*'; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"BLOCKED: Broad recursive delete detected. This could destroy the project or system files. Ask the user for explicit confirmation."}' >&2
  exit 2
fi

# DROP TABLE (database destruction)
if echo "$command" | grep -qiE 'DROP\s+TABLE|DROP\s+DATABASE'; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"BLOCKED: DROP TABLE/DATABASE detected. Ask the user for explicit confirmation before destroying database structures."}' >&2
  exit 2
fi

# Force branch delete
if echo "$command" | grep -qE 'git\s+branch\s+-D\s'; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"BLOCKED: git branch -D force-deletes a branch. Use -d (lowercase) for safe delete, or ask the user for confirmation."}' >&2
  exit 2
fi

# git checkout . or git restore . (discards all changes)
if echo "$command" | grep -qE 'git\s+checkout\s+\.|git\s+restore\s+\.'; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"BLOCKED: This discards all uncommitted changes. Ask the user for explicit confirmation first."}' >&2
  exit 2
fi

# git clean -f (deletes untracked files)
if echo "$command" | grep -qE 'git\s+clean\s+-f'; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"BLOCKED: git clean -f deletes untracked files permanently. Ask the user for explicit confirmation."}' >&2
  exit 2
fi

# === WARNINGS (allow but inform) ===

# Push to main/master without PR
if echo "$command" | grep -qE 'git\s+push\s+.*\b(main|master)\b'; then
  echo '{"systemMessage":"WARNING: Pushing directly to main/master. Consider using a PR workflow instead. Proceeding since this is not blocked."}'
  exit 0
fi

# All clear
exit 0
