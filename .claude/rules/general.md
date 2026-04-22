Full-stack artisan marketplace: kalasetu-backend/ (Node.js/Express API), kalasetu-frontend/ (React JSX + Vite + Tailwind).

DUAL AUTH RULE:
Two user types with separate models and middleware:
- Artisans: `/api/auth/*` routes, `protect` middleware, Artisan model
- Customers: `/api/users/*` routes, `userProtect` middleware, User model
- Either type: `protectAny` middleware (tries User first, then Artisan, sets req.accountType)
- Admin: `protectAdmin` middleware, reads `admin_token` cookie
ALWAYS use the correct middleware for the user type the route serves.

BACKEND PATTERNS:
- ES modules (`"type": "module"` in package.json)
- asyncHandler wraps all async route handlers
- Zod for request validation via validateRequest middleware
- Centralized error handling via errorMiddleware.js
- Environment validation via validateEnv.js on startup

FRONTEND PATTERNS:
- React 18 with JSX (no TypeScript)
- React Router v7 for routing
- React Context for state (AuthContext, ChatContext, NotificationContext)
- Jotai for lightweight state
- Tailwind CSS for styling

EXTERNAL SERVICES (handle failures gracefully):
Cloudinary (images), Algolia (search), Stream Chat (messaging), Daily.co (video),
Razorpay (payments), OneSignal (push), Resend (email), QStash (jobs),
Upstash Redis (cache), Firebase Admin (social auth)
