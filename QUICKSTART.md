# ⚡ KalaSetu Quick Start Guide

Get your development environment running in 5 minutes!

## 🚀 Prerequisites

- Node.js v20+ installed
- Git installed
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

## 📦 Quick Setup

### 1. Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/samyak163/Kalasetu-project.git
cd kalasetu-project

# Install backend dependencies
cd kalasetu-backend
npm install

# Install frontend dependencies
cd ../kalasetu-frontend
npm install
```

### 2. Configure Backend (2 minutes)

```bash
# Navigate to backend
cd kalasetu-backend

# Copy environment template
cp .env.example .env

# Edit .env file with your values
# Minimum required:
# - MONGO_URI (from MongoDB Atlas)
# - JWT_SECRET (generate random 32+ char string)
# - CLOUDINARY credentials (from Cloudinary dashboard)
```

**Quick MongoDB Setup:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free cluster
3. Create database user
4. Add IP address `0.0.0.0/0`
5. Get connection string
6. Paste in `.env` as `MONGO_URI`

**Quick Cloudinary Setup:**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up (free)
3. Copy Cloud Name, API Key, API Secret from dashboard
4. Paste in `.env`

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configure Frontend (1 minute)

```bash
# Navigate to frontend
cd ../kalasetu-frontend

# Copy environment template
cp .env.example .env

# Edit .env file
# Set VITE_API_URL=http://localhost:5000
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd kalasetu-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd kalasetu-frontend
npm run dev
```

### 5. Open Browser

Visit: http://localhost:5173

## ✅ Verify Everything Works

1. **Homepage loads** ✓
2. **Try registering an artisan** at `/register`
3. **Try registering a customer** at `/customer-register`
4. **Try login** at `/login`

## 🎯 Quick Reference

### Backend URLs
- API: http://localhost:5000
- Health: http://localhost:5000/
- Test: http://localhost:5000/api/test
- Artisans: http://localhost:5000/api/artisans

### Frontend URLs
- Home: http://localhost:5173
- Artisan Register: http://localhost:5173/register
- Artisan Login: http://localhost:5173/login
- Customer Register: http://localhost:5173/customer-register
- Customer Login: http://localhost:5173/customer-login

## 🔧 Common Issues

### Backend won't start
```bash
# Check if .env exists
ls .env

# Check MongoDB connection
# Look for "MongoDB Connected" in terminal

# Check port 5000 is free
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Frontend can't connect to backend
```bash
# Check VITE_API_URL in frontend/.env
# Should be: http://localhost:5000

# Check backend is running
curl http://localhost:5000/api/test
```

### Database connection error
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check username/password in connection string
- Ensure database user has read/write permissions

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Review [IMPROVEMENTS.md](./IMPROVEMENTS.md) for recent changes

## 🆘 Need Help?

- Check console for error messages
- Review .env.example for correct format
- Ensure all dependencies installed: `npm install`
- Make sure Node.js v20+ is installed: `node --version`

---

**Happy coding! 🎨**
