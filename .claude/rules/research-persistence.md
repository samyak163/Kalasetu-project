# Research Persistence Rule

## Problem
Research done during conversations or by agents gets lost on context reset. Token-expensive research vanishes.

## Rule: Save All Non-Trivial Research

**When you research a topic** (web search, web fetch, deep codebase exploration) that produces findings worth reusing:

1. **Save to research-cache/** — Write a `research-cache/[topic].md` file
2. **Update INDEX.md** — Add entry to `research-cache/INDEX.md`
3. **Do this immediately** — Don't wait until end of session

## What Counts as "Worth Saving"

- Any web research with 3+ sources consulted
- Technology comparison or evaluation
- API documentation summaries
- Competitor analysis findings
- Architecture decision research
- Payment/integration flow documentation

## What Does NOT Need Saving

- Quick one-off lookups (single URL, single fact)
- Codebase-internal searches (file contents, function signatures)
- Debugging research (specific to a transient bug)

## Format

```markdown
# [Topic Name]

> Fetched: YYYY-MM-DD
> Sources: [list URLs]

## Summary
[2-3 sentence overview]

## Details
[Organized findings]

## Relevance to KalaSetu
[How this applies to our project]
```

## Agent Research

When spawning research-fetcher or any agent that does web research:
- Include explicit instruction: "Save findings to research-cache/[topic].md"
- The agent should write the file directly
- Parent should verify the file was created

## Why This Matters

Every research session costs tokens. Saving results means:
- Future sessions read the file instead of re-researching
- Context resets don't lose institutional knowledge
- Research compounds over time
