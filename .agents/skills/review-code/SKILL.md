---
name: review-code
description: Review JavaScript/React code with the code-reviewer agent. Supports parallel multi-file review. Use after writing any backend or frontend code.
user-invocable: true
---

# Code Review (JavaScript / React)

Reviews JavaScript and React code for quality, architecture adherence, and KalaSetu-specific patterns using the `code-reviewer` agent.

## Usage

```
/review-code                                    # Review all changed JS/JSX files (git diff)
/review-code controllers/bookingController.js   # Review a specific file
/review-code routes/                            # Review all files in a directory
/review-code auth                               # Review only auth-related changes
```

## Arguments

| Argument | What It Does | When to Use |
|----------|-------------|-------------|
| _(none)_ | Review all changed `.js`/`.jsx` files from git diff | After a coding session, before commit |
| `[file path]` | Review a specific file | After modifying one file |
| `[directory]` | Review all `.js`/`.jsx` files in that directory | After working in one area |
| `auth` | Review only auth-related changes | After modifying authentication/authorization |

## How It Works

### Single File
Spawn one `code-reviewer` agent on the specified file.

### Multiple Files (PARALLEL)
When reviewing 2+ files, spawn SEPARATE `code-reviewer` agents in parallel — one per file. Faster and gives each agent focused context.

**Maximum 4 parallel agents.** If more than 4 files, batch: first 4 in parallel, wait, next 4.

### No File Specified
Run `git diff --name-only` filtered to `*.js` and `*.jsx` files. Review all changed files in parallel.

## Execution Steps

1. **Identify files to review:**
   - If path given → use that path (file or glob directory `*.js *.jsx`)
   - If `auth` → `git diff --name-only -- 'middleware/auth*' 'controllers/auth*' 'controllers/user*' 'routes/auth*' 'routes/user*'`
   - If no path → `git diff --name-only -- '*.js' '*.jsx'` + `git status --short -- '*.js' '*.jsx'`
   - If no changes → report "no JavaScript changes to review"

2. **For each file, spawn code-reviewer agent with this prompt:**

```
Review this JavaScript/React file for the KalaSetu project (Node.js/Express + MongoDB artisan marketplace).

FILE: [path]
CONTEXT: [what this file does — infer from filename, imports, and route patterns]

Go through ALL 10 review categories in your instructions. Don't skip any.
If this file handles auth: Category 1 (Auth & Access Control) is HIGH PRIORITY.
If this file uses Mongoose: Category 3 (MongoDB/Mongoose) is HIGH PRIORITY.
If this file has React components: Category 4 (React Patterns) is HIGH PRIORITY.
If this file calls external services: Category 7 (External Service Integration) is HIGH PRIORITY.

End with a REJECT / REVISE / APPROVE verdict.
```

3. **Collect results and present summary:**

```markdown
## Code Review Summary

| File | Verdict | Critical | High | Medium | Low |
|------|---------|----------|------|--------|-----|
| bookingController.js | REVISE | 0 | 2 | 1 | 3 |
| BookingPage.jsx | APPROVE | 0 | 0 | 2 | 1 |

### Critical/High Issues (fix before commit)
[list all critical and high issues across all files]

### Medium/Low (fix later)
[summarized]
```

4. **STOP GATE (MANDATORY — DO NOT SKIP):**
   - Present the summary table and issue list
   - **STOP HERE. Do NOT implement any fixes.**
   - Do NOT start editing files based on the review feedback
   - Do NOT say "Let me fix these issues" or "I'll address these now"
   - Instead, say exactly: **"Review complete. Run `/evaluate-review` to filter these suggestions before implementing, or tell me which issues to fix."**
   - Wait for the user to either run `/evaluate-review` OR explicitly say "fix issue X"
   - This gate exists to prevent the LLM mirror problem — where the session blindly implements all reviewer suggestions without critical evaluation

5. **If ANY file gets REJECT:** Tell the user what needs fixing. Still do NOT implement — wait for user direction.

6. **If all files APPROVE/REVISE:** List the issues. Still STOP and wait.

## When to Use

| Trigger | Action |
|---------|--------|
| After writing backend controllers/routes/middleware | Run `/review-code` on changed files |
| After writing React components | Run `/review-code` on changed files |
| After receiving code from ChatGPT/Copilot | Run `/review-code` on the pasted files |
| Before committing changes | Run `/review-code` |
| After fixing issues from a previous review | Run `/review-code` again for re-review |

## Integration with Other Reviews

- For security-critical code: run `/review-security` AFTER this review
- Both can run in parallel if you have time
