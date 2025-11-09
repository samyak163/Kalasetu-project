# 🚀 KalaSetu Setup Guide

Complete setup instructions for the KalaSetu platform.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Firebase Setup](#firebase-setup)
- [Database Setup](#database-setup)
- [External Services](#external-services)
- [Development Workflow](#development-workflow)
- [Common Issues](#common-issues)

---

## Prerequisites

- **Node.js:** v18+ (v20+ recommended)
- **MongoDB:** Local instance or MongoDB Atlas account
- **Git:** For version control
- **Package Manager:** npm (comes with Node.js)

### Optional Services
- Firebase account (for authentication)
- Cloudinary account (for image uploads)
- Google Maps API key (for location features)
- Algolia account (for search)
- Various communication tools (see [INTEGRATIONS.md](./INTEGRATIONS.md))

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/samyak163/Kalasetu-project.git
cd Kalasetu-project
```

### 2. Install Dependencies

**Backend:**
```bash
cd kalasetu-backend
npm install
```

**Frontend:**
```bash
cd kalasetu-frontend
npm install
```

### 3. Configure Environment Variables

Copy the example environment files:

**Backend:**
```bash
cd kalasetu-backend
copy .env.example .env
# Edit .env with your configuration
```

**Frontend:**
```bash
cd kalasetu-frontend
copy .env.example .env
# Edit .env with your configuration
```

### 4. Start Development Servers

**Backend (Terminal 1):**
```bash
cd kalasetu-backend
npm run dev
```
Server will start on http://localhost:5000

**Frontend (Terminal 2):**
```bash
cd kalasetu-frontend
npm run dev
```
App will open at http://localhost:5173

---

## Admin Access (Super Admin)

You can create or reset the platform super admin via scripts in the backend.

- Default Super Admin Email: showcase.admin@kalasetu.com
- Default Password (on create): SuperAdmin@123

Create/Recreate Super Admin:
```bash
cd kalasetu-backend
node scripts/createSuperAdmin.js
```

Reset Super Admin Password:
```bash
cd kalasetu-backend
node scripts/resetAdminPassword.js
```

Admin Login URL (local): http://localhost:5173/admin/login

Note: Change the password immediately after first login.

---

## Environment Configuration

### Required Backend Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_BASE_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/kalasetu
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kalasetu

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Required Frontend Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Firebase (Optional)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Optional Backend Variables

See [INTEGRATIONS.md](./INTEGRATIONS.md) for:
- Firebase Admin SDK
- Algolia Search
- Stream Chat
- Daily.co Video
- Razorpay Payments
- OneSignal Push Notifications
- Email services (Resend/Nodemailer)
- Analytics (PostHog, Sentry, LogRocket)
- Background jobs (QStash, Redis)

---

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable:
   - Email/Password
   - Phone (optional)

### 3. Get Web App Credentials
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" → Click **Web** icon
3. Register your app
4. Copy the config object values to frontend `.env`

### 4. Get Service Account Key (Backend)
1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Save the JSON file as `serviceAccountKey.json` in `kalasetu-backend/`
4. **IMPORTANT:** Add to `.gitignore` (already done)

Alternative: Set as environment variable:
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

---

## Database Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Start MongoDB service
# Windows: Services → MongoDB Server
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Use in .env:
MONGODB_URI=mongodb://localhost:27017/kalasetu
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env`

---

## External Services

### Cloudinary (Image Uploads)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Dashboard → Account Details
3. Copy Cloud Name, API Key, API Secret
4. Add to backend `.env`

### Google Maps (Location Features)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Places API
3. Create API credentials
4. Add to frontend `.env`

### Algolia (Search)
1. Sign up at [Algolia](https://www.algolia.com/)
2. Create an application
3. Get Application ID and Admin API Key
4. Add to backend `.env`:
```env
ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_KEY=your-admin-key
ALGOLIA_ARTISAN_INDEX=artisans
```

---

## Development Workflow

### Running Tests
```bash
# Backend
cd kalasetu-backend
npm test  # (if tests exist)

# Frontend
cd kalasetu-frontend
npm test
```

### Linting
```bash
# Frontend
cd kalasetu-frontend
npm run lint
```

### Building for Production
```bash
# Backend (no build needed - Node.js runtime)

# Frontend
cd kalasetu-frontend
npm run build
# Output: dist/ folder
```

---

## Common Issues

### Port Already in Use
```bash
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed
- Check MongoDB service is running
- Verify connection string in `.env`
- Check network/firewall settings
- For Atlas: Whitelist your IP

### CORS Errors
- Ensure `CORS_ORIGINS` includes frontend URL
- Check frontend is using correct `VITE_API_URL`
- Clear browser cache and cookies

### Firebase Errors
- Verify `serviceAccountKey.json` exists in backend
- Check Firebase project settings
- Ensure authentication methods are enabled

### Environment Variables Not Loading
- Restart dev servers after changing `.env`
- Check for typos in variable names
- Ensure `.env` file is in correct directory

---

## Next Steps

- Read [INTEGRATIONS.md](./INTEGRATIONS.md) for external service setup
- Check [API.md](./API.md) for API documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

**Last Updated:** November 4, 2025
 
---

Updated: November 9, 2025
