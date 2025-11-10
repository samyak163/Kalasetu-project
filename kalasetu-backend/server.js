import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import validateEnv from './utils/validateEnv.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { 
  initSentry, 
  sentryRequestHandler, 
  sentryTracingHandler, 
  sentryErrorHandler 
} from './utils/sentry.js';
import { initPostHog, shutdownPostHog } from './utils/posthog.js';
import { trackApiRequest } from './middleware/analyticsMiddleware.js';
import { initStreamChat } from './utils/streamChat.js';
import { initRedis } from './utils/redis.js';
import { initQStash } from './utils/qstash.js';
import { scheduleCleanupJob, scheduleDailyReports } from './utils/jobQueue.js';
import { SERVER_CONFIG, JOBS_CONFIG } from './config/env.config.js';
import { initRazorpay } from './utils/razorpay.js';
import { initResend } from './utils/email.js';

// --- IMPORT ALL OUR ROUTES ---
// Routes for general artisan data (profiles, search, etc.)
import artisanRoutes from './routes/artisanRoutes.js'; 
// Routes for ARTISAN authentication (login, register, me, logout)
import authRoutes from './routes/authRoutes.js';
// Routes for USER authentication (login, register, me, logout)
import userAuthRoutes from './routes/userAuthRoutes.js'; 
import uploadRoutes from './routes/uploadRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import callRoutes from './routes/callRoutes.js';
import callHistoryRoutes from './routes/callHistoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import artisanProfileRoutes from './routes/artisanProfileRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authHelpersRoutes from './routes/authHelpersRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';


// --- Load Environment Variables ---
dotenv.config();

// --- Validate env & Connect to Database ---
validateEnv();
connectDB();

const app = express();

// Behind Render/Proxies: trust first proxy to get correct client IPs
app.set('trust proxy', 1);

// --- Initialize Sentry (before any routes) ---
initSentry(app);

// --- Initialize PostHog ---
initPostHog();

// --- Initialize Stream Chat ---
initStreamChat();

// --- Initialize Redis Cache (if enabled) ---
initRedis();

// --- Initialize QStash (if enabled) ---
initQStash();

// --- Initialize Razorpay ---
initRazorpay();

// --- Initialize Resend Email Service ---
initResend();

// --- Schedule recurring jobs (only when jobs are enabled) ---
if (JOBS_CONFIG.enabled) {
  scheduleCleanupJob().catch(console.error);
  scheduleDailyReports().catch(console.error);
}

// --- Middleware ---
app.use(helmet()); // Security headers
app.use(hpp()); // HTTP Parameter Pollution protection

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Sentry request handler (must be before other middleware)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// JSON body parsing
app.use(express.json());

// Cookie parsing (for HTTP-only JWTs)
app.use(cookieParser());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Add analytics middleware (after auth middleware will be applied in routes)
app.use('/api', trackApiRequest);

// CORS Configuration
// Support exact origins and simple wildcard entries like *.vercel.app
const corsOriginEntries = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const exactOrigins = new Set();
const wildcardSuffixes = [];
for (const entry of corsOriginEntries) {
  if (entry.startsWith('*.')) {
    wildcardSuffixes.push(entry.slice(1)); // store ".vercel.app"
  } else if (entry) {
    exactOrigins.add(entry);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Allow specific origins from environment
    if (exactOrigins.has(origin)) return callback(null, true);

    // Allow wildcard suffix matches (e.g., *.vercel.app)
    if (wildcardSuffixes.some(suffix => origin.endsWith(suffix))) {
      return callback(null, true);
    }

    // In development, allow localhost origins
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    // Block everything else with a clean JSON error
    return callback(Object.assign(new Error('Not allowed by CORS'), { code: 'CORS_NOT_ALLOWED' }));
  },
  credentials: true,
}));

// --- API Routes ---

// Test/Health-check routes
app.get('/', (req, res) => {
    res.send('KalaSetu API is running...');
});
app.get('/api/test', (req, res) => {
    res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

// Mount all our different routers
// /api/artisans -> Handles public artisan data (profiles, etc.)
app.use('/api/artisans', artisanRoutes); 
// /api/artisan -> Handles authenticated artisan profile management (singular)
app.use('/api/artisan', artisanProfileRoutes);
// /api/auth -> Handles ARTISAN authentication
app.use('/api/auth', authRoutes);
// /api/users -> Handles USER authentication
app.use('/api/users', userAuthRoutes);
// /api/auth-helpers -> reCAPTCHA verification and OTP helpers
app.use('/api/auth-helpers', authHelpersRoutes);
// /api/otp -> OTP sending and verification
app.use('/api/otp', otpRoutes); 
// /api/uploads -> Cloudinary signed upload helpers
app.use('/api/uploads', uploadRoutes);
// /api/search -> Search endpoints
app.use('/api/search', searchRoutes);
// /api/seo -> SEO helpers (meta, sitemap)
app.use('/api/seo', seoRoutes);
// /api/notifications -> Push notification endpoints
app.use('/api/notifications', notificationRoutes);
// /api/chat -> Stream Chat endpoints
app.use('/api/chat', chatRoutes);
// /api/video -> Daily.co video call endpoints
app.use('/api/video', videoRoutes);
// Calls and booking
app.use('/api/calls', callRoutes);
app.use('/api/calls/history', callHistoryRoutes);
app.use('/api/bookings', bookingRoutes);
// /api/jobs -> QStash job webhooks
app.use('/api/jobs', jobRoutes);
// /api/payments -> Razorpay payment endpoints
app.use('/api/payments', paymentRoutes);
// /api/contact -> Contact form
app.use('/api/contact', contactRoutes);
// /api/reviews -> Reviews endpoints
app.use('/api/reviews', reviewRoutes);
// /api/artisan/availability -> Availability endpoints (artisan auth)
app.use('/api/artisan/availability', availabilityRoutes);
// /api/admin -> Admin endpoints
app.use('/api/admin', adminRoutes);
// /api/artisan/portfolio -> Portfolio endpoints (artisan auth)
app.use('/api/artisan/portfolio', portfolioRoutes);

// --- Debug Logging (Updated) ---
// This is now accurate for our new structure
console.log('Registered routes:');
console.log('- GET /');
console.log('- GET /api/test');
console.log('--- Artisan Data ---');
console.log('- GET /api/artisans');
console.log('- GET /api/artisans/id/:id');
console.log('- GET /api/artisans/nearby?lat=..&lng=..&radiusKm=..&limit=..');
console.log('- GET /api/artisans/:publicId');
console.log('--- Artisan Auth ---');
console.log('- POST /api/auth/register');
console.log('- POST /api/auth/login');
console.log('- POST /api/auth/logout');
console.log('- GET /api/auth/me');
console.log('--- USER Auth ---');
console.log('- POST /api/users/register');
console.log('- POST /api/users/login');
console.log('- POST /api/users/logout');
console.log('- GET /api/users/me');
console.log('--- Search ---');
console.log('- GET /api/search/artisans');
console.log('- GET /api/search/facets');
console.log('--- Calls & Bookings ---');
console.log('- GET /api/calls/history');
console.log('- POST /api/bookings');
console.log('- GET /api/bookings/me');
console.log('- GET /api/bookings/artisan');
// ---------------------------------

// --- Error Handlers (Must be last) ---
// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

app.use(notFound);
app.use(errorHandler);

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// --- Graceful Shutdown ---
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await shutdownPostHog();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await shutdownPostHog();
  process.exit(0);
});
