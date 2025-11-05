# ðŸŽ¨ KalaSetu - Artisan Marketplace Platform

KalaSetu is a full-stack web application connecting traditional artisans with USERs. Built with React, Node.js, Express, and MongoDB.

[![CI](https://github.com/samyak163/Kalasetu-project/actions/workflows/ci.yml/badge.svg)](https://github.com/samyak163/Kalasetu-project/actions/workflows/ci.yml)

## ðŸ“‹ Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## âœ¨ Features

### For Artisans
- ðŸ” Secure authentication (Email, Phone, Firebase OTP)
- ðŸ‘¤ Professional profile management
- ðŸ“¸ Portfolio image uploads (Cloudinary)
- ðŸŽ¯ Custom public profile URLs
- ðŸ”’ Account security with login attempt tracking

### For USERs
- ðŸ” Browse and search artisans
- ðŸ“§ Email-based authentication
- ðŸ’¬ View artisan profiles and portfolios
- â­ Future: Reviews and ratings

### Security & Performance
- ðŸ›¡ï¸ Helmet.js security headers
- ðŸš¦ Rate limiting
- ðŸª HTTP-only cookie authentication
- ðŸ”‘ JWT token management
- âœ… Input validation with Zod
- ðŸ“Š Environment variable validation

## ðŸ› ï¸ Tech Stack

### Frontend
- **Framework:** React 19
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Authentication:** Firebase Auth (optional)
- **Maps:** Google Maps API
- **Search:** Algolia InstantSearch

### Backend
- **Runtime:** Node.js (v18-22)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + HTTP-only cookies
- **Validation:** Zod
- **File Upload:** Cloudinary
- **Real-time Chat:** Stream Chat
- **Video Calls:** Daily.co
- **Push Notifications:** OneSignal
- **Email:** Resend / Nodemailer
- **Analytics:** PostHog, Sentry, LogRocket
- **Payments:** Razorpay
- **Background Jobs:** QStash
- **Caching:** Redis (optional)

---

## ðŸš€ Quick Start

### Prerequisites
- Node.js v18+ (v20+ recommended)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/samyak163/Kalasetu-project.git
   cd Kalasetu-project
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd kalasetu-backend
   npm install
   
   # Frontend
   cd ../kalasetu-frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cd kalasetu-backend
   copy .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../kalasetu-frontend
   copy .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd kalasetu-backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd kalasetu-frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

---

## ðŸ“š Documentation

Comprehensive guides are available in the `docs/` directory:

- **[Setup Guide](docs/SETUP.md)** - Complete installation and configuration
- **[Integrations Guide](docs/INTEGRATIONS.md)** - External services setup (Firebase, Cloudinary, etc.)
- **[API Documentation](docs/API.md)** - REST API endpoints reference
- **[CI/CD Guide](docs/CI-CD.md)** - Deployment and automation setup

---

## ðŸ“ Project Structure

```
kalasetu-project/
â”œâ”€â”€ kalasetu-backend/          # Express.js backend
â”‚   â”œâ”€â”€ config/                # Configuration files
â”‚   â”œâ”€â”€ controllers/           # Route controllers
â”‚   â”œâ”€â”€ middleware/            # Express middleware
â”‚   â”œâ”€â”€ models/                # Mongoose models
â”‚   â”œâ”€â”€ routes/                # API routes
â”‚   â”œâ”€â”€ utils/                 # Utility functions
â”‚   â”œâ”€â”€ jobs/                  # Background job handlers
â”‚   â”œâ”€â”€ scripts/               # CLI scripts
â”‚   â””â”€â”€ server.js              # Entry point
â”‚
â”œâ”€â”€ kalasetu-frontend/         # React frontend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/        # Reusable components
â”‚   â”‚   â”œâ”€â”€ pages/             # Page components
â”‚   â”‚   â”œâ”€â”€ context/           # React Context providers
â”‚   â”‚   â”œâ”€â”€ hooks/             # Custom hooks
â”‚   â”‚   â”œâ”€â”€ lib/               # Third-party integrations
â”‚   â”‚   â””â”€â”€ App.jsx            # Root component
â”‚   â””â”€â”€ vite.config.js         # Vite configuration
â”‚
â”œâ”€â”€ docs/                      # Documentation
â”‚   â”œâ”€â”€ SETUP.md
â”‚   â”œâ”€â”€ INTEGRATIONS.md
â”‚   â”œâ”€â”€ API.md
â”‚   â””â”€â”€ CI-CD.md
â”‚
â””â”€â”€ .github/
    â””â”€â”€ workflows/             # GitHub Actions CI/CD
```

---
- **Database:** MongoDB (Atlas)
- **ODM:** Mongoose
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **File Upload:** Cloudinary
- **Security:** Helmet, CORS, Rate Limiting

## ðŸ“ Project Structure

```
kalasetu-project/
â”œâ”€â”€ kalasetu-backend/       # Node.js/Express API
â”‚   â”œâ”€â”€ config/            # Configuration files (DB, Cloudinary, Firebase)
â”‚   â”œâ”€â”€ controllers/       # Route handlers
â”‚   â”œâ”€â”€ middleware/        # Auth, error handling
â”‚   â”œâ”€â”€ models/           # Mongoose schemas
â”‚   â”œâ”€â”€ routes/           # API routes
â”‚   â”œâ”€â”€ utils/            # Helper functions
â”‚   â””â”€â”€ server.js         # Entry point
â”‚
â”œâ”€â”€ kalasetu-frontend/     # React application
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/   # Reusable components
â”‚   â”‚   â”œâ”€â”€ context/      # React Context (Auth)
â”‚   â”‚   â”œâ”€â”€ lib/          # Axios, Firebase config
â”‚   â”‚   â”œâ”€â”€ pages/        # Route pages
â”‚   â”‚   â””â”€â”€ App.jsx       # Main app component
â”‚   â””â”€â”€ index.html
â”‚
â””â”€â”€ README.md             # This file
```

## ðŸš€ Getting Started

### Prerequisites

- Node.js v20 or higher
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)
- Firebase project (optional, for phone auth)

### 1. Clone the Repository

```bash
git clone https://github.com/samyak163/Kalasetu-project.git
cd kalasetu-project
```

### 2. Backend Setup

```bash
cd kalasetu-backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your actual values
# See Environment Variables section below

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd kalasetu-frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your actual values
# See Environment Variables section below

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## ðŸŒ Deployment

### Backend Deployment (Render.com)

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select `kalasetu-backend` as root directory
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`
   - Set `CORS_ORIGINS` to your frontend URL

3. **MongoDB Atlas Configuration**
   - Whitelist Render's IP addresses (or use 0.0.0.0/0)
   - Create database user with read/write permissions
   - Copy connection string to `MONGO_URI`

4. **Deploy**
   - Render will auto-deploy on git push
   - Copy the deployed URL (e.g., `https://kalasetu-api-xxx.onrender.com`)

### Frontend Deployment (Vercel)

1. **Import Project to Vercel**
   - Connect your GitHub repository
   - Framework Preset: Vite
   - Root Directory: `kalasetu-frontend`

2. **Add Environment Variables**
   - Go to Settings > Environment Variables
   - Add all `VITE_*` variables from `.env.example`
   - Set `VITE_API_URL` to your Render backend URL

3. **Deploy**
   - Vercel will auto-deploy on git push
   - Custom domain can be added in Settings

### Post-Deployment Checklist

- âœ… Backend health check: `https://your-backend.onrender.com/`
- âœ… Frontend loads correctly
- âœ… CORS is configured (add frontend URL to backend `CORS_ORIGINS`)
- âœ… Database connection works
- âœ… Image uploads work (Cloudinary)
- âœ… Authentication flows work
- âœ… Cookie credentials work cross-origin

## ðŸ” Environment Variables

### Backend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` or `production` |
| `PORT` | Server port | Yes | `5000` |
| `MONGO_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | Yes | Random 32+ char string |
| `COOKIE_NAME` | Auth cookie name | Yes | `ks_auth` |
| `CORS_ORIGINS` | Allowed frontend URLs | Yes | `https://yourapp.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | From Cloudinary dashboard |
| `FRONTEND_BASE_URL` | Frontend URL | No | `https://yourapp.vercel.app` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON | No | One-line JSON string |

### Frontend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `https://kalasetu-api.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | No | From Firebase console |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | No | `yourapp.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | No | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | No | `yourapp.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging ID | No | From Firebase console |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | No | From Firebase console |

## ðŸ“š API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-backend.onrender.com/api`

### Artisan Authentication

#### Register Artisan
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "securePassword123"
}
```

#### Login Artisan
```http
POST /auth/login
Content-Type: application/json

{
  "loginIdentifier": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Artisan Profile
```http
GET /auth/me
Cookie: ks_auth=<jwt_token>
```

#### Logout
```http
POST /auth/logout
Cookie: ks_auth=<jwt_token>
```

### USER Authentication

#### Register USER
```http
POST /users/register
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

#### Login USER
```http
POST /users/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

### Artisan Data

#### Get All Artisans
```http
GET /artisans
```

#### Get Artisan by Public ID
```http
GET /artisans/:publicId
```

### Image Upload

#### Get Upload Signature
```http
GET /uploads/signature?folder=artisan/profiles
```

## ðŸ¤ Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ðŸ“ License

This project is private and proprietary.

## ðŸ‘¥ Authors

- **Samyak** - [samyak163](https://github.com/samyak163)

## ðŸ™ Acknowledgments

- React team for the amazing framework
- Express.js community
- MongoDB team
- All open-source contributors

---

**Need Help?** Open an issue on GitHub or contact the maintainers.
