# 🚀 KalaSetu Deployment Guide

This guide walks you through deploying KalaSetu to production using Render (backend) and Vercel (frontend).

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- ✅ GitHub repository with your code
- ✅ MongoDB Atlas account with a cluster
- ✅ Cloudinary account
- ✅ Render.com account
- ✅ Vercel account
- ✅ Firebase project (optional, for OTP)

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier M0 is fine for starting)
3. Go to **Database Access** → Create a database user
   - Username: e.g., `kalasetu-admin`
   - Password: Generate a strong password
   - Role: `Atlas admin` or `Read and write to any database`

### 1.2 Configure Network Access

1. Go to **Network Access** → Add IP Address
2. For development: Add `0.0.0.0/0` (Allow access from anywhere)
3. For production: Add Render's IP addresses or use `0.0.0.0/0`

### 1.3 Get Connection String

1. Click **Connect** → **Connect your application**
2. Copy the connection string
3. Replace `<password>` with your database user password
4. Replace `<dbname>` with `kalasetu` (or your preferred name)
5. Save this for later: `mongodb+srv://username:password@cluster.mongodb.net/kalasetu?retryWrites=true&w=majority`

## ☁️ Step 2: Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to **Dashboard**
3. Copy these values:
   - Cloud Name
   - API Key
   - API Secret
4. Save these for environment variables

## 🔧 Step 3: Backend Deployment (Render)

### 3.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `kalasetu-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `kalasetu-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid for better performance)

### 3.2 Add Environment Variables

Click **Advanced** → **Add Environment Variable** and add:

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kalasetu?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_random_string
COOKIE_NAME=ks_auth
CORS_ORIGINS=https://your-frontend-app.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_BASE_URL=https://your-frontend-app.vercel.app
```

**Important Notes:**
- Replace all `your_*` values with actual credentials
- Generate a random JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- CORS_ORIGINS: You'll update this after deploying frontend
- FIREBASE_SERVICE_ACCOUNT: Add later if using Firebase

### 3.3 Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://kalasetu-backend-xxxx.onrender.com`
4. Test it: Visit `https://kalasetu-backend-xxxx.onrender.com/` - should see "KalaSetu API is running..."

### 3.4 Important: Free Tier Limitations

Render free tier:
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- ⚠️ Consider upgrading to paid tier for production

## 🎨 Step 4: Frontend Deployment (Vercel)

### 4.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `kalasetu-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4.2 Add Environment Variables

Before deploying, add environment variables:

1. Go to **Settings** → **Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:

```bash
VITE_API_URL=https://kalasetu-backend-xxxx.onrender.com
```

If using Firebase:
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important:**
- Use your actual Render backend URL in `VITE_API_URL`
- No trailing slash in URL
- All variables must start with `VITE_`

### 4.3 Deploy

1. Click **Deploy**
2. Wait for build (2-5 minutes)
3. Copy your frontend URL: `https://kalasetu-xxxx.vercel.app`

### 4.4 Update Backend CORS

1. Go back to Render dashboard
2. Go to your backend service → **Environment**
3. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   CORS_ORIGINS=https://kalasetu-xxxx.vercel.app
   ```
4. Save changes (backend will auto-redeploy)

## 🧪 Step 5: Testing Deployment

### 5.1 Backend Tests

```bash
# Health check
curl https://kalasetu-backend-xxxx.onrender.com/

# Test API endpoint
curl https://kalasetu-backend-xxxx.onrender.com/api/test

