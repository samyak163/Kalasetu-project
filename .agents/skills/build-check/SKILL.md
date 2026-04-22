---
name: build-check
description: Run lint and build checks for backend and/or frontend. Use before every commit.
user-invocable: true
---

# Build Check

Verify the project builds and code is clean. Mandatory before every commit.

## Usage

```
/build-check            # Run all checks (backend + frontend)
/build-check backend    # Backend only (lint)
/build-check frontend   # Frontend only (build + lint)
/build-check lint       # Lint only (fastest)
```

## Steps

### 1. Backend Lint

```bash
cd kalasetu-backend && npx eslint . 2>&1
```

If ESLint is not configured: skip and note "ESLint not set up for backend."

### 2. Frontend Build (Vite)

```bash
cd kalasetu-frontend && npm run build 2>&1
```

Catches: import errors, missing modules, build-time errors.

### 3. Frontend Lint

```bash
cd kalasetu-frontend && npm run lint 2>&1
```

### 4. Report Results

```markdown
## Build Check Results

| Check | Status | Issues |
|-------|--------|--------|
| Backend Lint | PASS / FAIL / SKIP | [count] errors |
| Frontend Build | PASS / FAIL | [count] errors |
| Frontend Lint | PASS / FAIL / SKIP | [count] warnings, [count] errors |

### Errors (fix before commit)
[List each error with file:line reference]

### Warnings (fix when convenient)
[List warnings grouped by type]

### Verdict: PASS / FAIL
```

**Verdict rules:**
- **PASS** = zero errors across all checks (warnings OK)
- **FAIL** = any error in any check

## Rules

- Run ALL checks by default (no skipping without explicit argument)
- Always show the summary table, even if everything passes
- If a tool is missing (eslint), SKIP that step — don't fail the whole check
- Never suppress warnings — show them, but they don't block the verdict
