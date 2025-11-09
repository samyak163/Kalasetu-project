# 🚀 CI/CD Setup Guide

Complete guide for setting up Continuous Integration and Continuous Deployment for KalaSetu.

## Table of Contents
- [GitHub Actions Setup](#github-actions-setup)
- [Environment Secrets](#environment-secrets)
- [Deployment Strategies](#deployment-strategies)
- [Firebase Hosting](#firebase-hosting)
- [Backend Deployment](#backend-deployment)

---

## GitHub Actions Setup

### Basic CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-lint:
    name: Backend Lint & Test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: kalasetu-backend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./kalasetu-backend
        run: npm ci
      
      - name: Run tests
        working-directory: ./kalasetu-backend
        run: npm test
        if: always()
  
  frontend-lint-build:
    name: Frontend Lint & Build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: kalasetu-frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./kalasetu-frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./kalasetu-frontend
        run: npm run lint
      
      - name: Build
        working-directory: ./kalasetu-frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
```

---

## Environment Secrets

### GitHub Repository Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

#### Frontend Secrets
```
VITE_API_URL
VITE_GOOGLE_MAPS_API_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_POSTHOG_API_KEY
VITE_SENTRY_DSN
VITE_LOGROCKET_APP_ID
VITE_ONESIGNAL_APP_ID
```

#### Backend Secrets
```
MONGODB_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FIREBASE_SERVICE_ACCOUNT (JSON string)
ALGOLIA_APP_ID
ALGOLIA_ADMIN_KEY
STREAM_API_KEY
STREAM_API_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RESEND_API_KEY
```

---

## Deployment Strategies

### Option 1: Firebase Hosting (Frontend Only)

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize in your project
cd kalasetu-frontend
firebase init hosting
```

#### Configuration

Create `kalasetu-frontend/firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### Deploy Workflow

Create `.github/workflows/deploy-frontend.yml`:
```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths:
      - 'kalasetu-frontend/**'

jobs:
  deploy:
    name: Deploy to Firebase
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./kalasetu-frontend
        run: npm ci
      
      - name: Build
        working-directory: ./kalasetu-frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
          entryPoint: './kalasetu-frontend'
```

#### Manual Deploy
```bash
cd kalasetu-frontend
npm run build
firebase deploy --only hosting
```

---

### Option 2: Vercel (Frontend)

#### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
cd kalasetu-frontend
vercel
```

#### Configuration

Create `kalasetu-frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### GitHub Integration
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `kalasetu-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables from secrets

---

### Option 3: Render (Backend)

#### Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. **New → Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name:** kalasetu-backend
   - **Region:** Choose closest to users
   - **Branch:** main
   - **Root Directory:** `kalasetu-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter for production)

5. Add environment variables:
   - Go to **Environment** tab
   - Add all backend secrets
   - Set `NODE_ENV=production`

#### Auto-Deploy
- Render auto-deploys on push to main branch
- Can disable and use manual deploys if needed

---

### Option 4: Railway (Backend)

#### Setup
1. Go to [Railway](https://railway.app/)
2. **New Project → Deploy from GitHub**
3. Select repository
4. Configure:
   - **Root Directory:** `kalasetu-backend`
   - **Start Command:** `npm start`
5. Add environment variables in dashboard
6. Railway auto-deploys on push

---

### Option 5: Heroku (Backend)

#### Setup
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd kalasetu-backend
heroku create kalasetu-api

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Set root directory
heroku config:set PROJECT_PATH=kalasetu-backend
```

#### Procfile

Create `Procfile` in root:
```
web: cd kalasetu-backend && npm start
```

#### Deploy
```bash
git push heroku main
```

---

## Backend Deployment

### Environment Setup

#### Production .env Template
```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_BASE_URL=https://your-frontend.com
CORS_ORIGINS=https://your-frontend.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kalasetu?retryWrites=true&w=majority

# JWT
JWT_SECRET=<64-character-random-string>
JWT_EXPIRE=7d

# All other service keys...
```

#### Generate Secure JWT Secret
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -base64 64
```

---

## Database Migration

### MongoDB Atlas Production Setup
1. Create production cluster (M10+ recommended)
2. Set up database backups
3. Configure IP whitelist
4. Create database user with appropriate permissions
5. Enable connection encryption

### Migration Strategy
```bash
# Backup local data
mongodump --uri="mongodb://localhost:27017/kalasetu" --out=./backup

# Restore to Atlas
mongorestore --uri="mongodb+srv://..." ./backup/kalasetu
```

---

## Monitoring & Logging

### Production Checklist
- [ ] Enable Sentry error tracking
- [ ] Configure PostHog analytics
- [ ] Set up LogRocket session replay
- [ ] Configure log aggregation (e.g., Datadog, Logtail)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure alerting for critical errors

---

## Security Checklist

### Pre-Deployment
- [ ] All API keys in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] Rate limiting enabled
- [ ] Helmet.js configured
- [ ] CORS properly configured
- [ ] Input validation with Zod
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention (React escapes by default)
- [ ] HTTPS enforced in production
- [ ] Secure cookies (httpOnly, secure, sameSite)

### Post-Deployment
- [ ] Security headers verified (use securityheaders.com)
- [ ] SSL certificate valid
- [ ] No sensitive data in logs
- [ ] API rate limits working
- [ ] Error messages don't leak stack traces in production

---

## Rollback Strategy

### Frontend (Firebase)
```bash
# List deployments
firebase hosting:sites:list

# Rollback to previous version
firebase hosting:rollback
```

### Backend (Railway/Render)
- Use dashboard to rollback to previous deployment
- Or redeploy from specific git commit

---

## Performance Optimization

### Frontend
- Build with production mode (Vite does this automatically)
- Enable code splitting
- Optimize images (use WebP)
- Lazy load routes (already implemented)
- CDN for static assets (Firebase Hosting includes CDN)

### Backend
- Enable Redis caching
- Use MongoDB indexes (already configured)
- Implement response compression
- Use connection pooling (Mongoose does this)

---

## Example Complete CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      # Backend tests
      - name: Backend Tests
        working-directory: ./kalasetu-backend
        run: |
          npm ci
          npm test
      
      # Frontend tests
      - name: Frontend Lint & Build
        working-directory: ./kalasetu-frontend
        run: |
          npm ci
          npm run lint
          npm run build

  deploy-frontend:
    name: Deploy Frontend
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build Frontend
        working-directory: ./kalasetu-frontend
        run: |
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          # Add all other VITE_ secrets...
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
          entryPoint: './kalasetu-frontend'

  deploy-backend:
    name: Deploy Backend
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Railway Deploy
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

---

## Local Testing of Production Build

### Frontend
```bash
cd kalasetu-frontend
npm run build
npm run preview
# Opens at http://localhost:4173
```

### Backend
```bash
cd kalasetu-backend
NODE_ENV=production npm start
```

---

## Troubleshooting

### Build Failures
- Check all environment variables are set
- Verify Node.js version matches (20+)
- Check package-lock.json is committed
- Review build logs for specific errors

### Deployment Failures
- Verify service account permissions
- Check quota limits (Firebase free tier limits)
- Ensure all secrets are correctly named
- Review deployment logs

### Runtime Issues
- Check environment variables in hosting platform
- Verify database connection string
- Review application logs
- Test API endpoints with Postman

---

**Last Updated:** November 9, 2025