# Test artisans endpoint
curl https://kalasetu-backend-xxxx.onrender.com/api/artisans
```

### 5.2 Frontend Tests

1. Open your Vercel URL in browser
2. Test these features:
   - ✅ Homepage loads
   - ✅ Artisan registration works
   - ✅ Login works
   - ✅ Profile pages load
   - ✅ Image upload works

### 5.3 Common Issues

**CORS Errors:**
- Ensure `CORS_ORIGINS` in backend includes your Vercel URL
- No trailing slash in URLs
- Include protocol (https://)

**Backend Not Responding:**
- Render free tier spins down - first request is slow
- Check Render logs for errors
- Verify MongoDB connection string

**Environment Variables Not Working:**
- In Vercel, redeploy after adding env vars
- In Render, service auto-redeploys on env change
- Frontend vars must start with `VITE_`

**Database Connection Failed:**
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string is correct
- Check database user permissions

## 🔐 Step 6: Security Best Practices

### 6.1 Environment Variables

- ✅ Never commit `.env` files to git
- ✅ Use strong, random JWT_SECRET (32+ characters)
- ✅ Rotate secrets regularly
- ✅ Keep MongoDB credentials secure

### 6.2 MongoDB Security

- ✅ Use strong database passwords
- ✅ Limit IP access if possible
- ✅ Enable database encryption
- ✅ Regular backups

### 6.3 API Security

- ✅ Rate limiting is enabled (300 req/15min)
- ✅ Helmet.js security headers active
- ✅ CORS properly configured
- ✅ HTTP-only cookies for auth

## 📊 Step 7: Monitoring & Maintenance

### 7.1 Render Monitoring

- Check **Logs** tab for errors
- Monitor **Metrics** for performance
- Set up email alerts for downtime

### 7.2 Vercel Monitoring

- Check **Analytics** for traffic
- Review **Logs** for build/runtime errors
- Monitor **Speed Insights**

### 7.3 Database Monitoring

- Monitor MongoDB Atlas **Metrics**
- Set up performance alerts
- Review slow queries
- Plan for scaling

## 🚀 Step 8: Custom Domain (Optional)

### 8.1 Frontend Domain (Vercel)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

### 8.2 Backend Domain (Render)

1. Go to **Settings** → **Custom Domain**
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records
4. Update frontend `VITE_API_URL`

### 8.3 Update CORS

After adding custom domains:
1. Update backend `CORS_ORIGINS` with new frontend domain
2. Update frontend `VITE_API_URL` with new backend domain
3. Redeploy both services

## 📚 Step 9: CI/CD Setup

### Auto-Deploy on Git Push

✅ **Vercel:** Already configured - deploys on every push to `main`

✅ **Render:** Already configured - deploys on every push to `main`

### Deploy Specific Branch

**Vercel:**
1. Go to **Settings** → **Git**
2. Change production branch if needed

**Render:**
1. Go to **Settings** → **Build & Deploy**
2. Change branch under **Auto-Deploy**

## 🔄 Step 10: Update & Rollback

### Update Deployment

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main

# Both Render and Vercel will auto-deploy
```

### Rollback (Vercel)

1. Go to **Deployments**
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

### Rollback (Render)

1. Go to **Events**
2. Find previous deployment
3. Click **⋯** → **Redeploy**

## 🎯 Post-Deployment Checklist

- ✅ Backend health check passes
- ✅ Frontend loads without errors
- ✅ Registration/Login works
- ✅ Database connections stable
- ✅ Image uploads work (Cloudinary)
- ✅ CORS configured correctly
- ✅ Environment variables set
- ✅ SSL certificates active (https://)
- ✅ Error monitoring set up
- ✅ Backups configured (MongoDB)

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

### "CORS error" in browser
- Add frontend URL to backend CORS_ORIGINS
- No trailing slashes in URLs
- Include https:// protocol

### "Environment variable not defined"
- Redeploy after adding env vars
- Check variable names (VITE_ prefix for frontend)
- Verify no typos in variable names

### Slow backend response
- Normal on Render free tier after inactivity
- Consider upgrading to paid tier
- First request after spin-down takes 30-60s

## 📞 Support

- **Documentation:** [README.md](./README.md)
- **Issues:** [GitHub Issues](https://github.com/samyak163/Kalasetu-project/issues)
- **MongoDB:** [MongoDB Atlas Support](https://support.mongodb.com/)
- **Render:** [Render Support](https://render.com/docs)
- **Vercel:** [Vercel Support](https://vercel.com/support)

---

**Congratulations! Your KalaSetu application is now live! 🎉**
