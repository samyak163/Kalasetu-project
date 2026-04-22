---
name: evaluate-review
description: Critically evaluate code review feedback, scan for missed issues, cache research, then implement accepted changes. Full review-to-fix workflow that fights the LLM mirror problem.
user-invocable: true
---

# Evaluate Review Feedback

Spawns the `review-evaluator` agent to critically assess code review feedback, then implements only validated changes.

## Usage

```
/evaluate-review                    # Paste review feedback when prompted
/evaluate-review "the feedback"     # Pass feedback directly
/evaluate-review --eval-only        # Evaluate only, don't implement
```

## Phases

### Phase 1: Spawn Evaluator Agent

```
Evaluate this code review feedback for the KalaSetu project.

REVIEW FEEDBACK: [feedback]
FILES REVIEWED: [paths]
REVIEWER: [who]

Read the actual code files first. Evaluate each suggestion (ACCEPT/MODIFY/DEFER/REJECT).
Scan for related issues the reviewer missed.
```

### Phase 2: Cache Research (if any)

Save web research findings to `research-cache/[topic].md`.

### Phase 3: Present Summary

Show verdict counts, what will be implemented, deferred, rejected.

**If `--eval-only`:** Stop here.

### Phase 4: Implement Changes

Implement ACCEPT and MODIFY items in the evaluator's recommended order.

### Phase 5: Final Summary

Report changes made. Suggest `/build-check` to verify.
