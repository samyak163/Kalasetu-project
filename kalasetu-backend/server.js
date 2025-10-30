import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// --- IMPORT ALL OUR ROUTES ---
// Routes for general artisan data (profiles, search, etc.)
import artisanRoutes from './routes/artisanRoutes.js'; 
// Routes for ARTISAN authentication (login, register, me, logout)
import authRoutes from './routes/authRoutes.js';
// Routes for CUSTOMER authentication (login, register, me, logout)
import userAuthRoutes from './routes/userAuthRoutes.js'; 


// --- Load Environment Variables ---
dotenv.config();

// --- Connect to Database ---
connectDB();

const app = express();

// --- Middleware ---
app.use(helmet()); // Security headers

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

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

// CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman, mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        
        // Allow specific origins from environment
        if (allowedOrigins.includes(origin)) return callback(null, true);
        
        // In development, allow localhost origins
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
            return callback(null, true);
        }
        
        // Block everything else
        return callback(new Error('Not allowed by CORS'));
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
// /api/auth -> Handles ARTISAN authentication
app.use('/api/auth', authRoutes);
// /api/users -> Handles CUSTOMER authentication
app.use('/api/users', userAuthRoutes);

// --- Debug Logging (Updated) ---
// This is now accurate for our new structure
console.log('Registered routes:');
console.log('- GET /');
console.log('- GET /api/test');
console.log('--- Artisan Data ---');
console.log('- GET /api/artisans');
console.log('- GET /api/artisans/:publicId');
console.log('--- Artisan Auth ---');
console.log('- POST /api/auth/register');
console.log('- POST /api/auth/login');
console.log('- POST /api/auth/logout');
console.log('- GET /api/auth/me');
console.log('--- Customer Auth ---');
console.log('- POST /api/users/register');
console.log('- POST /api/users/login');
console.log('- POST /api/users/logout');
console.log('- GET /api/users/me');
// ---------------------------------

// --- Error Handlers (Must be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

