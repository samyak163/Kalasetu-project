import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import artisanRoutes from './routes/artisanRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// --- Load Environment Variables ---
// This line loads the variables from your .env file (like PORT and MONGO_URI)
dotenv.config();

// --- Connect to Database ---
// We call the function we will create in config/db.js
connectDB();

const app = express();

// --- Middleware ---
// Security headers
app.use(helmet());

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// JSON body parsing
app.use(express.json());

// Cookie parsing (for HTTP-only JWT later)
app.use(cookieParser());

// Rate limiting for auth and general API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// CORS: allow specific origins and credentials for Vercel <-> Render
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

// --- Simple Test Route ---
// This is a basic "health check" to make sure our server is alive.
app.get('/', (req, res) => {
    res.send('KalaSetu API is running...');
});

// Test CORS endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

app.use('/api/artisans', artisanRoutes); 
app.use('/api/auth', authRoutes);

// Debug: Log all registered routes
console.log('Registered routes:');
console.log('- GET /');
console.log('- GET /api/test');
console.log('- POST /api/artisans/register');
console.log('- POST /api/artisans/login');
console.log('- GET /api/artisans');
console.log('- GET /api/artisans/:publicId');
console.log('- POST /api/auth/register');
console.log('- POST /api/auth/login');
console.log('- POST /api/auth/logout');
console.log('- GET /api/auth/me');


// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);


