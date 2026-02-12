# Coding Conventions

**Analysis Date:** 2026-02-12

## Naming Patterns

**Files:**
- PascalCase for React components: `Header.jsx`, `LoginPage.jsx`, `ArtisanProfileEditor.jsx`
- camelCase for utilities, hooks, and services: `asyncHandler.js`, `useNotifications.js`, `authMiddleware.js`
- camelCase with "Controller" suffix for backend controllers: `authController.js`, `artisanController.js`, `adminDashboardController.js`
- camelCase with "Model" suffix for database models: `artisanModel.js`, `userModel.js`, `bookingModel.js`
- SCREAMING_SNAKE_CASE for constants: `SERVER_CONFIG`, `JOBS_CONFIG`, `API_CONFIG`

**Functions:**
- camelCase for all function names (both regular and async)
- Descriptive, single-responsibility names: `calculateDistance()`, `getDashboardStats()`, `bootstrapAuth()`
- Middleware functions use action verbs: `protect()`, `protectAdmin()`, `protectAny()`, `errorHandler()`, `notFound()`
- Export format: `export const functionName = async (req, res, next) => { ... }`

**Variables:**
- camelCase for all variables: `headerLocation`, `showNotifications`, `authToken`, `isVerified`
- Boolean variables prefixed with `is` or `show`: `isActive`, `isVerified`, `showModalDialog`, `isLoading`
- State variables use `set` prefix for setters from useState: `const [auth, setAuth] = useState(...)`
- Destructured variables from context/props: `const { auth, logout } = useContext(AuthContext)`

**Types:**
- Database schemas use singular nouns: `Artisan`, `User`, `Booking`, `Review`
- API route groupings use plural nouns: `/api/artisans`, `/api/users`, `/api/bookings`
- Singular protected resource routes: `/api/artisan` (authenticated), `/api/auth` (auth routes)
- Zod validation schemas: `registerSchema`, `loginSchema`, `forgotPasswordSchema`

## Code Style

**Formatting:**
- ESLint via `eslint.config.js` (frontend uses ESLint v9 with flat config)
- No Prettier integration found - ESLint handles formatting
- 2-space indentation (implicit in codebase)
- Semicolons required (ESLint rule)
- Max line length not explicitly enforced but kept reasonable

**Linting:**
- Frontend: `eslint.config.js` with recommended JS, React Hooks, and React Refresh rules
- Frontend ESLint rules:
  - `no-unused-vars`: Warns on unused variables, ignores uppercase-prefixed (constants) and `_`-prefixed (intentionally unused)
  - React Refresh disabled for context/provider files: `src/context/**/*.{js,jsx}`
- Backend: No ESLint configuration found - uses development-time checks only
- Run: `npm run lint` in frontend to check (CI reports errors with `continue-on-error: true`)

## Import Organization

**Order:**
1. Core React/external libraries: `import React, { useState, useContext }` or bare imports `import express`
2. Third-party libraries: `import axios`, `import { z } from 'zod'`, `import bcrypt`
3. Internal absolute imports/path aliases: `import Layout from './components/Layout'` (relative), `import api from '../lib/axios.js'`
4. Context/providers: `import { AuthContext } from '../context/AuthContext.jsx'`
5. Utility functions: `import { setSentryUser } from '../lib/sentry.js'`
6. Styles: Implicit via Tailwind (no CSS imports seen)

**Path Aliases:**
- No path alias configuration detected
- Frontend uses relative imports: `../context/`, `../lib/`, `../components/`
- Backend uses relative imports: `../models/`, `../controllers/`, `../middleware/`, `../utils/`
- Both use ES module imports (`import`/`export`) exclusively

**ES Modules:**
- Both frontend (Vite with `"type": "module"`) and backend (Node.js with `"type": "module"`) use ES modules
- All files use `import`/`export` syntax, no CommonJS (`require`/`module.exports`)

## Error Handling

**Patterns:**
- Backend controllers wrap async handlers with explicit try-catch blocks:
  ```javascript
  try {
    // logic
  } catch (error) {
    // Sentry capture optional
    res.status(statusCode).json({ success: false, message: error.message });
  }
  ```
