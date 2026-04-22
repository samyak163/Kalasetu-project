---
name: changelog
description: Document git changes into numbered changelog entries. Spawns a changelog-writer agent (Sonnet) to write structured entries from commits.
user-invocable: true
---

# Changelog

Reads recent git pushes and creates numbered changelog entries in `docs/development/changelog/`.

## Usage

```
/changelog              # Document new commits since last entry
/changelog week         # Document all commits from the past week
/changelog range abc..def  # Document a specific commit range
/changelog all          # Document ALL undocumented commits
```

## How It Works

### Step 1: Determine What to Document

1. Read `docs/development/changelog/INDEX.md` to find the last documented commit SHA
2. Based on argument:
   - _(none)_: `git log --oneline [last-sha]..HEAD`
   - `week`: `git log --oneline --since="1 week ago"`
   - `range [a]..[b]`: `git log --oneline [a]..[b]`
   - `all`: all commits not yet in any changelog entry
3. If no new commits → report "No new changes to document" and stop

### Step 2: Get Commit Details

For the commits to document, run:
```bash
git log --format="Commit: %h%nDate: %ad%nMessage: %s%n---" --date=short [range]
git log --stat --no-merges [range]
```

### Step 3: Determine Next Entry Number

Read INDEX.md, find the highest entry number, add 1. If INDEX.md is empty or missing, start at 1.

### Step 4: Spawn changelog-writer Agent

Spawn the `changelog-writer` agent (use model: sonnet) with:

```
Document these git changes for the KalaSetu project.

ENTRY NUMBER: [next number]
COMMITS:
[commit list with messages and file stats]

Write the entry following your changelog format.
Give it a short descriptive title based on the theme of changes.
```

### Step 5: Save Entry

Write the agent's output to `docs/development/changelog/[number].md`

Naming: zero-padded 3 digits — `001.md`, `002.md`, ..., `010.md`, etc.

### Step 6: Update INDEX.md

Append a new row to the INDEX.md table:

```markdown
| [number] | [title] | [date] | [commit count] | [last-sha] |
```

### Step 7: Report

```
Changelog entry #[number] written: "[title]"
  Path: docs/development/changelog/[number].md
  Commits documented: [count]
  Range: [first-sha]...[last-sha]
```

## Entry Grouping Rules

- If 1-5 commits with a clear theme → 1 entry
- If 6-15 commits spanning multiple themes → 1 entry (group by area inside)
- If 15+ commits → split into multiple entries by phase/theme (e.g., all phase-01 commits = 1 entry, all phase-02 = another)
- Docs-only commits can be grouped into a single "Documentation" section within an entry
- Never create an entry for a single docs commit unless it's significant (like a new architecture doc)

## Folder Structure

```
docs/development/changelog/
├── INDEX.md       # Master index with all entries
├── 001.md         # First entry
├── 002.md         # Second entry
└── ...
```
