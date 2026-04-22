---
name: competitor-intel
description: Scan competitors (UrbanCompany, Sulekha, etc.) for user complaints, bugs, feature requests, praise, and community solutions. Sources — Play Store reviews, Reddit, web-indexed tweets, consumer forums.
user-invocable: true
---

# Competitor Intelligence Skill

Automated competitive intelligence for Indian service/artisan marketplaces.

## Usage

```
/competitor-intel              # Default: run a scan
/competitor-intel scan         # Search web sources for competitor mentions
/competitor-intel add "text"   # Manually add a finding
/competitor-intel review       # Score raw findings against our plan
/competitor-intel digest       # Generate/show weekly digest
/competitor-intel status       # Show stats
```

## Mode: `scan` (default)

Spawns the `competitor-intel` agent to search public sources.

**Competitors monitored:**
- **Tier 1 (60%):** UrbanCompany, Sulekha
- **Tier 2 (30%):** Justdial, Housejoy, TaskRabbit, Thumbtack
- **Tier 3 (10%):** Etsy, Fiverr, Upwork (marketplace patterns)

**Output:** Writes to `research-cache/competitor-intel/raw/YYYY-MM-DD.md`

## Mode: `add "text"`

Manually add findings from browsing. Categorize and append to manual findings.

## Mode: `review`

Score unscored findings against KalaSetu's plan:
- Read `docs/product/V1_SCOPE.md` and `docs/product/CORE_FEATURES.md`
- Score each finding (0-10) for KalaSetu relevance
- Update `research-cache/competitor-intel/DIGEST.md`

## Mode: `digest`

Show weekly summary: top findings, patterns, gaps, confirmed strengths.
