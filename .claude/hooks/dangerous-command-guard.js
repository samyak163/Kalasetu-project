#!/usr/bin/env node
// Dangerous Command Guard — blocks destructive commands that are hard to reverse.
// Runs as PreToolUse hook on Bash tool calls.
// Node.js version for Windows compatibility (bash hooks fail in CMD.exe).

let data = '';
process.stdin.on('data', (chunk) => (data += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const command = input.tool_input?.command || '';

    if (!command) {
      process.exit(0);
    }

    // === BLOCKED COMMANDS (always deny) ===

    // Force push (can destroy remote history)
    if (/git\s+push\s+.*--force|git\s+push\s+-f\b/.test(command)) {
      process.stderr.write(JSON.stringify({
        hookSpecificOutput: { permissionDecision: 'deny' },
        systemMessage: 'BLOCKED: git push --force is destructive. Use --force-with-lease if you must force push, or ask the user for explicit confirmation first.'
      }));
      process.exit(2);
    }

    // Hard reset (destroys uncommitted work)
    if (/git\s+reset\s+--hard/.test(command)) {
      process.stderr.write(JSON.stringify({
        hookSpecificOutput: { permissionDecision: 'deny' },
        systemMessage: 'BLOCKED: git reset --hard destroys uncommitted changes. Ask the user for explicit confirmation before running this command.'
      }));
      process.exit(2);
    }

    // Recursive force delete at root or broad paths
    if (/rm\s+-rf\s+\/|rm\s+-rf\s+\.|rm\s+-rf\s+~|rm\s+-rf\s+\*/.test(command)) {
      process.stderr.write(JSON.stringify({
        hookSpecificOutput: { permissionDecision: 'deny' },
        systemMessage: 'BLOCKED: Broad recursive delete detected. This could destroy the project or system files. Ask the user for explicit confirmation.'
      }));
      process.exit(2);
    }

    // DROP TABLE (database destruction)
    if (/DROP\s+TABLE|DROP\s+DATABASE/i.test(command)) {
      process.stderr.write(JSON.stringify({
        hookSpecificOutput: { permissionDecision: 'deny' },
        systemMessage: 'BLOCKED: DROP TABLE/DATABASE detected. Ask the user for explicit confirmation before destroying database structures.'
      }));
      process.exit(2);
    }

    // Force branch delete
    if (/git\s+branch\s+-D\s/.test(command)) {
      process.stderr.write(JSON.stringify({
        hookSpecificOutput: { permissionDecision: 'deny' },
        systemMessage: 'BLOCKED: git branch -D force-deletes a branch. Use -d (lowercase) for safe delete, or ask the user for confirmation.'
      }));
      process.exit(2);
    }

    // git checkout . or git restore . (discards all changes)
    if (/git\s+checkout\s+\.|git\s+restore\s+\./.test(command)) {
      process.stderr.write(JSON.stringify({
        hookSpecificOutput: { permissionDecision: 'deny' },
        systemMessage: 'BLOCKED: This discards all uncommitted changes. Ask the user for explicit confirmation first.'
      }));
      process.exit(2);
    }

    // git clean -f (deletes untracked files)
    if (/git\s+clean\s+-f/.test(command)) {
      process.stderr.write(JSON.stringify({
        hookSpecificOutput: { permissionDecision: 'deny' },
        systemMessage: 'BLOCKED: git clean -f deletes untracked files permanently. Ask the user for explicit confirmation.'
      }));
      process.exit(2);
    }

    // === WARNINGS (allow but inform) ===

    // Push to main/master without PR
    if (/git\s+push\s+.*\b(main|master)\b/.test(command)) {
      console.log(JSON.stringify({
        systemMessage: 'WARNING: Pushing directly to main/master. Consider using a PR workflow instead.'
      }));
      process.exit(0);
    }

    // All clear
    process.exit(0);
  } catch {
    // Parse error — allow the command
    process.exit(0);
  }
});
