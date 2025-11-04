# Kalasetu Project Structure Guide

This document provides a comprehensive overview of the Kalasetu project, detailing all major directories and files, along with a brief description of their purpose.

---

## Root Directory
- `ANALYTICS_TOOLS_IMPLEMENTATION.md` — Analytics tools documentation
- `ARTISAN_DASHBOARD_IMPLEMENTATION.md` — Artisan dashboard implementation notes
- `COMMUNICATION_TOOLS_IMPLEMENTATION.md` — Communication tools documentation
- `DEPLOYMENT_CHECKLIST_COMMUNICATION.md` — Deployment checklist for communication tools
- `DEPLOYMENT.md` — General deployment guide
- `EMAIL_SERVICE_README.md` — Email service documentation
- `ENV_AUDIT_REPORT.md` — Environment audit report
- `ENV_SETUP_GUIDE.md` — Environment setup instructions
- `ENV_VARIABLES_COMMUNICATION.md` — Environment variables for communication
- `GOOGLE_MAPS_SETUP.md` — Google Maps setup guide
- `GOOGLE_MAPS_VISUAL_GUIDE.md` — Visual guide for Google Maps integration
- `IMPLEMENTATION_SUMMARY_COMMUNICATION.md` — Communication implementation summary
- `IMPLEMENTATION_SUMMARY.md` — General implementation summary
- `IMPROVEMENTS.md` — List of improvements and suggestions
- `INTEGRATION_SETUP.md` — Integration setup guide
- `MAPS_AND_CACHING_README.md` — Maps and caching documentation
- `PROJECT_STRUCTURE_GUIDE.md` — This file: project structure guide
- `QUICK_FIX_ENV.md` — Quick fixes for environment issues
- `QUICK_REFERENCE_ANALYTICS.md` — Quick reference for analytics
- `QUICK_REFERENCE_COMMUNICATION.md` — Quick reference for communication
- `QUICK_REFERENCE.md` — General quick reference
- `QUICKSTART.md` — Quickstart guide
- `README.md` — Main project readme
- `RESEND_IMPLEMENTATION_SUMMARY.md` — Resend implementation summary
- `TOOLS_AND_SERVICES_LIST.md` — List of tools and services
- `USAGE_EXAMPLES_ANALYTICS.md` — Analytics usage examples

---

## Backend: `kalasetu-backend/`
- `package.json` — Backend dependencies and scripts
- `server.js` — Main server entry point
- `serviceAccountKey.json` — Firebase service account credentials

### Backend Subdirectories
- `config/` — Configuration files
  - `cloudinary.js` — Cloudinary config
  - `db.js` — Database config
  - `env.config.js` — Environment config
  - `firebaseAdmin.js` — Firebase admin config
- `controllers/` — Express controllers
  - `artisanController.js`, `artisanProfileController.js`, `authController.js`, `chatController.js`, `contactController.js`, `jobController.js`, `notificationController.js`, `paymentController.js`, `searchController.js`, `userAuthController.js`, `videoController.js`
- `jobs/` — Job handlers
  - `jobHandlers.js` — Background job logic
- `middleware/` — Express middleware
  - `analyticsMiddleware.js`, `authMiddleware.js`, `cacheMiddleware.js`, `errorMiddleware.js`, `userProtectMiddleware.js`, `validateRequest.js`
- `models/` — Mongoose models
  - `artisanModel.js`, `paymentModel.js`, `reviewModel.js`, `userModel.js`
- `routes/` — Express routes
  - `artisanProfileRoutes.js`, `artisanRoutes.js`, `authRoutes.js`, `chatRoutes.js`, `contactRoutes.js`, `jobRoutes.js`, `notificationRoutes.js`, `paymentRoutes.js`, `searchRoutes.js`, `uploadRoutes.js`, `userAuthRoutes.js`, `videoRoutes.js`
- `scripts/` — Utility scripts
  - `indexArtisans.js` — Artisan indexing script
- `utils/` — Utility functions
  - `algolia.js`, `asyncHandler.js`, `audit.js`, `crypto.js`, `dailyco.js`, `email.js`, `generateToken.js`, `jobQueue.js`, `notificationTemplates.js`, `onesignal.js`, `posthog.js`, `qstash.js`, `razorpay.js`, `redis.js`, `sentry.js`, `streamChat.js`, `validateEnv.js`

---

## Frontend: `kalasetu-frontend/`
- `eslint.config.js` — ESLint configuration
- `index.html` — Main HTML file
- `package.json` — Frontend dependencies and scripts
- `postcss.config.js` — PostCSS configuration
- `README.md` — Frontend readme
- `tailwind.config.js` — Tailwind CSS configuration
- `vite.config.js` — Vite build configuration

### Frontend Subdirectories
- `public/` — Static assets
- `src/` — Source code (React components, pages, hooks, etc.)

---

## How to Use This Guide
- Use this document to understand the overall structure and locate files quickly.
- Refer to individual README and implementation files for detailed instructions on each module.

---

## Notes
- Some directories may contain additional files not listed here as the project evolves.
- For more details on specific modules, see the corresponding documentation files in the root directory.

---

_Last updated: November 3, 2025_
