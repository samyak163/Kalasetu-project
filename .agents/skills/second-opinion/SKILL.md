---
name: second-opinion
description: Get a fresh perspective from the second-brain agent (Opus). Challenges ideas, researches alternatives, and pushes back on surface-level thinking. Use for architecture decisions, design debates, and strategy questions.
user-invocable: true
---

# Second Opinion

Spawns the `second-brain` agent (Opus) to challenge, improve, or validate your ideas. This agent researches real-world solutions, pushes back on assumptions, and gives honest recommendations.

## Usage

```
/second-opinion "Should we use Context or Jotai for booking state?"
/second-opinion "Is our dual auth system overengineered?"
/second-opinion "Review our payment flow vs what Swiggy/Zomato do"
/second-opinion compare "Algolia vs Meilisearch for artisan search"
/second-opinion challenge "Our artisan verification design"
```

## Arguments

| Argument | What It Does | When to Use |
|----------|-------------|-------------|
| `"question or idea"` | Get a researched opinion on your question | Any design/architecture question |
| `compare "X vs Y"` | Deep comparison of two approaches | Choosing between technologies |
| `challenge "topic"` | Adversarial review — find weaknesses | Stress-testing a decision |
| `validate "decision"` | Confirm a decision is sound with evidence | Before committing to a major choice |

## How It Works

1. **Takes your input** — the question, comparison, or idea to challenge
2. **Reads project context** — AGENTS.md, ARCHITECTURE.md, relevant code (only what's needed)
3. **Researches real-world solutions** — searches how 3+ real products handle the same problem
4. **Generates alternatives** — 2-3 other approaches you may not have considered
5. **Gives honest recommendation** — with tradeoffs, not just "both are fine"

## Execution

Spawn the `second-brain` agent with this prompt:

```
The user wants a second opinion on: [user's input]

MODE: [question / compare / challenge / validate]

Research this thoroughly before answering:
1. Search how 3+ real products handle this
2. Find expert opinions or documented patterns
3. Compare against what was proposed
4. Give your honest recommendation with tradeoffs

Read project context from AGENTS.md and docs/ only if relevant.
Do NOT agree just to be agreeable. Push back if the idea is flawed.
```

## When to Use

| Signal | Action |
|--------|--------|
| "Both options seem equivalent" | `/second-opinion compare "X vs Y"` |
| "I'm not sure this design is right" | `/second-opinion challenge "the design"` |
| "Is this how other products do it?" | `/second-opinion "how do others handle X?"` |
| "We decided X but I'm second-guessing" | `/second-opinion validate "our X decision"` |
| Before any major architectural decision | `/second-opinion` — always worth the 2 minutes |

## What This Is NOT

- Not a code reviewer (use `/review-code`)
- Not a security auditor (use `/review-security`)
- Not for quick factual questions (just ask directly)
- Not for implementation (it challenges and recommends, doesn't write code)
