---
name: research-cache
description: Fetches current research on a technical topic and stores it to research-cache/ for persistent reuse across sessions
user-invocable: true
---

# Research Cache Skill

Persistent research system that fetches once, reuses forever across sessions.

## How It Works

**You invoke:** `/research-cache razorpay-webhooks`

**System does:**
1. Check if `research-cache/razorpay-webhooks.md` exists
2. If exists, check freshness (see INDEX.md)
   - If fresh (<30 days): return cached version
   - If stale: fetch new research, update file, timestamp
3. If missing: fetch new research, save to cache
4. Return: markdown file + key findings

**Result:** Markdown file saved to `research-cache/`, readable by any future session

---

## Usage

```
/research-cache [topic]
```

Topics (examples):
- `razorpay-webhooks`
- `mongoose-aggregation`
- `algolia-instantsearch`
- `stream-chat-react`
- `daily-video-calls`
- `cloudinary-signed-uploads`
- `react-router-v7`
- `onesignal-web-push`
- `upstash-redis-caching`
- `zod-validation-patterns`

---

## What Gets Saved

File location: `research-cache/[topic].md`

Format:
```markdown
# [Topic] — Research Snapshot
**Fetched:** [ISO date]
**Status:** [Current/Stable/Changing]
**Sources:** [official doc links]

## Key Findings
...

## Code Examples
...

## Gotchas
...

## KalaSetu Notes
...
```

---

## Freshness Tracking

`research-cache/INDEX.md` tracks:
- What topics are cached
- When they were last fetched
- Freshness status (Current = <30 days, Stale = >30 days)

Updated automatically every time you fetch.

---

## Integration with Sessions

**Workflow:**

1. **During development:** "I need to check current Razorpay webhook patterns"
   - Main session invokes: `/research-cache razorpay-webhooks`
   - Returns: cached version OR fresh research
   - Main session continues building

2. **Next session:** "What was the Razorpay webhook setup from last research?"
   - Main session reads: `research-cache/razorpay-webhooks.md`
   - No re-research needed
   - Uses current snapshot

3. **When stale:** "This is 60 days old, let me refresh"
   - Invoke: `/research-cache razorpay-webhooks --force`
   - Fetches fresh research
   - Updates timestamp
   - Continues with current info

---

## Files Involved

```
research-cache/
├── INDEX.md                          # Freshness tracking + topics list
├── razorpay-webhooks.md              # Example topic
├── mongoose-aggregation.md
├── algolia-instantsearch.md
└── [more topics as discovered]
```
