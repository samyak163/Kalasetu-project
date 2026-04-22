---
name: check-deps
description: Scan all npm dependencies (backend + frontend), check for outdated/vulnerable packages, and generate an actionable update report.
user-invocable: true
---

# Dependency Check

Scans all npm dependencies, checks versions, flags vulnerabilities, generates a report.

## Usage

```
/check-deps              # Full scan — backend + frontend
/check-deps backend      # Only backend dependencies
/check-deps frontend     # Only frontend dependencies
/check-deps security     # Only check for known vulnerabilities (fast)
```

## How It Works

### Step 1: Spawn dependency-checker agent

```
Scan all npm dependencies in this project and generate a full audit report.
SCOPE: [all / backend / frontend / security]
Read package.json files. Check versions. Run npm audit. Generate report.
```

### Step 2: Save report

Save to `docs/development/DEPENDENCY_AUDIT.md`.

### Step 3: Present summary

```markdown
## Dependency Check Complete

**Report saved to:** docs/development/DEPENDENCY_AUDIT.md

| Category | Count |
|----------|-------|
| Total dependencies | X |
| Up to date | X |
| Outdated (minor) | X |
| Outdated (major) | X |
| Vulnerabilities | X |

**Immediate actions:** [count] security fixes needed
```
