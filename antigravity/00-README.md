# Antigravity Task Folder

This folder contains individual task files for fixing bugs and implementing improvements in KalaSetu. Each file is self-contained with all context needed for Claude to complete the task.

## How to Use

1. Open a new Claude session (or your AI tool)
2. Copy the ENTIRE contents of ONE task file
3. Paste it into Claude
4. Claude will have all context needed to complete the task
5. After completion, test the changes
6. Commit and move to the next task

## Task Files (19 Total)

### CRITICAL - Fix First (4 tasks)
| # | File | Description | Est. Complexity |
|---|------|-------------|-----------------|
| 01 | `01-FIX-messages-page-crash.md` | App crashes on /messages page | Easy |
| 02 | `02-FIX-bookings-page-stub.md` | Implement bookings page (currently stub) | Medium |
| 03 | `03-FIX-xss-vulnerability.md` | Security fix for search XSS | Easy |
| 04 | `04-FIX-authcontext-hydration.md` | React hydration issues | Easy |

### HIGH PRIORITY (6 tasks)
| # | File | Description | Est. Complexity |
|---|------|-------------|-----------------|
| 05 | `05-FIX-n1-query-dashboard.md` | Fix N+1 database queries | Medium |
| 06 | `06-FIX-button-color-consistency.md` | Fix inconsistent button colors | Easy |
| 07 | `07-CREATE-tailwind-design-tokens.md` | Create design system | Easy |
| 08 | `08-CREATE-button-component.md` | Create reusable Button | Medium |
| 09 | `09-CREATE-card-component.md` | Create reusable Card | Medium |
| 10 | `10-CREATE-modal-component.md` | Create reusable Modal | Medium |

### MEDIUM PRIORITY (5 tasks)
| # | File | Description | Est. Complexity |
|---|------|-------------|-----------------|
| 11 | `11-FIX-silent-error-handling.md` | Fix silent error catches | Easy |
| 12 | `12-FIX-payment-button-color.md` | Fix payment button color | Easy |
| 13 | `13-ADD-database-indexes.md` | Add missing DB indexes | Easy |
| 14 | `14-REMOVE-console-logs.md` | Remove console.log statements | Medium |
| 15 | `15-FIX-header-duplicate-code.md` | Extract LocationDropdown | Medium |

### CODE QUALITY (4 tasks)
| # | File | Description | Est. Complexity |
|---|------|-------------|-----------------|
| 16 | `16-CREATE-loading-component.md` | Create loading UI components | Medium |
| 17 | `17-CREATE-empty-state-component.md` | Create empty state components | Medium |
| 18 | `18-ADD-proptypes-validation.md` | Add PropTypes to components | Easy |
| 19 | `19-FIX-error-boundaries.md` | Add React error boundaries | Medium |

## Project Context

**Stack:** React 19 + Vite (frontend), Node.js + Express (backend), MongoDB, Tailwind CSS

**Key Paths:**
- Frontend: `kalasetu-frontend/src/`
- Backend: `kalasetu-backend/`
- Components: `kalasetu-frontend/src/components/`
- Pages: `kalasetu-frontend/src/pages/`
- Context: `kalasetu-frontend/src/context/`

**Brand Color:** #A55233 (terracotta/rust)

## After Each Task

After Claude completes a task:
1. Review the changes
2. Test the feature
3. If working, commit: `git add . && git commit -m "Fix: [task name]"`
4. Move to next task
