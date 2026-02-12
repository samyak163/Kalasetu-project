# Technology Stack

**Analysis Date:** 2026-02-12

## Languages

**Primary:**
- JavaScript (ES2020+) - Frontend and backend
- JSX - React components in frontend

**Secondary:**
- JSON - Configuration files

## Runtime

**Environment:**
- Node.js 18+ (constraint: `>=18 <23` in `kalasetu-backend/package.json`)

**Package Manager:**
- npm - Lockfiles present in both frontend and backend (`package-lock.json`)

## Frameworks

**Core:**
- Express 4.21.2 - Backend REST API framework (`kalasetu-backend/package.json`)
- React 19.2.0 - Frontend UI library (`kalasetu-frontend/package.json`)
- Vite 7.1.12 - Frontend build tool and dev server (`kalasetu-frontend/package.json`)

**Routing:**
- React Router v7.9.5 - Frontend routing (`kalasetu-frontend/package.json`)

**State Management:**
- React Context API - Primary state management (`src/context/AuthContext.jsx`, multiple context files)
- Jotai 2.15.1 - Lightweight atom-based state management (`kalasetu-frontend/package.json`)

**Styling:**
- Tailwind CSS 3.4.18 - Utility-first CSS framework (`kalasetu-frontend/package.json`)
- PostCSS 8.5.6 - CSS processor with Autoprefixer plugin (`kalasetu-frontend/package.json`)

**Database:**
- MongoDB 8.19.2 (via Mongoose) - Document database (`kalasetu-backend/package.json`)
- Mongoose 8.19.2 - MongoDB ODM (`kalasetu-backend/package.json`)
- ES modules configured (`"type": "module"` in backend `package.json`)

**Build/Dev Tools:**
- Vite 7.1.12 - Frontend build and dev server
- Nodemon 3.1.10 - Node development file watcher (`kalasetu-backend/package.json`)
- Vite PWA Plugin 0.21.2 - Progressive Web App support (`kalasetu-frontend/package.json`)
- Autoprefixer 10.4.21 - CSS vendor prefixing (`kalasetu-frontend/package.json`)

**Linting:**
- ESLint 9.33.0 - JavaScript linting (`kalasetu-frontend/package.json`)
- ESLint Config: `eslint.config.js` with Flat Config system
- Plugins: `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Rules: Warns on unused vars, enforces React Hooks rules

## Key Dependencies

**Critical (Backend):**
- `@sentry/node` 10.22.0 - Error tracking and monitoring
- `@upstash/qstash` v2.8.4 - Background job queue for async tasks
- `@upstash/redis` v1.35.6 - Redis cache client (REST-based)
- `algoliasearch` 5.42.0 - Search service client
- `bcryptjs` 2.4.3 - Password hashing
- `cloudinary` 2.8.0 - Image upload and CDN
- `express` 4.21.2 - Web framework
- `firebase-admin` 13.5.0 - Firebase authentication (backend)
- `helmet` 7.2.0 - Security headers middleware
- `hpp` 0.2.3 - HTTP Parameter Pollution protection
- `jsonwebtoken` 9.0.2 - JWT authentication
- `mongoose` 8.19.2 - MongoDB object modeling
- `multer` 2.0.2 - File upload middleware
- `razorpay` 2.9.6 - Payment gateway client
- `resend` 6.4.0 - Email service client
- `stream-chat` 9.25.0 - Real-time chat provider client
- `zod` 3.25.76 - Request validation and schema parsing

**Critical (Frontend):**
- `@daily-co/daily-js` 0.85.0 - Video call platform SDK
- `@daily-co/daily-react` 0.24.0 - React wrapper for Daily.co
- `@sentry/react` 10.22.0 - Error tracking for React
- `firebase` 12.5.0 - Firebase authentication (frontend)
- `react` 19.2.0 - UI framework
- `react-dom` 19.2.0 - DOM rendering
- `react-router-dom` 7.9.5 - Routing
- `stream-chat` 9.25.0 - Chat client
- `stream-chat-react` 13.10.2 - React chat UI components
- `algoliasearch` 5.42.0 - Search client
- `react-instantsearch` 7.17.0 - React search UI components

**Utilities (Backend):**
- `axios` 1.13.1 - HTTP client
- `cookie-parser` 1.4.7 - Cookie parsing middleware
- `cors` 2.8.5 - CORS middleware
- `dotenv` 16.6.1 - Environment variable loading
- `express-rate-limit` 7.5.1 - API rate limiting
- `morgan` 1.10.1 - HTTP request logging
- `nanoid` 5.1.6 - Unique ID generation
- `nodemailer` 7.0.10 - Email sending (legacy, replaced by Resend)
- `posthog-node` 5.11.0 - Analytics tracking

**Utilities (Frontend):**
- `axios` 1.13.1 - HTTP client
- `react-helmet-async` 2.0.5 - Document head management for SEO
- `i18next` 23.11.5 - Internationalization framework
- `react-i18next` 14.1.1 - React i18n binding
- `lucide-react` 0.475.0 - Icon library
- `posthog-js` 1.284.0 - Analytics tracking
- `prop-types` 15.8.1 - Runtime type checking
- `logrocket` 10.1.0 - Session replay and logging
- `logrocket-react` 6.0.3 - React integration for LogRocket
- `react-onesignal` 3.4.0 - Push notifications client
- `recharts` 2.15.4 - React charting library
- `jotai` 2.15.1 - State management atoms
- `@vis.gl/react-google-maps` 1.7.0 - Google Maps React wrapper
- `@react-google-maps/api` 2.20.7 - Alternative Google Maps binding

**Email Templates (Backend):**
- `@react-email/components` 0.5.7 - Email component library
- `react-email` 4.3.2 - React email template rendering

**Maps/Geolocation (Backend):**
- `@googlemaps/google-maps-services-js` 3.4.2 - Google Maps API client

## Configuration Files

**Backend:**
- `server.js` - Main entry point with middleware setup
- `config/db.js` - MongoDB connection configuration
- `config/env.config.js` - Centralized environment variable configuration with all service configs
- `.env.example` - Environment variables template (extensive)
- `package.json` - Scripts: `dev`, `start`, cleanup, seed, admin creation

**Frontend:**
- `vite.config.js` - Vite build configuration with PWA plugin and manual code chunking
- `tailwind.config.js` - Tailwind CSS theming (brand colors, fonts, shadows, animations)
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer
- `eslint.config.js` - ESLint Flat Config with React hooks and refresh rules
- `vercel.json` - Vercel deployment SPA fallback rewrite
- `.env.example` - Environment variables template with VITE_ prefixes

## Platform Requirements

**Development:**
- Node.js 18+
- npm package manager
- Code editor (Cursor/VS Code recommended)
- Git for version control

**Production:**
- Backend: Render, Vercel, or any Node.js hosting
- Frontend: Vercel, Netlify, or any static host
- Database: MongoDB Atlas (cloud) or self-hosted MongoDB
- CDN: Cloudinary for image hosting

**External Services Required:**
- MongoDB Atlas account
- Cloudinary account (image uploads)
- Razorpay account (payments)
- Stream Chat account (messaging)
- Daily.co account (video calls)
- Sentry account (error tracking)
- Resend or other email provider
- Algolia account (search)
- Firebase account (authentication)
- OneSignal account (push notifications)
- Google Maps API key
- Upstash Redis/QStash (background jobs, caching)

---

*Stack analysis: 2026-02-12*
