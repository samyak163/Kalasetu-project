---
name: test-check
description: Run backend and/or frontend tests. Supports partial runs and specific files. Use after implementing features or fixing bugs.
user-invocable: true
---

# Test Check

Run the test suite. Mandatory before marking any feature complete.

## Usage

```
/test-check                    # Run all tests
/test-check backend            # Backend tests only (Jest/Vitest)
/test-check frontend           # Frontend tests only (Vitest)
/test-check controllers/       # Tests in a specific directory
/test-check payment            # Tests matching a name pattern
/test-check coverage           # All tests + coverage report
```

## Steps

### 1. Backend Tests

```bash
cd kalasetu-backend && npm test 2>&1
```

**If no test script configured:**
Report: "No test suite configured for backend. This is V2 priority #1."

### 2. Frontend Tests

```bash
cd kalasetu-frontend && npx vitest run --reporter=verbose 2>&1
```

**If Vitest is not configured:**
Report: "Vitest not configured for frontend."

### 3. Report Results

```markdown
## Test Results

| Suite | Tests | Passed | Failed | Skipped | Time |
|-------|-------|--------|--------|---------|------|
| Backend | [n] | [n] | [n] | [n] | [n]s |
| Frontend | [n] | [n] | [n] | [n] | [n]s |
| **Total** | **[n]** | **[n]** | **[n]** | **[n]** | **[n]s** |

### Failed Tests
- **[test name]** (`file:line`)
  - Expected: [what was expected]
  - Got: [what actually happened]
  - Suggested fix: [concrete suggestion]

### Verdict: PASS / FAIL / NO TESTS
```

**Verdict rules:**
- **PASS** = zero test failures
- **FAIL** = any test failure
- **NO TESTS** = test infrastructure not configured

## Rules

- Always show the summary table, even if everything passes
- If no tests exist, report that clearly — don't silently pass
- Skipped tests count as a warning, not a failure
