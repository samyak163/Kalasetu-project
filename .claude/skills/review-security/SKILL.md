---
name: review-security
description: Security review with the security-reviewer agent (Opus). Use for any code with authentication, payments, file uploads, external API calls, or user input handling.
user-invocable: true
---

# Security Review

Reviews code for security vulnerabilities using the `security-reviewer` agent (Opus model). Mandatory for security-sensitive code.

## Usage

```
/review-security                                    # Review all changed files
/review-security controllers/paymentController.js   # Review a specific file
/review-security middleware/                         # Review middleware directory
/review-security auth                               # Review all auth-related files
/review-security payments                           # Review all payment-related files
```

## Arguments

| Argument | What It Does | When to Use |
|----------|-------------|-------------|
| _(none)_ | Review all changed files from git diff | Before commit of security-sensitive code |
| `[file path]` | Review a specific file | After modifying one file |
| `[directory]` | Review all files in a directory | After working in one area |
| `auth` | Review all authentication/authorization files | After auth changes |
| `payments` | Review all payment flow files | After payment changes |

## How It Works

### Target Detection

| Argument | Files Reviewed |
|----------|---------------|
| `auth` | `middleware/auth*.js`, `controllers/authController.js`, `controllers/userController.js`, `routes/auth*.js`, `routes/user*.js`, `utils/generateToken.js` |
| `payments` | `controllers/paymentController.js`, `routes/paymentRoutes.js`, `utils/razorpay.js`, any file importing razorpay |
| _(none)_ | All changed `.js` and `.jsx` files from git diff |
| `[path]` | Specified file or directory |

### Parallel Review
Same as `/review-code` — spawn separate agents per file, max 4 parallel.

## Execution Steps

1. **Identify files to review** (same detection logic as /review-code, but with security-focused file shortcuts)

2. **For each file, spawn security-reviewer agent with this prompt:**

```
Security review this file for the KalaSetu project (Node.js/Express artisan marketplace with MongoDB, Razorpay payments, Cloudinary uploads).

FILE: [path]
CONTEXT: [what this file does]

This app handles real money (Razorpay), user data, file uploads (Cloudinary), and dual auth (artisan + customer).
Go through ALL 10 security categories in your instructions.

If this file handles authentication/JWT: Categories 1 + 2 are HIGH PRIORITY.
If this file handles payments/Razorpay: Category 4 is HIGH PRIORITY.
If this file handles file uploads: Categories 5 + 6 are HIGH PRIORITY.
If this file handles user input/queries: Categories 3 + 6 are HIGH PRIORITY.
If this file calls external APIs: Category 9 is HIGH PRIORITY.

End with a REJECT / REVISE / APPROVE verdict.
```

3. **Collect results and present summary:**

```markdown
## Security Review Summary

| File | Verdict | Critical | High | Medium | Low |
|------|---------|----------|------|--------|-----|
| paymentController.js | REJECT | 1 | 2 | 0 | 1 |
| authMiddleware.js | APPROVE | 0 | 0 | 1 | 2 |

### Critical Issues (FIX IMMEDIATELY)
[list with exploit scenarios]

### High Issues (fix before any user exposure)
[list]
```

4. **STOP GATE (MANDATORY — DO NOT SKIP):**
   - Present the summary table and issue list
   - **STOP HERE. Do NOT implement any fixes.**
   - Do NOT start editing files based on the review feedback
   - Do NOT say "Let me fix these issues" or "I'll address these now"
   - Instead, say exactly: **"Security review complete. Run `/evaluate-review` to filter these suggestions before implementing, or tell me which issues to fix."**
   - Wait for the user to either run `/evaluate-review` OR explicitly say "fix issue X"
   - **Exception:** If a CRITICAL vulnerability is found with an active exploit path, warn the user urgently — but still don't auto-implement
   - This gate exists to prevent the LLM mirror problem — where the session blindly implements all reviewer suggestions without critical evaluation

5. **If ANY file gets REJECT:** Tell the user what needs fixing and why it's critical. Still do NOT auto-implement — wait for user direction.

## When to Use (MANDATORY)

| Code Type | Security Review Required? |
|-----------|--------------------------|
| Payment processing (Razorpay) | **YES — always** |
| Authentication middleware | **YES — always** |
| JWT token generation/validation | **YES — always** |
| File upload handling (Cloudinary) | **YES — always** |
| MongoDB queries with user input | **YES — always** |
| Admin routes and middleware | **YES — always** |
| Webhook handlers | **YES — always** |
| External API integrations | **YES — always** |
| UI components (no API calls) | No — use `/review-code` |
| Pure styling/layout changes | No |
| Static data/constants | No — use `/review-code` |
