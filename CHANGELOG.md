# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-10-30

- Completed secure login implementation for both artisans and users
  - Backend: implemented password hashing, JWT token generation/validation, and auth middleware.
  - Files touched (examples): `kalasetu-backend/controllers/authController.js`, `kalasetu-backend/controllers/userAuthController.js`, `kalasetu-backend/middleware/authMiddleware.js`, `kalasetu-backend/models/userModel.js`.
  - Frontend: wired auth context and protected routes (`kalasetu-frontend/src/context/AuthContext.jsx`, `kalasetu-frontend/src/components/RequireAuth.jsx`).
  - Notes: Login flows for both artisan and customer are secured via hashed passwords and JWT-based authentication. Remember to rotate tokens/keys and review token expiry and refresh strategy in production.

### How to commit & push

Suggested commit title:

```
feat(auth): complete secure login for artisans and users
```

Suggested commit body:

```
Completed secure login flows for both artisan and customer users.

- Backend: added password hashing (bcrypt), JWT generation and verification, updated auth middleware to protect routes.
- Frontend: connected AuthContext and RequireAuth to frontend routes and login/register pages.
- Verified basic flows locally; further review recommended for token refresh and rate-limiting.

Files of note: kalasetu-backend/controllers/*, kalasetu-backend/middleware/*, kalasetu-frontend/src/context/AuthContext.jsx

Signed-off-by: Developer
```
