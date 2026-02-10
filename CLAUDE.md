# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KalaSetu is a full-stack artisan marketplace platform connecting traditional artisans with customers. It consists of a React frontend and Node.js/Express backend with MongoDB.

## Development Commands

### Backend (kalasetu-backend/)
```bash
npm run dev          # Start development server with nodemon (port 5000)
npm start            # Start production server
npm run seed:core    # Seed core data (categories, demo accounts)
npm run create:admin # Create admin account
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

## Demo Accounts

- Artisan: `showcase.artisan@demo.kalasetu.com` / `Demo@1234`
- User: `showcase.user@kalasetu.com` / `Demo@1234`
- Admin: `showcase.admin@kalasetu.com` / `SuperAdmin@123`
