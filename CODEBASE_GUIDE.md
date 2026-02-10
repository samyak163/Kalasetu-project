# CODEBASE_GUIDE.md - Understanding KalaSetu

A complete guide to understanding what each part of the KalaSetu codebase does and how everything connects together.

---

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Backend Explained](#backend-explained)
3. [Frontend Explained](#frontend-explained)
4. [Data Flow](#data-flow)
5. [Third-Party Services](#third-party-services)
6. [Common Patterns](#common-patterns)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                    (React Frontend on Vercel)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Render)                       │
│                   Express.js on Node.js                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │   Routes    │ Controllers │ Middleware  │   Utils     │     │
│  │ (endpoints) │  (logic)    │ (auth,etc)  │ (helpers)   │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   MongoDB     │   │  Cloudinary   │   │ Third-Party   │
│   (Database)  │   │   (Images)    │   │   Services    │
└───────────────┘   └───────────────┘   └───────────────┘
```

### The Two User Types

**ARTISAN** = Service provider (painter, craftsman, musician, etc.)
- Registers at `/api/auth/register`
- Has profile with portfolio, services, availability
- Can accept/reject bookings
- Gets paid for services

**USER** = Customer who books artisans
- Registers at `/api/users/register`
- Browses and searches artisans
- Books services and pays
- Leaves reviews

---

## Backend Explained

### Directory Structure

```
kalasetu-backend/
├── config/          # Configuration files
├── controllers/     # Business logic
├── middleware/      # Request processing
├── models/          # Database schemas
├── routes/          # API endpoints
├── utils/           # Helper functions
├── jobs/            # Background tasks
├── scripts/         # Maintenance scripts
└── server.js        # Main entry point
```

### server.js - The Heart of Backend

**What it does:** Sets up the Express app and connects everything together.

```javascript
// 1. Load environment variables
dotenv.config();

// 2. Validate environment and connect database
validateEnv();
connectDB();

// 3. Initialize third-party services
initSentry(app);      // Error tracking
initPostHog();        // Analytics
initStreamChat();     // Real-time chat
initRedis();          // Caching
initRazorpay();       // Payments

// 4. Set up middleware (in order!)
app.use(helmet());           // Security headers
app.use(cors({...}));        // Cross-origin requests
app.use(express.json());     // Parse JSON bodies
app.use(cookieParser());     // Parse cookies
app.use(rateLimit({...}));   // Prevent abuse

// 5. Mount all routes
app.use('/api/artisans', artisanRoutes);
app.use('/api/auth', authRoutes);
// ... more routes

// 6. Error handlers (must be last!)
app.use(notFound);
app.use(errorHandler);

// 7. Start server
app.listen(PORT);
```

---

### config/ - Configuration Files

| File | Purpose |
|------|---------|
| `db.js` | Connects to MongoDB using Mongoose |
| `cloudinary.js` | Configures Cloudinary for image uploads |
| `firebaseAdmin.js` | Sets up Firebase Admin SDK for phone auth |
| `env.config.js` | Centralizes all environment variables with defaults |

**env.config.js explained:**
```javascript
// This file exports all config in one place
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '7d',
  cookieName: process.env.COOKIE_NAME || 'ks_auth',
  // ...
};

// So instead of process.env.JWT_SECRET everywhere,
// you use AUTH_CONFIG.jwtSecret
```

---

### models/ - Database Schemas

Each model defines the structure of data in MongoDB.

#### artisanModel.js - Artisan Profile
```javascript
{
  // Basic Info
  fullName: String,
  email: String (unique),
  phoneNumber: String,
  password: String (hashed),

  // Profile
  bio: String,
  profilePhoto: String (Cloudinary URL),
  publicId: String (for public profile URL like /artisan/pottery-master-123),

  // Business
  category: ObjectId → Category,
  skills: [String],
  experience: String,
  serviceAreas: [String],

  // Portfolio
  portfolioImages: [String] (Cloudinary URLs),

  // Location
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },

  // Verification
  verified: Boolean,
  emailVerificationToken: String,

  // Banking (for payouts)
  bankDetails: {...},

  // Stats
  rating: Number,
  totalReviews: Number,
  completedBookings: Number
}
```

#### userModel.js - Customer Profile
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,

  // Verification
  verified: Boolean,
  emailVerificationToken: String,

  // Security
  loginAttempts: Number,
  lockUntil: Date
}
```

#### bookingModel.js - Service Bookings
```javascript
{
  user: ObjectId → User,           // Who booked
  artisan: ObjectId → Artisan,     // Who provides service
  service: ObjectId → ArtisanService,

  // Booking details
  scheduledDate: Date,
  scheduledTime: String,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',

  // Pricing
  price: Number,
  currency: String,

  // Communication
  chatChannelId: String,    // Stream Chat channel
  videoRoomName: String,    // Daily.co room

  // Notes
  notes: String,
  artisanNotes: String
}
```

#### Other Models
| Model | Purpose |
|-------|---------|
| `categoryModel.js` | Service categories (Art, Music, Craft) |
| `artisanServiceModel.js` | Services offered by artisan |
| `paymentModel.js` | Payment transactions |
| `reviewModel.js` | Customer reviews |
| `availabilityModel.js` | Artisan working hours |
| `callHistoryModel.js` | Video call records |
| `notificationModel.js` | Push notification records |
| `otpModel.js` | One-time passwords for verification |
| `adminModel.js` | Admin users |

---

### controllers/ - Business Logic

Controllers contain the actual logic for handling requests.

#### authController.js - Artisan Authentication
```javascript
// REGISTER - Create new artisan account
export const register = asyncHandler(async (req, res) => {
  // 1. Validate input with Zod
  const { fullName, email, password, phoneNumber } = registerSchema.parse(req.body);

  // 2. Check if email already exists
  const existingArtisan = await Artisan.findOne({ email });
  if (existingArtisan) throw new Error('Email already registered');

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 4. Create artisan
  const artisan = await Artisan.create({
    fullName, email, password: hashedPassword, phoneNumber
  });

  // 5. Generate JWT token and set cookie
  const token = generateToken(artisan._id);
  res.cookie('ks_auth', token, { httpOnly: true, ... });

  // 6. Send welcome email (async)
  sendWelcomeEmail(artisan);

  // 7. Index in Algolia for search
  indexArtisan(artisan);

  // 8. Return success
  res.status(201).json(artisan);
});

// LOGIN - Authenticate existing artisan
export const login = asyncHandler(async (req, res) => {
  // 1. Find artisan by email OR phone
  // 2. Verify password
  // 3. Check account lockout
  // 4. Generate token and set cookie
  // 5. Return user data
});

// ME - Get current logged-in artisan
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  res.json(req.user);
});
```

#### bookingController.js - Booking Management
```javascript
// CREATE BOOKING
export const createBooking = asyncHandler(async (req, res) => {
  // 1. Get user from auth middleware
  const userId = req.user._id;

  // 2. Validate input
  const { artisanId, serviceId, scheduledDate, ... } = req.body;

  // 3. Verify artisan and service exist
  const artisan = await Artisan.findById(artisanId);
  const service = await ArtisanService.findById(serviceId);

  // 4. Create booking
  const booking = await Booking.create({
    user: userId,
    artisan: artisanId,
    service: serviceId,
    status: 'pending',
    ...
  });

  // 5. Set up chat channel for communication
  await setupChatChannel(booking);

  // 6. Send notification to artisan
  await sendBookingNotification(artisan, booking);

  res.status(201).json(booking);
});
```

#### paymentController.js - Payment Handling
```javascript
// CREATE PAYMENT ORDER
export const createOrder = asyncHandler(async (req, res) => {
  // 1. Validate input
  const { amount, bookingId, purpose } = req.body;

  // 2. Create Razorpay order
  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay uses paise
    currency: 'INR',
  });

  // 3. Save payment record
  const payment = await Payment.create({
    razorpayOrderId: order.id,
    amount,
    booking: bookingId,
    status: 'created'
  });

  res.json({ orderId: order.id, ... });
});

// VERIFY PAYMENT
export const verifyPayment = asyncHandler(async (req, res) => {
  // 1. Verify Razorpay signature
  // 2. Update payment status to 'paid'
  // 3. Update booking status to 'confirmed'
  // 4. Notify artisan
});

// WEBHOOK - Razorpay calls this when payment status changes
export const handleWebhook = asyncHandler(async (req, res) => {
  // 1. Verify webhook signature
  // 2. Process event (payment.captured, refund.created, etc.)
  // 3. Update database accordingly
});
```

---

### middleware/ - Request Processing

Middleware functions run BEFORE the controller logic.

#### authMiddleware.js
```javascript
// PROTECT - Requires artisan authentication
export const protect = async (req, res, next) => {
  // 1. Get token from cookie
  const token = req.cookies.ks_auth;
  if (!token) throw new Error('Not authenticated');

  // 2. Verify token
  const decoded = jwt.verify(token, JWT_SECRET);

  // 3. Find artisan and attach to request
  const artisan = await Artisan.findById(decoded.id);
  req.user = artisan;

  // 4. Continue to next middleware/controller
  next();
};

// PROTECT_ADMIN - Requires admin authentication
export const protectAdmin = async (req, res, next) => {
  // Same but checks admin_token cookie and Admin model
};

// PROTECT_ANY - Accepts either artisan OR user
export const protectAny = async (req, res, next) => {
  // Checks both Artisan and User models
  // Sets req.accountType = 'artisan' or 'user'
};
```

#### userProtectMiddleware.js
```javascript
// Like protect but for User model instead of Artisan
```

#### errorMiddleware.js
```javascript
// NOT FOUND - When no route matches
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

// ERROR HANDLER - Catches all errors
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
```

---

### routes/ - API Endpoints

Routes define which URL calls which controller function.

```javascript
// authRoutes.js
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);  // protect runs BEFORE getMe

export default router;
```

**Route Summary:**

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/api/auth/*` | Artisan authentication | Mixed |
| `/api/users/*` | User authentication | Mixed |
| `/api/artisans` | Public artisan data | No |
| `/api/artisan/*` | Artisan profile management | Artisan |
| `/api/bookings` | Booking CRUD | Yes |
| `/api/payments/*` | Payment processing | Yes |
| `/api/reviews` | Reviews CRUD | Yes |
| `/api/chat/*` | Stream Chat tokens | Yes |
| `/api/video/*` | Daily.co rooms | Yes |
| `/api/search/*` | Algolia search | No |
| `/api/admin/*` | Admin panel | Admin |

---

### utils/ - Helper Functions

| File | Purpose |
|------|---------|
| `generateToken.js` | Creates JWT tokens |
| `asyncHandler.js` | Wraps async functions to catch errors |
| `validateEnv.js` | Checks required environment variables |
| `email.js` | Sends emails via Resend |
| `algolia.js` | Manages Algolia search index |
| `streamChat.js` | Stream Chat client |
| `dailyco.js` | Daily.co video room management |
| `razorpay.js` | Razorpay client |
| `redis.js` | Redis caching |
| `otp.js` | OTP generation/verification |
| `sentry.js` | Error tracking |
| `posthog.js` | Analytics |

**asyncHandler explained:**
```javascript
// Without asyncHandler:
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);  // Must manually catch errors
  }
});

// With asyncHandler:
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
  // Errors automatically caught and passed to error handler
}));
```

---

## Frontend Explained

### Directory Structure

```
kalasetu-frontend/
├── src/
│   ├── components/      # Reusable UI pieces
│   ├── pages/           # Full page components
│   ├── context/         # React Context (global state)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Third-party integrations
│   ├── config/          # Configuration
│   ├── utils/           # Helper functions
│   ├── assets/          # Images, icons
│   ├── i18n/            # Translations
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── public/              # Static files
├── index.html           # HTML template
└── vite.config.js       # Build configuration
```

---

### context/ - Global State Management

React Context provides data to components without "prop drilling."

#### AuthContext.jsx - User Authentication State
```jsx
// What it provides:
{
  auth: { user: {...}, userType: 'artisan' | 'user' | null },
  user: {...},           // Shortcut to auth.user
  userType: 'artisan',   // Shortcut to auth.userType
  isAuthenticated: true, // Boolean shortcut
  loading: false,        // Still checking auth?

  // Functions
  artisanLogin: (credentials) => {...},
  artisanRegister: (data) => {...},
  userLogin: (credentials) => {...},
  userRegister: (data) => {...},
  logout: () => {...},
  checkAuth: () => {...},
}

// How it works on app load:
const bootstrapAuth = async () => {
  try {
    // First try to get USER
    const userRes = await api.get('/api/users/me');
    setAuth({ user: userRes.data, userType: 'user' });
  } catch {
    try {
      // Then try ARTISAN
      const artisanRes = await api.get('/api/auth/me');
      setAuth({ user: artisanRes.data, userType: 'artisan' });
    } catch {
      // Not logged in
      setAuth({ user: null, userType: null });
    }
  }
};

// Usage in any component:
function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <LoginPrompt />;
  return <div>Hello {user.fullName}! <button onClick={logout}>Logout</button></div>;
}
```

#### Other Contexts

| Context | Purpose |
|---------|---------|
| `ChatContext.jsx` | Stream Chat client and channel state |
| `NotificationContext.jsx` | Push notifications and unread count |
| `ToastContext.jsx` | Toast notification display |
| `ThemeContext.jsx` | Dark/light mode |
| `AdminAuthContext.jsx` | Admin authentication |

---

### lib/ - Third-Party Integration

#### axios.js - HTTP Client
```javascript
// Creates pre-configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // Send cookies!
});

// Interceptors handle common logic
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;

// Usage:
import api from '../lib/axios';
const response = await api.get('/api/artisans');
const artisan = await api.post('/api/auth/login', { email, password });
```

#### Other lib files

| File | Purpose |
|------|---------|
| `firebase.js` | Firebase Auth for phone OTP |
| `algolia.js` | Algolia search client |
| `streamChat.js` | Stream Chat client |
| `dailyco.js` | Daily.co video client |
| `cloudinary.js` | Image upload helpers |
| `razorpay.js` | Payment integration |
| `sentry.js` | Error tracking |
| `posthog.js` | Analytics |
| `logrocket.js` | Session recording |
| `onesignal.js` | Push notifications |
| `googleMaps.js` | Maps integration |

---

### pages/ - Full Page Components

| Page | URL | Purpose |
|------|-----|---------|
| `HomePage.jsx` | `/` | Landing page with search |
| `SearchResults.jsx` | `/search` | Artisan search results |
| `ArtisanProfilePage.jsx` | `/:publicId` | Public artisan profile |
| `LoginPage.jsx` | `/artisan/login` | Artisan login |
| `RegisterPage.jsx` | `/artisan/register` | Artisan registration |
| `UserLoginPage.jsx` | `/login` | User login |
| `UserRegisterPage.jsx` | `/register` | User registration |
| `ArtisanDashboardPage.jsx` | `/artisan/dashboard` | Artisan's dashboard |
| `UserProfilePage.jsx` | `/profile` | User's profile |
| `MessagesPage.jsx` | `/messages` | Chat interface |
| `VideoCallPage.jsx` | `/call/:roomName` | Video call |
| `PaymentsPage.jsx` | `/payments` | Payment history |

---

### components/ - Reusable UI

#### Layout Components
```
components/
├── Layout.jsx         # Main page wrapper (header + footer + content)
├── Header.jsx         # Navigation bar
├── Footer.jsx         # Page footer
├── SEO.jsx            # Meta tags for SEO
└── RequireAuth.jsx    # Protects routes requiring login
```

#### Feature Components
```
components/
├── ArtisanSearch.jsx      # Algolia search box
├── ChatInterface.jsx      # Stream Chat UI
├── VideoCall.jsx          # Daily.co video UI
├── ImageUpload.jsx        # Cloudinary upload
├── ContactForm.jsx        # Contact form
├── Categories.jsx         # Category grid
├── HeroSearch.jsx         # Homepage hero with search
└── Payment/
    └── PaymentButton.jsx  # Razorpay payment button
```

#### Profile Components
```
components/profile/
└── tabs/
    ├── ProfileTab.jsx           # User profile editing
    ├── ArtisanProfileTab.jsx    # Artisan profile editing
    ├── BookingsTab.jsx          # Booking management
    ├── ReviewsTab.jsx           # Reviews list
    ├── EarningsTab.jsx          # Earnings/payments
    └── DashboardOverviewTab.jsx # Stats overview
```

---

### hooks/ - Custom React Hooks

```javascript
// useNotifications.js - Push notification handling
export function useNotifications() {
  const { unreadCount } = useContext(NotificationContext);
  // Returns notification-related state and functions
}

// useCategories.js - Fetch and cache categories
export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get('/api/categories').then(res => setCategories(res.data));
  }, []);
  return categories;
}
```

---

## Data Flow

### Complete Booking Flow

```
1. USER BROWSES ARTISANS
   Frontend: SearchResults.jsx
   → GET /api/search/artisans (Algolia)
   → Display artisan cards

2. USER VIEWS ARTISAN PROFILE
   Frontend: ArtisanProfilePage.jsx
   → GET /api/artisans/:publicId
   → GET /api/services?artisan=:id
   → Display profile with services

3. USER BOOKS SERVICE
   Frontend: BookingModal in SearchResults.jsx
   → POST /api/bookings
   → Backend creates booking (status: 'pending')
   → Backend creates chat channel
   → Backend notifies artisan

4. ARTISAN CONFIRMS BOOKING
   Frontend: BookingsTab.jsx
   → PATCH /api/bookings/:id { status: 'confirmed' }
   → Backend notifies user

5. USER PAYS
   Frontend: PaymentButton.jsx
   → POST /api/payments/create-order (creates Razorpay order)
   → Frontend opens Razorpay checkout
   → User completes payment
   → Razorpay calls webhook: POST /api/payments/webhook
   → POST /api/payments/verify (frontend confirmation)
   → Backend updates payment status
   → Backend updates booking status

6. SERVICE DELIVERED
   Frontend: BookingsTab.jsx
   → PATCH /api/bookings/:id { status: 'completed' }

7. USER LEAVES REVIEW
   Frontend: ReviewForm
   → POST /api/reviews
   → Backend updates artisan rating
```

---

## Third-Party Services

### Cloudinary (Image Hosting)
- **What:** Cloud image storage and transformation
- **Used for:** Profile photos, portfolio images
- **How:** Frontend gets signed upload URL, uploads directly to Cloudinary, saves URL in database

### Algolia (Search)
- **What:** Fast, typo-tolerant search engine
- **Used for:** Artisan search
- **How:** Artisans indexed when created/updated, frontend queries Algolia directly

### Stream Chat (Messaging)
- **What:** Real-time chat infrastructure
- **Used for:** User-artisan messaging
- **How:** Backend creates channels, frontend connects with user token

### Daily.co (Video Calls)
- **What:** Video conferencing API
- **Used for:** Video consultations
- **How:** Backend creates room, frontend joins with token

### Razorpay (Payments)
- **What:** Indian payment gateway
- **Used for:** Service payments
- **How:** Backend creates order, frontend shows checkout, webhook confirms payment

### Firebase (Phone Auth)
- **What:** Phone number verification
- **Used for:** Artisan phone verification
- **How:** Frontend triggers OTP, Firebase verifies, backend creates account

### OneSignal (Push Notifications)
- **What:** Push notification service
- **Used for:** Booking alerts, messages
- **How:** Frontend registers device, backend sends via OneSignal API

### Sentry (Error Tracking)
- **What:** Error monitoring
- **Used for:** Catching and reporting errors
- **How:** Errors automatically captured and sent to Sentry dashboard

### PostHog (Analytics)
- **What:** Product analytics
- **Used for:** Tracking user behavior
- **How:** Frontend/backend track events, view in PostHog dashboard

### LogRocket (Session Recording)
- **What:** Session replay tool
- **Used for:** Debugging user issues
- **How:** Records user sessions for replay

---

## Common Patterns

### API Response Format
```javascript
// Success
{
  success: true,
  data: {...} or [...],
  message: "Optional message"
}

// Error
{
  success: false,
  message: "Error description",
  stack: "..." // Only in development
}
```

### Authentication Pattern
```javascript
// Backend: Protect route
router.get('/protected', protect, controller);

// Frontend: Check auth
const { isAuthenticated, user } = useAuth();
if (!isAuthenticated) return <Navigate to="/login" />;
```

### Loading States
```jsx
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/data')
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <Display data={data} />;
}
```

### Form Handling
```jsx
function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/endpoint', formData);
      toast.success('Saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={e => setFormData({...formData, name: e.target.value})}
      />
      <button disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

---

## Quick Reference

### Start Development
```bash
# Terminal 1 - Backend
cd kalasetu-backend
npm run dev

# Terminal 2 - Frontend
cd kalasetu-frontend
npm run dev
```

### Environment Files
- Backend: `kalasetu-backend/.env`
- Frontend: `kalasetu-frontend/.env`

### Key URLs (Development)
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api

### Test Accounts
- Artisan: `showcase.artisan@demo.kalasetu.com` / `Demo@1234`
- User: `showcase.user@kalasetu.com` / `Demo@1234`
- Admin: `showcase.admin@kalasetu.com` / `SuperAdmin@123`
