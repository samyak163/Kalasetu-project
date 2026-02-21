# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KalaSetu is a full-stack artisan marketplace platform connecting traditional artisans with customers. It consists of a React frontend and Node.js/Express backend with MongoDB.

## Development Commands

### Backend (kalasetu-backend/)
```bash
npm run dev          # Start development server with nodemon (port 5000)
npm start            # Start production server
npm run seed         # Wipe DB + seed showcase data (1 artisan, 1 user, 1 admin)
npm run cleanup:dry  # Preview what cleanup would delete
npm run cleanup      # Remove non-demo artisans and all users
npm run check:artisans # Verify artisan data
```

### Frontend (kalasetu-frontend/)
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build
npm run lint         # ESLint check
npm run preview      # Preview production build
```

## Architecture

### Two User Types
The platform has two distinct user types with separate authentication flows:
- **Artisans**: Service providers who create profiles and offer services
  - Auth routes: `/api/auth/*` (register, login, logout, me)
  - Protected routes use `protect` middleware
- **Users (Customers)**: Browse and book artisan services
  - Auth routes: `/api/users/*` (register, login, logout, me)
  - Protected routes use `userProtect` middleware

The `protectAny` middleware authenticates either user type and sets `req.accountType` to 'user' or 'artisan'.

### Frontend Auth Context
`AuthContext.jsx` handles both user types with a unified state:
```js
{ user: object, userType: 'artisan' | 'user' | null }
```
On bootstrap, it tries `/api/users/me` first, then `/api/auth/me`.

### Backend Route Structure
- `/api/artisans` - Public artisan data (profiles, search)
- `/api/artisan` - Authenticated artisan profile management (singular)
- `/api/auth` - Artisan authentication
- `/api/users` - User authentication
- `/api/bookings`, `/api/payments`, `/api/reviews` - Core marketplace features
- `/api/chat`, `/api/video`, `/api/calls` - Communication features (Stream Chat, Daily.co)
- `/api/admin` - Admin panel (separate auth via `admin_token` cookie)

### Key Integrations
- **Database**: MongoDB with Mongoose (ES modules)
- **Auth**: JWT in HTTP-only cookies (`ks_auth` for users/artisans, `admin_token` for admins)
- **Images**: Cloudinary (signed uploads)
- **Search**: Algolia InstantSearch
- **Real-time Chat**: Stream Chat
- **Video Calls**: Daily.co
- **Payments**: Razorpay
- **Push Notifications**: OneSignal
- **Background Jobs**: QStash
- **Caching**: Upstash Redis (optional)
- **Analytics**: PostHog, Sentry, LogRocket

### Frontend Structure
- State management via React Context (AuthContext, ChatContext, NotificationContext, etc.)
- Jotai for lighter state needs
- React Router v7 for routing
- Tailwind CSS for styling
- Vite with PWA support

### Backend Patterns
- ES modules (`"type": "module"` in package.json)
- Zod for request validation
- `asyncHandler` utility wraps async route handlers
- Centralized error handling via `errorMiddleware.js`
- Environment validation via `validateEnv.js`

## Environment Variables

Backend requires: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `COOKIE_NAME`, `CORS_ORIGINS`, Cloudinary credentials. See `.env.example`.

Frontend requires: `VITE_API_URL` and various `VITE_*` keys for Firebase, Algolia, Stream, etc. See `.env.example`.

## Testing Notes

- CI runs via GitHub Actions (`.github/workflows/ci.yml`)
- Backend has no test suite configured yet (CI checks for test script existence)
- Frontend linting runs in CI with `continue-on-error: true`

## Demo Accounts (via `npm run seed`)

- Artisan: `priya@kalasetu.demo` / `Demo@1234` (Priya Sharma — Mehendi Artist, publicId: auto-generated)
- User: `rahul@kalasetu.demo` / `Demo@1234` (Rahul Deshmukh)
- Admin: `admin@kalasetu.demo` / `Admin@1234` (KalaSetu Admin)

## Security Rules

- **Never read:** `.env`, `serviceAccountKey.json`, `*.key`, `*.pem`. Only `.env.example`.
- **Never do:** Commit secrets, log sensitive data, expose internal errors in API responses, store plain-text passwords.
- **Auth awareness:** Two separate auth systems (artisan + user). Always verify which middleware (`protect` vs `userProtect` vs `protectAny`) is appropriate for a route.

## Documentation Map

| Folder | Purpose |
|--------|---------|
| `docs/product/` | Mental model, core features, V1/V2 scope |
| `docs/technical/` | Architecture, system diagrams |
| `docs/development/` | Workflow, daily status, session handover |
| `docs/development/daily-archive/` | Archived daily statuses |
| `docs/research/` | Technical and product research |
| `docs/` (root) | API docs, integrations guide, setup, CI/CD |
| `kalasetu-backend/docs/` | Database schema and ER diagrams |

## Session Management

- **Start of session:** Read `docs/development/HANDOVER.md` for current state
- **During session:** Track progress in `docs/development/DAILY_STATUS.md`
- **End of session:** Update HANDOVER.md, commit clean state
- **Full workflow:** See `docs/development/DAILY_WORKFLOW.md`

## Quality Gates

- After code changes: run `npm run dev` in backend to verify no crashes
- Before commit: `npm run lint` in frontend, manual API testing
- For complex changes: use code-reviewer agent
- Before feature complete: verify both artisan and user flows work

## Token Reduction

**Never scan:** `node_modules/`, `dist/`, `build/`, `.git/`, `package-lock.json`, `*.min.*`

**Read only when needed:** `kalasetu-backend/docs/` (database docs), `docs/` root-level docs