- `asyncHandler()` utility in `utils/asyncHandler.js` wraps route handlers: `asyncHandler(fn)` catches Promise rejections and passes to error middleware
- Centralized error middleware in `middleware/errorMiddleware.js` handles:
  - Zod validation errors (400)
  - Mongoose validation errors (400)
  - Mongoose duplicate key errors (409)
  - JWT errors (401, 403)
  - Generic server errors (500)
- Frontend uses try-catch in async contexts or implicit error handling via axios interceptors

**Validation:**
- Backend uses Zod schemas at controller entry: `z.object({ field: z.string().email() })`
- Validation error messages passed from Zod through error middleware

## Logging

**Framework:** Native `console.log()` and `console.error()`

**Patterns:**
- Conditional logging only in dev mode: `if (import.meta.env.DEV) { console.log(...) }` (frontend)
- Error logging: `console.error('context', error)` (some legacy code)
- Removed in recent fixes: All `console.error` removed from admin controllers (per CLAUDE.md overhaul)
- Sentry integration in `utils/sentry.js`: `captureException(error, { request: {...} })`
- Request logging: Morgan middleware handles HTTP request logging (`morgan('dev')` in development)
- Analytics: PostHog tracking (`trackEvent()`) in event handlers, not inline logging

## Comments

**When to Comment:**
- JSDoc comments on hooks and major functions:
  ```javascript
  /**
   * Custom hook for handling notifications
   */
  export const useNotifications = () => { ... }
  ```
- Inline comments for non-obvious logic or important implementation details
- Comments explaining middleware placement: `// Relax React Refresh rule for context/provider files`
- No extensive comment requirements observed; code is self-documenting

**JSDoc/TSDoc:**
- Minimal JSDoc usage observed
- When used, documents purpose and parameters
- Zod schema comments inline: `// If value is an empty string, treat it as undefined`
- Request handler parameters not always documented

## Function Design

**Size:**
- Controllers range 60-100+ lines for complex operations (aggregations, multi-step logic)
- Utility functions stay focused: `escapeRegex()`, `calculateDistance()` are 5-10 lines
- Hooks under 50 lines for simple state management
- Custom hooks can be 80+ lines for complex setup (notifications, tracking)

**Parameters:**
- Express route handlers always `(req, res, next)` or `(req, res)` signature
- Async functions always return Promises via explicit `async` keyword
- Destructuring in parameters: `const { period = '30days' } = req.query`
- Default parameters common: `(message = 'OK', statusCode = 200)`

**Return Values:**
- Controllers return JSON responses: `res.status(200).json({ success: true, data: {...} })`
- Utility functions return values directly: `signJwt()` returns token string
- Hooks return objects with state and handlers: `{ subscribed, trackClick, trackError }`
- Middleware returns `next()` call (no explicit return)

## Module Design

**Exports:**
- Single default export for components: `export default App;`, `export default Header;`
- Named exports for utilities: `export const protect = ...`, `export const asyncHandler = ...`
- Context exports both Provider and Hook: `export const AuthContext = createContext()`, `export const useAuth = () => { ... }`
- Models export single default class: `export default Artisan;`

**Barrel Files:**
- Not extensively used; typically imports directly from individual files
- No index.js aggregation pattern observed in src/ structure
- Context components are full files: `AuthContext.jsx`, not `context/index.js`

## Special Conventions

**React Patterns:**
- Functional components with hooks exclusively
- Context for global state: `AuthContext`, `NotificationContext`, `AdminAuthContext`
- Lazy loading with React.lazy() for route components (seen in `App.jsx`)
- Suspense boundaries: `<Suspense fallback={<LoadingComponent />}>`

**Status Codes:**
- 200: Success, 201: Created, 400: Bad Request/Validation
- 401: Not Authenticated, 403: Forbidden/No Permission
- 404: Not Found, 409: Duplicate/Conflict
- 500: Server Error (with stack trace in dev mode)

**Response Format:**
- Consistent JSON: `{ success: true/false, message: string, data?: any, errors?: any }`
- Zod errors: `message` contains comma-separated validation messages
- Mongoose errors: `message` contains joined field messages

**Cookie/Auth:**
- JWT stored in HTTP-only cookie: `ks_auth` (artisan/user), `admin_token` (admin)
- `withCredentials: true` in axios for cookie inclusion
- Token verification in middleware: `jwt.verify(token, process.env.JWT_SECRET)`

---

*Convention analysis: 2026-02-12*
