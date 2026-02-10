# KalaSetu - Artisan Marketplace Platform
## Project-Based Learning Synopsis (Semester 2025)

**MIT World Peace University, Pune**

---

## Team Members
[Add your team member names, roll numbers, and division here]

**Guide:** [Professor Name]

**Department:** Computer Engineering

**Academic Year:** 2024-2025

---

# Index

| Sr. No. | Contents | PAGE NO. |
|---------|----------|----------|
| **1** | **Introduction** | 4 |
| 1.1 | Existing System and Need for System | 4 |
| 1.2 | Scope of System | 5 |
| 1.3 | Operating Environment - Hardware and Software | 6 |
| 1.4 | Brief Description of Technology Used | 7 |
| **2** | **Proposed System** | 9 |
| 2.1 | Feasibility Study | 9 |
| 2.2 | Objectives of Proposed System | 10 |
| 2.3 | Users of System | 11 |
| **3** | **Analysis and Design** | 12 |
| 3.1 | System Requirements (Functional and Non-Functional requirements) | 12 |
| 3.2 | Module Hierarchy Diagram | 15 |
| 3.3 | Sample Input and Output Screens | 16 |
| 3.4 | Database | 20 |

---

# 1. INTRODUCTION

## 1.1 Existing System and Need for System

### Background
India has a rich heritage of traditional arts and crafts, with millions of skilled artisans across the country. These artisans include carpenters, painters, electricians, plumbers, traditional craftsmen, wedding decorators, mehendi artists, tailors, and many more skilled professionals. However, despite their exceptional skills, these artisans face significant challenges in reaching potential customers and growing their businesses in the digital age.

### Problems with Current Scenario

**For Artisans:**
- **Limited Digital Presence:** Most artisans lack personal websites or effective online marketing, making them invisible to customers searching online
- **Discovery Challenges:** Customers cannot easily find or verify skilled artisans in their locality
- **No Centralized Platform:** Artisans are scattered across various local directories, social media, and word-of-mouth networks
- **Payment Issues:** Informal payment systems, lack of digital payment integration
- **Communication Gaps:** No structured way to communicate with customers, manage bookings, or handle inquiries
- **Business Management:** Difficulty tracking bookings, earnings, customer reviews, and managing their service portfolio

**For Customers:**
- **Trust and Verification Issues:** No reliable way to verify an artisan's credentials, past work quality, or customer satisfaction
- **Search Difficulties:** Time-consuming process of finding the right artisan through personal contacts or unreliable local directories
- **No Transparent Pricing:** Price discovery is difficult; customers cannot compare services or costs easily
- **Communication Barriers:** No structured channel for inquiries, bookings, or following up on work progress
- **Payment Concerns:** No secure payment gateway or transaction records
- **No Review System:** Cannot read authentic reviews from previous customers or share their own experiences

### Need for KalaSetu

KalaSetu (translating to "Bridge of Arts") addresses these challenges by creating a comprehensive digital marketplace that bridges the gap between traditional artisans and modern customers. The platform provides:

1. **Digital Identity for Artisans:** Professional profiles with portfolios, service listings, and verified credentials
2. **Trust Mechanism:** Review system, verified booking history, and transparent pricing
3. **Seamless Discovery:** Advanced search with location-based filtering, category browsing, and AI-powered recommendations
4. **Integrated Communication:** Built-in chat and video consultation features
5. **Secure Transactions:** Integrated payment gateway with transparent pricing and automated invoicing
6. **Business Tools for Artisans:** Dashboard for managing bookings, earnings, customer communication, and portfolio

### Version 1.0 Summary (Previous Semester)
In the previous semester, we built the foundational version of KalaSetu with:
- User and Artisan registration/authentication systems
- Basic profile management for both user types
- Search functionality using Algolia
- Booking creation (basic implementation)
- Payment integration with Razorpay
- Chat integration using Stream Chat
- Video call integration using Daily.co
- Admin panel with basic monitoring

### Need for Enhancement (Current Semester)
After deploying Version 1.0 and conducting internal testing, we identified critical gaps:

**Critical Issues Identified:**
1. **Security Vulnerabilities:** XSS attacks possible in search results, regex DoS vulnerabilities, missing encryption for sensitive data (60+ documented security/bug issues)
2. **Incomplete Features:** Bookings page is non-functional, payment refunds not implemented, review system lacks verification
3. **Performance Problems:** N+1 query issues in dashboard causing slow load times, missing database indexes
4. **Poor User Experience:** Missing error handling, no loading states, inconsistent UI components
5. **Missing Business Features:** No revenue model implementation, no artisan business tools, no quality assurance mechanisms

**This semester's work focuses on:**
- **Fixing critical bugs and security vulnerabilities** (Top 10 priority issues)
- **Completing incomplete core features** (Bookings system, Payment refunds, Enhanced reviews)
- **Adding essential business features** (Subscription tiers, Artisan analytics dashboard, Withdrawal system)
- **Implementing testing infrastructure** (Unit tests, integration tests, E2E testing)
- **Performance optimization** (Database indexing, query optimization, caching strategy)

### Project Continuation Declaration

**Project Status:** CONTINUING from Previous Semester (Version 1.0 to Version 2.0)

**Previous Semester Achievement (Version 1.0):**
We successfully built and deployed a functional artisan marketplace platform with user/artisan authentication, search functionality, basic booking system, payment integration (Razorpay), real-time chat (Stream), video calls (Daily.co), and admin panel.

**This Semester's Focus (Version 2.0 - Enhancement and Expansion):**
Based on thorough testing and analysis of Version 1.0, we identified 60+ bugs and incomplete features. This semester, we are enhancing the existing platform by adding the following new modules:

**A. Security and Bug Fixes Module (10 Critical Issues)**
- XSS vulnerability fixes with DOMPurify sanitization
- ReDoS vulnerability fixes in search patterns
- Bank account data encryption at rest (AES-256)
- Webhook idempotency system for payments
- Per-endpoint rate limiting implementation

**B. Enhanced Booking Management Module**
- Complete functional bookings dashboard (currently a stub)
- Artisan booking approval/rejection workflow
- Booking modification and rescheduling system
- Cancellation tracking with reason logging
- Automated reminder system (email + push notifications)

**C. Complete Payment and Finance Module**
- Full refund processing system (Razorpay Refund API)
- Partial refund support
- Dispute handling mechanism
- NEW: Artisan withdrawal/payout system
- NEW: Automated PDF invoice generation
- NEW: Commission calculation and tracking

**D. Enhanced Review and Rating Module**
- NEW: Photo/video review support (Cloudinary integration)
- NEW: "Verified Purchase" badge system
- NEW: Artisan response to reviews capability
- Review moderation and reporting

**E. Artisan Subscription Tiers Module (COMPLETELY NEW)**
- NEW: Free Tier (20% commission, basic features)
- NEW: Professional Tier (Rs. 999/month, 15% commission, priority placement)
- NEW: Premium Tier (Rs. 2,499/month, 10% commission, featured listings)
- NEW: Subscription payment processing

**F. Artisan Analytics Dashboard Module (COMPLETELY NEW)**
- NEW: Earnings analytics with charts
- NEW: Booking trends and insights
- NEW: Customer management (repeat customers, notes)
- NEW: Performance metrics (response time, acceptance rate)
- NEW: Revenue projections

**G. Testing Infrastructure Module (COMPLETELY NEW)**
- NEW: Jest setup for backend unit tests
- NEW: React Testing Library for frontend tests
- NEW: Playwright for E2E testing
- Target: 60%+ backend coverage, 50%+ frontend coverage

**H. Performance Optimization Module**
- Database indexing for frequently queried fields
- N+1 query optimization using aggregation pipelines
- Redis caching implementation for frequent data
- Code splitting and lazy loading

**Expected Outcome:**
By the end of this semester, KalaSetu Version 2.0 will be a production-ready, secure, and scalable platform with complete business features, robust testing, and optimized performance - ready for real-world deployment.

---

## 1.2 Scope of System

### Current Scope (Version 1.0 - Completed)

**For Artisans:**
- Registration and profile creation
- Service listing management
- Basic portfolio upload (images)
- Booking notifications
- Basic earnings dashboard
- Chat with customers
- Profile visibility in search results

**For Customers (Users):**
- Registration and authentication
- Search artisans by category, location, or keywords
- View artisan profiles and services
- Create basic bookings
- Payment via Razorpay
- Chat with artisans
- Basic review submission

**For Platform (Admin):**
- User and artisan management
- Basic analytics dashboard
- Content moderation tools
- Category management

### Enhanced Scope (Version 2.0 - This Semester)

#### A. Bug Fixes and Security Enhancements
1. **Security Hardening:**
   - Fix XSS vulnerability in search results (implement DOMPurify sanitization)
   - Fix ReDoS vulnerability in search regex patterns
   - Encrypt sensitive data (bank account details, PII)
   - Implement proper rate limiting per endpoint (stricter on auth)
   - Add webhook idempotency for payment processing

2. **Critical Bug Fixes:**
   - Fix MessagesPage ChatContext crash
   - Implement functional Bookings dashboard
   - Fix N+1 query performance issues in artisan dashboard
   - Resolve AuthContext hydration issues
   - Fix inconsistent user ID handling across codebase

3. **Error Handling:**
   - Implement React error boundaries
   - Add proper error logging (replace console.log with Winston)
   - Handle silent failures in booking communication setup
   - Implement webhook retry mechanism

#### B. Feature Completion

1. **Booking System Enhancement:**
   - Complete booking management page (currently a stub)
   - Implement booking approval workflow (artisan can accept/reject)
   - Add booking modification and rescheduling
   - Implement cancellation with reason tracking
   - Add booking reminders (email + push notifications)
   - Booking history with advanced filtering

2. **Payment System Completion:**
   - Implement refund flow (full and partial refunds)
   - Add dispute handling mechanism
   - Implement withdrawal system for artisans
   - Payment splitting (platform commission)
   - Generate PDF invoices
   - Transaction history with detailed receipts

3. **Review System Enhancement:**
   - Add "Verified Purchase" badge for authentic reviews
   - Photo/video review support
   - Allow artisan responses to reviews
   - Review reporting and moderation
   - Review analytics for artisans

#### C. New Business Features

1. **Artisan Subscription Tiers:**
   - **Free Tier:** Basic profile, 5 portfolio items, 20% commission
   - **Professional Tier (₹999/month):** Enhanced profile, unlimited portfolio, 15% commission, priority search placement
   - **Premium Tier (₹2499/month):** Featured listings, 10% commission, dedicated support, advanced analytics

2. **Artisan Business Dashboard:**
   - Earnings analytics with charts
   - Booking trends and insights
   - Customer management (repeat customers, notes)
   - Performance metrics (response time, acceptance rate)
   - Revenue projections

3. **Enhanced Profile Features:**
   - Video portfolio uploads
   - Before/after project galleries
   - Certifications and skill badges
   - Availability calendar with Google Calendar sync

#### D. Testing and Quality Assurance

1. **Testing Infrastructure:**
   - Set up Jest for backend unit tests
   - Set up React Testing Library for frontend
   - Write test coverage for auth flows (target: 70%+)
   - Write test coverage for payment flows (target: 80%+)
   - Implement E2E testing with Playwright

2. **Code Quality:**
   - Add PropTypes validation to all React components
   - Implement ESLint strict rules
   - Add database indexes for performance
   - Refactor large components (300+ line components split)

#### E. Performance Optimization

1. **Database Optimization:**
   - Add composite indexes on frequently queried fields
   - Optimize N+1 queries using aggregation pipelines
   - Implement query result caching with Redis

2. **Frontend Performance:**
   - Implement code splitting by route
   - Add React.memo for expensive components
   - Lazy load images and heavy components
   - Bundle size optimization

### Out of Scope (Future Enhancements)
- Multi-language support (i18n)
- Mobile native apps (React Native)
- AI-powered recommendations
- Community features (forums, mentorship)
- Multi-currency support

---

## 1.3 Operating Environment - Hardware and Software

### Hardware Requirements

#### Development Environment
**Minimum Configuration:**
- **Processor:** Intel Core i5 (8th gen) or AMD Ryzen 5 equivalent
- **RAM:** 8 GB DDR4
- **Storage:** 256 GB SSD
- **Network:** Broadband internet connection (minimum 10 Mbps)

**Recommended Configuration:**
- **Processor:** Intel Core i7 (10th gen) or AMD Ryzen 7 equivalent
- **RAM:** 16 GB DDR4
- **Storage:** 512 GB NVMe SSD
- **Network:** Broadband internet connection (50+ Mbps)

#### Production Server Environment
- **Cloud Platform:** Render.com / Railway.app / AWS EC2
- **CPU:** 2+ vCPUs
- **RAM:** 4 GB minimum (8 GB recommended)
- **Storage:** 50 GB SSD
- **Bandwidth:** Unlimited or 1 TB/month minimum

#### Database Server
- **Platform:** MongoDB Atlas (Cloud)
- **Cluster:** M10 tier or above (production)
- **Storage:** 10 GB minimum, auto-scaling enabled
- **Backup:** Automated daily backups with point-in-time recovery

### Software Requirements

#### Development Tools

**Backend Development:**
- **Operating System:** Windows 10/11, macOS 11+, or Ubuntu 20.04+
- **Runtime:** Node.js v18.x or v20.x (LTS versions)
- **Package Manager:** npm v9.x or pnpm v8.x
- **Code Editor:** Visual Studio Code v1.85+
- **API Testing:** Postman v10.x or Thunder Client
- **Version Control:** Git v2.40+

**Frontend Development:**
- **Build Tool:** Vite v5.x
- **Code Editor:** Visual Studio Code with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

**Database Tools:**
- **MongoDB Compass** v1.40+ (GUI for MongoDB)
- **Database Client:** Studio 3T or Robo 3T (optional)

#### Technology Stack

**Frontend Technologies:**
```
Core Framework:
- React 18.3.x (UI library)
- React Router v7 (routing)
- Vite 5.x (build tool)

Styling:
- Tailwind CSS v3.4.x (utility-first CSS)
- PostCSS (CSS processing)

State Management:
- React Context API (global state)
- Jotai v2.x (atomic state management)

Form Handling:
- React Hook Form v7.x (form validation)
- Zod (schema validation)

UI Components:
- Headless UI v2.x (accessible components)
- React Icons v5.x (icon library)
- React Hot Toast (notifications)

Media:
- Cloudinary React SDK (image management)
- React Player (video playback)

Real-time Features:
- Stream Chat React v11.x (messaging)
- @daily-co/daily-react (video calls)

Search:
- Algolia InstantSearch React (search UI)
- Algoliasearch v4.x (search client)

Analytics:
- PostHog React (product analytics)
- Sentry React SDK (error tracking)
- LogRocket (session replay)

Other:
- Axios v1.x (HTTP client)
- date-fns (date utilities)
- Firebase v10.x (authentication option)
```

**Backend Technologies:**
```
Runtime & Framework:
- Node.js v20.x (JavaScript runtime)
- Express.js v4.19.x (web framework)

Database:
- MongoDB v7.x (NoSQL database)
- Mongoose v8.x (ODM - Object Data Modeling)

Authentication:
- jsonwebtoken v9.x (JWT tokens)
- bcryptjs v2.4.x (password hashing)
- Firebase Admin SDK (OAuth integration)

Validation:
- Zod v3.x (schema validation)
- express-validator v7.x (request validation)

File Upload:
- Multer v1.4.x (multipart/form-data handling)
- Cloudinary v2.x (cloud storage)

Payment:
- Razorpay Node SDK v2.x (payment gateway)

Communication:
- Stream Chat Node SDK (real-time messaging)
- @daily-co/daily-js (video call API)
- Nodemailer v6.x (email sending)

Background Jobs:
- @upstash/qstash v2.x (serverless job queue)

Caching:
- @upstash/redis v1.x (Redis client)

Search:
- Algoliasearch v4.x (search indexing)

Security:
- Helmet v7.x (security headers)
- express-rate-limit v7.x (rate limiting)
- cors v2.8.x (CORS middleware)
- express-mongo-sanitize (NoSQL injection prevention)

Logging:
- Winston v3.x (logging library) [TO BE IMPLEMENTED]
- Morgan v1.10.x (HTTP request logger)

Monitoring:
- Sentry Node SDK (error tracking)
- PostHog Node (analytics)

Utilities:
- dotenv v16.x (environment variables)
- cookie-parser v1.4.x (cookie handling)
- compression v1.7.x (response compression)
```

**Third-Party Services:**
```
Authentication:
- Firebase Authentication (OAuth providers)

Database:
- MongoDB Atlas (managed MongoDB)

Storage:
- Cloudinary (images, videos, files)

Search:
- Algolia (full-text search)

Communication:
- Stream Chat (real-time messaging)
- Daily.co (video conferencing)
- OneSignal (push notifications)

Payments:
- Razorpay (payment processing)

Email:
- SendGrid / Mailgun (transactional emails)

Monitoring:
- Sentry (error tracking)
- PostHog (product analytics)
- LogRocket (session recording)

Background Jobs:
- QStash by Upstash (serverless job queue)

Caching:
- Upstash Redis (serverless Redis)
```

#### Browser Compatibility
**Supported Browsers:**
- Google Chrome v120+ (Recommended)
- Mozilla Firefox v120+
- Microsoft Edge v120+
- Safari v16+ (macOS/iOS)
- Brave v1.60+

**Mobile Browsers:**
- Chrome Mobile (Android)
- Safari Mobile (iOS)

---

## 1.4 Brief Description of Technology Used

### Frontend Technologies

#### React 18.3.x
React is a JavaScript library for building user interfaces developed by Meta. We use React because:
- **Component-Based Architecture:** Reusable UI components reduce code duplication
- **Virtual DOM:** Efficient rendering and excellent performance
- **Large Ecosystem:** Extensive library support for all our needs
- **Developer Experience:** Hot module replacement, great debugging tools

**Usage in KalaSetu:**
- All UI components (Header, Footer, Artisan Cards, Booking Forms, etc.)
- Client-side routing with React Router
- State management with Context API and Jotai
- Form handling with React Hook Form

#### Vite 5.x
Vite is a next-generation frontend build tool that provides:
- **Fast Development Server:** Instant server start and hot module replacement (HMR)
- **Optimized Build:** Rollup-based production builds with automatic code splitting
- **Modern JavaScript:** Native ES modules support

**Why Vite over Create React App:**
- 10-100x faster cold server start
- Instant HMR regardless of app size
- Smaller bundle sizes with better tree-shaking

#### Tailwind CSS 3.4.x
Tailwind is a utility-first CSS framework that allows rapid UI development:
- **No Custom CSS:** Build complex designs without leaving HTML
- **Consistency:** Predefined utility classes ensure design consistency
- **Responsive:** Mobile-first responsive modifiers (sm:, md:, lg:)
- **Small Bundle:** PurgeCSS removes unused styles (typically <10 KB)

**Example Usage:**
```jsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
  Book Now
</button>
```

#### Stream Chat React
Stream provides enterprise-grade chat infrastructure:
- **Real-time Messaging:** WebSocket-based instant message delivery
- **Read Receipts:** Know when messages are read
- **Typing Indicators:** See when someone is typing
- **File Sharing:** Built-in image and file upload support
- **Reactions:** Message reactions and threading

**Integration in KalaSetu:**
- Customer-Artisan communication
- Booking-specific chat channels
- Auto-created channels when booking is confirmed

#### Daily.co Video Calls
Daily provides video conferencing infrastructure:
- **WebRTC-based:** High-quality peer-to-peer video/audio
- **No Downloads:** Works in browser, no plugins needed
- **Screen Sharing:** Share screen for demonstrations
- **Recording:** Call recording capability
- **Scalable:** Supports 1-on-1 and group calls

**Use Cases:**
- Pre-booking consultations
- Virtual service demonstrations
- Remote design discussions

#### Algolia InstantSearch
Algolia provides blazing-fast search-as-you-type functionality:
- **Instant Results:** Sub-50ms search response times
- **Typo Tolerance:** Finds results even with spelling mistakes
- **Faceted Search:** Filter by category, location, price, rating
- **Geo Search:** Location-based search and sorting
- **Highlighting:** Search term highlighting in results

**Implementation:**
- Artisan search by name, skills, location
- Service search
- Auto-complete suggestions

### Backend Technologies

#### Node.js 20.x & Express.js 4.19.x
Node.js is a JavaScript runtime built on Chrome's V8 engine. Express is the most popular Node.js web framework.

**Advantages:**
- **JavaScript Everywhere:** Same language for frontend and backend
- **Non-blocking I/O:** Handles thousands of concurrent connections efficiently
- **NPM Ecosystem:** 2+ million packages available
- **Fast Development:** Rapid prototyping and development

**Architecture Pattern:**
```
Routes → Controllers → Services → Models → Database
```

#### MongoDB 7.x & Mongoose 8.x
MongoDB is a NoSQL document database. Mongoose is an ODM (Object Data Modeling) library.

**Why MongoDB:**
- **Flexible Schema:** Easy to modify data structure as project evolves
- **JSON-like Documents:** Natural fit with JavaScript/Node.js
- **Powerful Queries:** Rich query language with aggregation framework
- **Scalability:** Horizontal scaling with sharding
- **Atlas Cloud:** Managed database service with automatic backups

**Schema Example:**
```javascript
const artisanSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  skills: [{ type: String }],
  location: {
    city: String,
    coordinates: { type: [Number], index: '2dsphere' }
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });
```

#### JWT (JSON Web Tokens)
JWT is used for stateless authentication:
- **Token Structure:** Header.Payload.Signature
- **Stateless:** No server-side session storage needed
- **Secure:** Cryptographically signed, stored in HTTP-only cookies
- **Payload:** Contains user ID, role, expiration

**Authentication Flow:**
1. User logs in with credentials
2. Server validates and generates JWT
3. JWT stored in HTTP-only cookie
4. Cookie sent with every request
5. Server verifies JWT on protected routes

#### Razorpay Payment Gateway
Razorpay is India's leading payment gateway:
- **Multiple Payment Methods:** UPI, Cards, Net Banking, Wallets
- **PCI DSS Compliant:** Secure payment processing
- **Webhooks:** Real-time payment status notifications
- **Refunds:** Instant refund processing
- **Dashboard:** Transaction monitoring and reports

**Payment Flow:**
1. Frontend initiates payment with amount and booking details
2. Backend creates Razorpay order
3. Razorpay checkout modal opens on frontend
4. User completes payment
5. Webhook notifies backend
6. Payment record updated, booking confirmed
7. Notifications sent to both parties

#### Cloudinary
Cloudinary is a cloud-based image and video management service:
- **Automatic Optimization:** Converts images to optimal format (WebP, AVIF)
- **Responsive Images:** Serves different sizes based on device
- **Transformations:** Resize, crop, filter images on-the-fly
- **CDN Delivery:** Fast global content delivery
- **Video Support:** Video transcoding and streaming

**Usage:**
- Artisan profile pictures
- Portfolio images (before/after photos)
- Service images
- Video portfolio uploads

### Database Design Approach

We use a **hybrid approach** combining:

**Embedded Documents** (for data frequently accessed together):
```javascript
// Artisan profile with embedded address
{
  fullName: "Rajesh Kumar",
  address: {
    street: "123 MG Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001"
  }
}
```

**Referenced Documents** (for data that needs independent querying):
```javascript
// Booking references User and Artisan
{
  _id: ObjectId("..."),
  user: ObjectId("user123"),  // Reference
  artisan: ObjectId("artisan456"),  // Reference
  service: ObjectId("service789"),
  status: "confirmed"
}
```

### Security Implementations

#### Current Security Measures:
1. **Password Security:**
   - Bcrypt hashing with salt rounds = 10
   - Minimum 8 characters, requires uppercase, lowercase, number, special char

2. **JWT Security:**
   - HTTP-only cookies (not accessible via JavaScript)
   - Secure flag in production (HTTPS only)
   - 7-day expiration
   - Signed with secret key

3. **Input Validation:**
   - Zod schema validation on all API endpoints
   - MongoDB sanitization (prevents NoSQL injection)
   - Express validator for complex validations

4. **Rate Limiting:**
   - 1000 requests per 15 minutes per IP
   - Prevents brute force attacks

5. **Security Headers:**
   - Helmet.js (sets various HTTP headers)
   - CORS configured for specific origins only

#### New Security Measures (This Semester):
1. **XSS Prevention:**
   - DOMPurify sanitization on search results
   - Content Security Policy (CSP) headers

2. **ReDoS Prevention:**
   - Escape regex patterns for user input
   - Use MongoDB $text search instead of $regex where possible

3. **Data Encryption:**
   - Encrypt sensitive fields (bank account numbers) at rest
   - Field-level encryption using mongoose-encryption

4. **Enhanced Rate Limiting:**
   - Stricter limits on auth endpoints (5 login attempts per 15 min)
   - Per-endpoint rate limiting

5. **Webhook Security:**
   - Idempotency key checking (prevent duplicate processing)
   - Signature verification for Razorpay webhooks

---

# 2. PROPOSED SYSTEM

## 2.1 Feasibility Study

### Technical Feasibility

**Existing Infrastructure:**
Our team has already successfully built and deployed Version 1.0 of KalaSetu, demonstrating technical capability. The proposed enhancements build upon this foundation.

**Skills Assessment:**
- ✅ **Team Expertise:** Proficient in React, Node.js, MongoDB, REST APIs
- ✅ **Learning Curve:** Minimal - we're enhancing existing codebase, not learning new tech stacks
- ✅ **Tools & Services:** All third-party services (Razorpay, Stream, Daily.co, Algolia) are already integrated
- ⚠️ **New Skills Needed:** Testing frameworks (Jest, React Testing Library, Playwright) - will require 1-2 weeks learning

**Technical Challenges & Solutions:**

| Challenge | Solution | Feasibility |
|-----------|----------|-------------|
| N+1 Query Performance Issues | Replace multiple queries with MongoDB aggregation pipelines | **High** - Standard MongoDB optimization |
| XSS Vulnerability in Search | Implement DOMPurify library for HTML sanitization | **High** - Simple library integration |
| Webhook Idempotency | Store webhook event IDs in database, check before processing | **High** - Database lookup pattern |
| Encrypted Bank Details | Use mongoose-encryption plugin for field-level encryption | **High** - Plugin already exists |
| Testing Infrastructure | Set up Jest + React Testing Library + Playwright | **Medium** - Requires learning, but well-documented |
| Refund Processing | Use Razorpay Refund API (already available in SDK) | **High** - API endpoint exists |
| Withdrawal System for Artisans | Implement Razorpay Payout API | **Medium** - Requires KYC verification setup |

**Technical Verdict:** ✅ **Feasible** - All proposed changes are technically achievable within one semester.

---

### Economic Feasibility

**Development Costs:**
```
Human Resources: Zero additional cost (student project)
```

**Infrastructure Costs (Monthly):**

| Service | Current Tier | Upgrade Needed | Cost |
|---------|--------------|----------------|------|
| MongoDB Atlas | Free Tier (512 MB) | M2 (2 GB) for production | ₹2,000/month |
| Render/Railway (Backend) | Free Tier | Starter Plan | ₹1,500/month |
| Cloudinary | Free Tier (25 GB/month) | Same | ₹0 |
| Algolia | Free Tier (10k searches/month) | Same | ₹0 |
| Stream Chat | Free Tier (5 MAUs) | Growth Plan if needed | ₹0-₹3,000 |
| Daily.co | Free Tier (10k minutes/month) | Same | ₹0 |
| Razorpay | Transaction-based (2% fee) | Same | ₹0 (pay per transaction) |
| OneSignal | Free Tier (unlimited) | Same | ₹0 |
| Sentry | Free Tier (5k errors/month) | Same | ₹0 |
| Domain | Namecheap | Already purchased | ₹800/year |
| **Total** | | | **₹3,500-6,500/month** |
```

**Revenue Projections (Once Live):**

**Month 1-3 (Soft Launch):**
```
Estimated Artisans: 50
Estimated Bookings: 100/month
Average Booking Value: ₹1,500
Platform Commission (15%): ₹225 per booking
Monthly Revenue: ₹22,500

Costs: ₹6,500
Net: ₹16,000/month
```

**Month 4-6 (Marketing Push):**
```
Estimated Artisans: 200
Estimated Bookings: 500/month
Average Booking Value: ₹1,500
Platform Commission (15%): ₹225 per booking
Monthly Revenue: ₹1,12,500

Subscription Revenue:
- 10 Professional subscriptions (₹999) = ₹9,990
- 3 Premium subscriptions (₹2,499) = ₹7,497

Total Monthly Revenue: ₹1,29,987
Costs: ₹10,000 (increased infrastructure)
Net: ₹1,19,987/month
```

**Break-even Analysis:**
```
Fixed Costs/month: ₹6,500
Variable Costs: 2% (Razorpay fees)
Revenue per booking: ₹225

Break-even bookings = 6,500 / 225 = 29 bookings/month
```

**Economic Verdict:** ✅ **Economically Feasible** - Low infrastructure costs, multiple revenue streams, achievable break-even point.

---

### Operational Feasibility

**User Acceptance:**

**Validation Through Testing:**
- Internal testing of Version 1.0 completed with 10 test users
- Feedback collected identified:
  - ✅ Positive: Easy navigation, good search experience, simple booking flow
  - ⚠️ Issues: Bookings page not working, missing refund option, slow dashboard load

**Target User Acceptance:**
- **Artisans:** High acceptance expected - platform provides free digital presence and customer acquisition
- **Customers:** High acceptance expected - solves trust and discovery problems
- **Competitive Advantage:** Only platform focused specifically on Indian artisans with full booking-to-payment flow

**Operational Requirements:**

| Requirement | Solution | Status |
|-------------|----------|--------|
| **Customer Support** | Initially handled by team via OneSignal + email | ✅ Manageable |
| **Content Moderation** | Admin panel with review queue + automated flagging | ✅ Built-in |
| **Payment Reconciliation** | Razorpay dashboard + automated reports | ✅ Automated |
| **Artisan Onboarding** | Self-service registration + admin verification | ✅ Implemented |
| **Dispute Resolution** | Chat history + booking records + admin intervention | ⚠️ Manual initially |
| **System Maintenance** | Automated deployments via GitHub Actions + monitoring | ✅ Automated |

**Scalability:**
- Current architecture supports 1,000+ concurrent users
- Database can scale horizontally (MongoDB sharding)
- Stateless backend allows multiple server instances
- CDN (Cloudinary) handles media scaling

**Operational Verdict:** ✅ **Operationally Feasible** - System can be managed by team during testing phase, minimal manual intervention needed.

---

### Schedule Feasibility

**Project Timeline: 14 Weeks (One Semester)**

**Week 1-2: Critical Bug Fixes (High Priority)**
- Fix MessagesPage ChatContext crash
- Fix XSS vulnerability (implement DOMPurify)
- Fix ReDoS vulnerability (escape regex patterns)
- Fix AuthContext hydration issues
- Fix N+1 query performance in dashboard

**Week 3-4: Security Enhancements**
- Implement database encryption for sensitive fields
- Add webhook idempotency checks
- Implement per-endpoint rate limiting
- Add Content Security Policy headers
- Set up proper logging with Winston

**Week 5-6: Feature Completion - Bookings**
- Complete Bookings page implementation
- Add booking approval workflow
- Implement booking modification/rescheduling
- Add cancellation with reason tracking
- Booking reminders (email + push)

**Week 7-8: Feature Completion - Payments**
- Implement refund flow (full & partial)
- Add dispute handling
- Implement withdrawal system for artisans
- Payment splitting (commission calculation)
- Generate PDF invoices

**Week 9-10: New Business Features**
- Implement subscription tier system
- Enhanced artisan dashboard with analytics
- Review system improvements (verified badge, photos)
- Artisan response to reviews

**Week 11-12: Testing Infrastructure**
- Set up Jest + React Testing Library
- Write unit tests for critical functions
- Write integration tests for auth and payment flows
- Set up Playwright for E2E tests
- Achieve 60%+ test coverage

**Week 13: Performance Optimization**
- Add database indexes
- Implement Redis caching for frequent queries
- Code splitting and lazy loading
- Bundle size optimization
- Refactor large components

**Week 14: Final Testing & Documentation**
- User acceptance testing
- Load testing
- Security audit
- Complete API documentation
- Deployment to production

**Buffer:** 1-2 weeks built into each phase for unexpected issues

**Schedule Verdict:** ✅ **Schedule is Feasible** - Realistic timeline with buffer time, prioritizes critical fixes first.

---

### Legal Feasibility

**Intellectual Property:**
- ✅ All code is original, written by team
- ✅ Third-party libraries used are open-source (MIT/Apache licenses)
- ✅ Paid services (Razorpay, Stream, Daily.co) used within Terms of Service

**Data Protection & Privacy:**
- ⚠️ **GDPR Compliance:** Not immediately required (India-focused), but implementing data export/deletion features
- ✅ **User Consent:** Privacy Policy and Terms of Service implemented
- ✅ **Data Storage:** Personal data stored securely, encrypted in transit (HTTPS)
- 🔄 **PCI DSS Compliance:** Handled by Razorpay (we don't store card details)

**Business Regulations:**
- ⚠️ **GST Registration:** Required once revenue exceeds ₹20 lakhs/year
- ✅ **Payment Gateway KYC:** Razorpay handles merchant verification
- ✅ **Digital Platform:** No specific licensing required in India for service marketplace

**User-Generated Content:**
- ✅ DMCA takedown procedure in Terms of Service
- ✅ Content moderation system in admin panel
- ✅ User agreement requires ownership of uploaded content

**Legal Verdict:** ✅ **Legally Feasible** - No major legal blockers. Privacy policy and Terms of Service in place. Future considerations: GST registration when revenue threshold reached.

---

### Overall Feasibility Conclusion

| Feasibility Type | Rating | Notes |
|------------------|--------|-------|
| Technical | ✅ **High** | All technologies proven, team has experience |
| Economic | ✅ **High** | Low costs, multiple revenue streams, achievable break-even |
| Operational | ✅ **High** | Manageable operations, good scalability |
| Schedule | ✅ **High** | Realistic 14-week timeline with buffer |
| Legal | ✅ **Medium-High** | Compliant, minor future considerations |

**Overall Verdict:** ✅ **PROJECT IS FEASIBLE** - All dimensions show positive feasibility. Recommended to proceed with development.

---

## 2.2 Objectives of Proposed System

### Primary Objectives

#### 1. Establish Trust and Credibility
**Problem:** Customers cannot verify artisan quality; artisans cannot prove their expertise.

**Solution:**
- Verified review system with "Verified Purchase" badges
- Portfolio showcasing before/after work
- Star ratings with review count transparency
- Public booking history (privacy-safe)
- Certification and skill badge display

**Success Metric:** 80%+ of bookings made with artisans having 3+ verified reviews

---

#### 2. Simplify Discovery Process
**Problem:** Customers spend hours finding and contacting multiple artisans manually.

**Solution:**
- Sub-50ms search response time (Algolia)
- Location-based filtering and sorting (geo-search)
- Category-based browsing (20+ artisan categories)
- Filter by rating, price range, availability
- Personalized recommendations based on past bookings

**Success Metric:** Average time from search to booking < 5 minutes

---

#### 3. Provide End-to-End Booking Experience
**Problem:** Fragmented experience - find on one platform, call to book, pay in cash, no records.

**Solution:**
- **Discovery:** Search and compare artisans
- **Consultation:** Chat or video call before booking
- **Booking:** Calendar-based slot selection
- **Payment:** Secure online payment with receipt
- **Communication:** Built-in chat for coordination
- **Reviews:** Post-service feedback system
- **Records:** Complete booking history with invoices

**Success Metric:** 90%+ of bookings completed entirely within platform (no external coordination needed)

---

#### 4. Empower Artisans with Business Tools
**Problem:** Artisans lack digital skills and tools to manage their business online.

**Solution:**
- **Dashboard:** Overview of earnings, bookings, reviews
- **Calendar:** Visual representation of upcoming bookings
- **Analytics:** Booking trends, revenue projections, customer insights
- **Portfolio Management:** Easy upload and organization of work samples
- **Customer Management:** Track repeat customers, add notes
- **Financial Tools:** Track earnings, withdrawal history, tax reports

**Success Metric:** Artisans spend < 15 minutes/day managing their KalaSetu presence

---

#### 5. Ensure Secure and Transparent Transactions
**Problem:** No payment records, disputes hard to resolve, no refund mechanism.

**Solution:**
- **Payment Gateway:** Razorpay integration (UPI, cards, net banking, wallets)
- **Escrow-like System:** Payment held until service completion (future enhancement)
- **Invoicing:** Automated PDF invoice generation with GST breakdown
- **Refund System:** Full and partial refunds with tracking
- **Dispute Handling:** Chat history and booking records for resolution
- **Transaction History:** Complete payment records for both parties

**Success Metric:** 0% payment-related security incidents, < 2% dispute rate

---

### This Semester's Specific Objectives

#### Objective 1: Eliminate Critical Security Vulnerabilities
**Target:** Fix all 6 critical-priority security issues identified in testing
- ✅ XSS vulnerability in search results (CVE-level issue)
- ✅ ReDoS vulnerability in regex search (DoS risk)
- ✅ Encrypt bank account details (data breach risk)
- ✅ Implement webhook idempotency (duplicate payment risk)
- ✅ Per-endpoint rate limiting (brute force risk)
- ✅ Content Security Policy headers (XSS prevention)

**Success Metric:** Pass security audit with zero critical/high vulnerabilities

---

#### Objective 2: Complete Core Feature Implementation
**Target:** Implement all incomplete features blocking user adoption

**Bookings System:**
- ✅ Functional bookings management page (currently blank stub)
- ✅ Artisan booking approval workflow
- ✅ Booking modification and rescheduling
- ✅ Cancellation with reason tracking
- ✅ Automated reminders (24h and 1h before booking)

**Payment System:**
- ✅ Full refund flow
- ✅ Partial refund support
- ✅ Dispute handling mechanism
- ✅ Withdrawal system for artisans
- ✅ PDF invoice generation

**Review System:**
- ✅ Verified purchase badges
- ✅ Photo/video reviews
- ✅ Artisan response capability
- ✅ Review moderation

**Success Metric:**
- Bookings page has 95%+ feature completeness
- Payment refund success rate > 99%
- 40%+ of reviews include photos

---

#### Objective 3: Improve Performance and User Experience
**Target:** Optimize slow operations and improve perceived performance

**Performance:**
- ✅ Fix N+1 query issues (dashboard load time < 1 second)
- ✅ Add database indexes (query response time < 100ms)
- ✅ Implement Redis caching (frequently accessed data)
- ✅ Code splitting (initial bundle size < 200 KB)

**UX:**
- ✅ Add loading skeletons (eliminate blank screens)
- ✅ Implement error boundaries (no white screen crashes)
- ✅ Add optimistic UI updates (instant feedback)
- ✅ Improve mobile responsiveness

**Success Metric:**
- Dashboard load time reduced from 3.5s to < 1s
- Lighthouse performance score > 90

---

#### Objective 4: Implement Business Monetization
**Target:** Enable revenue generation through multiple streams

**Artisan Subscriptions:**
- ✅ Free Tier (20% commission, basic features)
- ✅ Professional Tier (₹999/month, 15% commission, priority placement)
- ✅ Premium Tier (₹2,499/month, 10% commission, featured listings)

**Commission System:**
- ✅ Automated commission calculation on each booking
- ✅ Platform fee deduction before artisan payout
- ✅ Transparent fee breakdown in invoices

**Success Metric:**
- 5%+ of artisans upgrade to paid tiers within 3 months of launch
- Platform commission covers infrastructure costs within 6 months

---

#### Objective 5: Establish Testing Infrastructure
**Target:** Prevent regressions and ensure code quality

**Test Coverage:**
- ✅ Unit tests for utilities and helpers (80%+ coverage)
- ✅ Integration tests for auth flows (100% coverage)
- ✅ Integration tests for payment flows (100% coverage)
- ✅ E2E tests for critical user journeys (5 primary flows)
- ✅ Overall backend test coverage > 60%
- ✅ Overall frontend test coverage > 50%

**CI/CD:**
- ✅ Automated test runs on every commit
- ✅ Pre-merge test requirements
- ✅ Automated deployments on main branch

**Success Metric:**
- Zero critical bugs reach production after testing implementation
- Code coverage maintained above 60%

---

### Long-Term Vision Objectives

#### Market Position
**Goal:** Become the go-to platform for artisan services in India

**Target Metrics (Year 1):**
- 5,000+ registered artisans
- 20,000+ registered customers
- 50,000+ bookings completed
- ₹5 crore+ GMV (Gross Merchandise Value)

#### Social Impact
**Goal:** Empower traditional artisans economically through digital access

**Impact Metrics:**
- 30%+ increase in artisan income after joining platform
- 500+ artisans from rural areas onboarded
- 100+ women artisans economically empowered

#### Technology Leadership
**Goal:** Set standard for artisan marketplace platforms

**Technical Goals:**
- 99.9% uptime
- < 2 second page load times
- < 0.1% error rate
- Mobile app launch (React Native)

---

## 2.3 Users of System

The KalaSetu platform serves three distinct user types, each with specific roles and capabilities.

### 1. Artisans (Service Providers)

**Who They Are:**
- Traditional craftsmen and service providers
- Age range: 18-60 years
- Tech proficiency: Low to Medium
- Categories: Carpenters, Electricians, Plumbers, Painters, Mehendi Artists, Wedding Decorators, Tailors, etc.
- Location: Primarily tier-2 and tier-3 cities in India

**What They Can Do:**

**Registration & Profile:**
- ✅ Register with email/phone or Google/Facebook OAuth
- ✅ Create detailed profile with bio, skills, experience
- ✅ Add location (city, state, service area)
- ✅ Upload profile picture
- ✅ Add business hours and availability

**Service Management:**
- ✅ Create multiple service listings with pricing
- ✅ Add service descriptions, duration, pricing structure
- ✅ Set service categories and tags
- ✅ Enable/disable services
- ✅ Set custom pricing (fixed, hourly, per sq ft, etc.)

**Portfolio Management:**
- ✅ Upload work samples (images/videos)
- ✅ Organize portfolio by project
- ✅ Add before/after galleries
- ✅ Add project descriptions

**Booking Management:**
- ✅ View booking requests in dashboard
- ✅ Accept or reject booking requests with reasons
- ✅ View booking details and customer information
- ✅ Suggest alternative times for bookings
- ✅ Mark bookings as completed
- ✅ View booking history with filters

**Communication:**
- ✅ Chat with customers (Stream Chat)
- ✅ Conduct video consultations (Daily.co)
- ✅ Receive booking notifications (email + push)
- ✅ Respond to customer reviews

**Financial:**
- ✅ View earnings dashboard with analytics
- ✅ Track revenue by service type
- ✅ View commission breakdown
- ✅ Request withdrawals (once balance > ₹500)
- ✅ View withdrawal history
- ✅ Download invoices and tax reports
- ✅ Upgrade to Professional/Premium subscription

**Analytics (New This Semester):**
- 🆕 View booking trends over time
- 🆕 Customer demographics and insights
- 🆕 Popular services analytics
- 🆕 Revenue projections
- 🆕 Performance metrics (acceptance rate, response time)

**What They Cannot Do:**
- ❌ Delete their account without admin approval
- ❌ See other artisans' earnings or bookings
- ❌ Access customer payment information
- ❌ Modify completed booking records
- ❌ Access admin panel

---

### 2. Customers (Service Seekers)

**Who They Are:**
- Individuals or households needing artisan services
- Age range: 25-55 years (primary), 18-24 & 55+ (secondary)
- Tech proficiency: Medium to High
- Income: Middle class to upper-middle class
- Location: Urban and semi-urban areas across India

**What They Can Do:**

**Discovery:**
- ✅ Search artisans by name, skill, or keyword (Algolia)
- ✅ Filter by location, category, rating, price range
- ✅ Sort by rating, distance, price, availability
- ✅ View artisan profiles with portfolios
- ✅ Read reviews and ratings
- ✅ Save favorite artisans
- ✅ View recently viewed artisans

**Booking:**
- ✅ Browse artisan services with pricing
- ✅ Select service and preferred date/time
- ✅ Add booking notes and requirements
- ✅ Get instant booking confirmation or request approval
- ✅ View booking status (pending, confirmed, completed, cancelled)
- ✅ Request booking modifications
- ✅ Cancel bookings with reason
- ✅ View booking history

**Communication:**
- ✅ Chat with artisans before/after booking
- ✅ Schedule video consultations
- ✅ Receive booking updates (email + push notifications)
- ✅ Share location for home service bookings

**Payment:**
- ✅ Pay securely via Razorpay (UPI, Cards, Net Banking, Wallets)
- ✅ View payment history
- ✅ Download invoices
- ✅ Request refunds (for cancelled bookings)
- ✅ Track refund status

**Reviews:**
- ✅ Rate and review artisans after service completion
- ✅ Upload photos/videos with reviews (new)
- ✅ Edit reviews within 7 days
- ✅ View own review history

**Profile:**
- ✅ Manage profile (name, email, phone, address)
- ✅ Upload profile picture
- ✅ Manage saved addresses (for home services)
- ✅ View order history and statistics

**What They Cannot Do:**
- ❌ See other customers' personal information
- ❌ Contact artisans outside the platform (email/phone hidden)
- ❌ Book without payment (no cash-on-completion option currently)
- ❌ Delete reviews (can only edit)
- ❌ Access artisan dashboard or admin panel

---

### 3. Administrators (Platform Managers)

**Who They Are:**
- Platform team members responsible for operations
- Age range: 22-35 years
- Tech proficiency: High
- Role: Content moderation, user support, platform monitoring

**What They Can Do:**

**User Management:**
- ✅ View all users and artisans
- ✅ Search and filter users
- ✅ View user profiles and activity history
- ✅ Suspend/ban users for policy violations
- ✅ Delete accounts (with confirmation)
- ✅ Verify artisan profiles manually

**Content Moderation:**
- ✅ Review flagged artisan profiles
- ✅ Review flagged reviews
- ✅ Approve/reject portfolio images
- ✅ Moderate inappropriate content
- ✅ Handle DMCA takedown requests

**Booking & Payment Management:**
- ✅ View all bookings across platform
- ✅ View booking details and history
- ✅ Monitor payment transactions
- ✅ Process refund requests manually (if automated fails)
- ✅ Handle dispute resolution
- ✅ View payment gateway webhooks and logs

**Analytics Dashboard:**
- ✅ Platform-wide statistics (users, artisans, bookings, revenue)
- ✅ Growth charts (daily, weekly, monthly)
- ✅ Geographic heat maps (where bookings happen)
- ✅ Category performance analysis
- ✅ Revenue breakdown by category and commission
- ✅ Top performing artisans
- ✅ Customer satisfaction metrics

**System Management:**
- ✅ Manage categories and subcategories
- ✅ Send bulk notifications to users
- ✅ View system logs and error reports (Sentry integration)
- ✅ Monitor API performance (response times, error rates)
- ✅ Configure platform settings (commission rates, fees)
- ✅ Manage feature flags (enable/disable features)

**Support:**
- ✅ View and respond to contact form submissions
- ✅ Handle customer support tickets
- ✅ Send manual email notifications
- ✅ Access chat histories for dispute resolution

**What They Cannot Do:**
- ❌ See user passwords (stored as bcrypt hashes)
- ❌ Impersonate users or artisans
- ❌ Modify completed financial transactions
- ❌ Access Razorpay funds directly (requires Razorpay dashboard)

---

### User Interaction Flow

```
CUSTOMER JOURNEY:
1. Sign up / Log in
2. Search for artisan (by skill, location, etc.)
3. View artisan profile, portfolio, reviews
4. (Optional) Chat or video call with artisan
5. Select service and create booking
6. Make payment via Razorpay
7. Receive confirmation
8. (Day of service) Coordinate via chat
9. Service delivered
10. Rate and review artisan
11. Repeat or find new artisan

ARTISAN JOURNEY:
1. Sign up / Log in
2. Complete profile (bio, skills, portfolio)
3. Add services with pricing
4. Wait for booking requests
5. Receive notification → Review request
6. Accept or reject booking
7. (Day of service) Coordinate via chat
8. Mark service as completed
9. Receive payment (minus commission)
10. Request withdrawal when balance ≥ ₹500
11. Respond to customer review

ADMIN JOURNEY:
1. Log in to admin panel
2. Monitor dashboard (new bookings, revenue, issues)
3. Review flagged content
4. Handle support tickets
5. Verify new artisan profiles
6. Process manual refunds (if needed)
7. Send bulk notifications/announcements
8. Generate reports for analysis
```

---

# 3. ANALYSIS AND DESIGN

## 3.1 System Requirements (Functional and Non-Functional Requirements)

### Functional Requirements

#### FR1: User Authentication and Authorization

**FR1.1: Registration**
- System shall allow users to register using email and password
- System shall allow users to register using Google OAuth
- System shall allow users to register using Facebook OAuth
- System shall allow artisans to register with additional business details
- System shall send email verification link upon registration
- System shall validate email format and password strength (minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)

**FR1.2: Login**
- System shall authenticate users using email/phone and password
- System shall authenticate users using OAuth providers (Google, Facebook)
- System shall create JWT token upon successful authentication
- System shall store JWT in HTTP-only cookie
- System shall maintain user session for 7 days

**FR1.3: Password Management**
- System shall allow users to reset forgotten passwords via email link
- System shall allow users to change password when logged in
- System shall validate old password before updating to new password
- Password reset links shall expire after 1 hour

**FR1.4: Authorization**
- System shall protect routes requiring authentication with middleware
- System shall differentiate between user and artisan accounts
- System shall prevent unauthorized access to admin panel
- System shall verify user identity before sensitive operations (payments, profile updates)

---

#### FR2: Artisan Profile Management

**FR2.1: Profile Creation**
- System shall allow artisans to create detailed profiles with:
  - Full name, email, phone number
  - Bio/description (max 500 characters)
  - Skills/specializations (multi-select tags)
  - Years of experience
  - Service area (city, state, radius)
  - Business hours
  - Profile picture
- System shall validate all required fields before saving
- System shall prevent duplicate email registrations

**FR2.2: Portfolio Management**
- System shall allow artisans to upload up to 20 portfolio images
- System shall allow artisans to upload up to 5 portfolio videos (max 50MB each)
- System shall organize portfolio items by project
- System shall allow adding project descriptions
- System shall support before/after image pairs
- System shall automatically optimize images via Cloudinary

**FR2.3: Service Listings**
- System shall allow artisans to create multiple service listings
- Each service shall include:
  - Service name and description
  - Category and subcategory
  - Pricing type (fixed, hourly, per sq ft, custom quote)
  - Price amount
  - Duration estimate
  - Availability status (active/inactive)
- System shall allow editing and deleting services
- System shall display services on artisan's public profile

**FR2.4: Availability Management**
- System shall allow artisans to set weekly working hours
- System shall allow marking specific dates as unavailable (holidays)
- System shall allow setting buffer time between bookings
- System shall display availability calendar to customers

---

#### FR3: Search and Discovery

**FR3.1: Artisan Search (Algolia)**
- System shall provide instant search-as-you-type functionality
- System shall search across artisan names, skills, and bio
- System shall support typo tolerance (finds results with misspellings)
- System shall highlight search terms in results
- System shall return results within 100ms

**FR3.2: Filtering**
- System shall allow filtering by:
  - Category/subcategory
  - Location (city, distance radius)
  - Price range (min/max)
  - Rating (minimum stars)
  - Availability (available today, this week, etc.)
- System shall support multi-select filters
- System shall update results instantly when filters change

**FR3.3: Sorting**
- System shall allow sorting by:
  - Relevance (default)
  - Rating (high to low)
  - Price (low to high, high to low)
  - Distance (nearest first)
  - Number of reviews (most reviewed)
- System shall remember user's sort preference within session

**FR3.4: Search Analytics**
- System shall log all search queries for analytics
- System shall track no-result searches for improvement
- System shall provide search suggestions based on popular queries

---

#### FR4: Booking System

**FR4.1: Booking Creation**
- System shall allow customers to create bookings with:
  - Selected artisan and service
  - Preferred date and time
  - Service location (customer address or artisan's workshop)
  - Special requirements/notes (optional)
- System shall check artisan availability before confirming
- System shall calculate total price including taxes and platform fee
- System shall create unique booking ID

**FR4.2: Booking Approval Workflow (New This Semester)**
- System shall notify artisan of new booking request
- System shall allow artisan to accept or reject within 24 hours
- System shall allow artisan to suggest alternative date/time
- System shall notify customer of artisan's response
- System shall automatically cancel if artisan doesn't respond within 24 hours

**FR4.3: Booking Management**
- System shall allow viewing booking details (date, time, status, artisan/customer info)
- System shall allow customers to request booking modification
- System shall allow artisans to accept/reject modification requests
- System shall allow cancellation by either party with reason
- System shall enforce cancellation policy (e.g., free cancellation 24h before)

**FR4.4: Booking Status Tracking**
- System shall support booking statuses:
  - `pending` - Waiting for artisan approval
  - `confirmed` - Artisan accepted
  - `completed` - Service delivered
  - `cancelled` - Cancelled by either party
  - `disputed` - Issue raised
- System shall send status update notifications via email and push

**FR4.5: Booking Reminders (New This Semester)**
- System shall send reminder to customer 24 hours before booking
- System shall send reminder to customer 1 hour before booking
- System shall send reminder to artisan 2 hours before booking

---

#### FR5: Payment System

**FR5.1: Payment Processing**
- System shall integrate Razorpay for payment processing
- System shall support payment methods:
  - UPI (GPay, PhonePe, etc.)
  - Credit/Debit Cards
  - Net Banking
  - Wallets (Paytm, Mobikwik, etc.)
- System shall create Razorpay order with booking details
- System shall verify payment signature before confirming
- System shall store payment transaction details

**FR5.2: Payment Webhooks**
- System shall listen for Razorpay webhook events
- System shall verify webhook signature for authenticity
- System shall update booking and payment status based on webhook
- System shall implement idempotency checks (prevent duplicate processing)
- System shall retry failed webhook processing

**FR5.3: Refund System (New This Semester)**
- System shall allow full refunds for cancellations > 24h before booking
- System shall allow partial refunds for cancellations < 24h before booking
- System shall process refunds via Razorpay Refund API
- System shall notify both parties of refund status
- System shall update payment record with refund details
- Refunds shall be processed to original payment method

**FR5.4: Artisan Payouts (New This Semester)**
- System shall calculate artisan earnings after each completed booking
- System shall deduct platform commission (10-20% based on subscription)
- System shall maintain artisan balance in database
- System shall allow withdrawal requests when balance ≥ ₹500
- System shall process withdrawals via Razorpay Payout API
- System shall require KYC verification for first withdrawal

**FR5.5: Invoicing (New This Semester)**
- System shall generate PDF invoices for each transaction
- Invoice shall include:
  - Booking details (service, date, time)
  - Pricing breakdown (base price, taxes, platform fee)
  - Customer and artisan information
  - Payment method and transaction ID
  - Terms and conditions
- System shall send invoice via email automatically
- System shall allow downloading invoices from dashboard

---

#### FR6: Communication System

**FR6.1: Real-time Chat (Stream Chat)**
- System shall create chat channel when booking is confirmed
- System shall allow text messaging between customer and artisan
- System shall support image sharing in chat
- System shall support file attachments (max 10MB)
- System shall show read receipts
- System shall show typing indicators
- System shall store chat history permanently

**FR6.2: Video Consultations (Daily.co)**
- System shall allow scheduling video calls
- System shall generate unique video call room for each session
- System shall support video, audio, and screen sharing
- System shall allow call recording (with consent)
- System shall limit call duration to 60 minutes for free tier artisans
- System shall show call history

**FR6.3: Notifications (OneSignal)**
- System shall send push notifications for:
  - New booking requests
  - Booking status changes
  - New messages
  - Payment confirmations
  - Review reminders
- System shall send email notifications as fallback
- System shall allow users to manage notification preferences

---

#### FR7: Review and Rating System

**FR7.1: Review Submission**
- System shall allow customers to review after booking completion
- Review shall include:
  - Star rating (1-5 stars)
  - Written review (optional, max 500 characters)
  - Photo/video upload (optional, new this semester)
- System shall show "Verified Purchase" badge on review
- System shall allow editing review within 7 days of submission

**FR7.2: Artisan Response (New This Semester)**
- System shall allow artisans to respond to reviews
- Response limited to 300 characters
- Response shall be publicly visible below review
- One response allowed per review

**FR7.3: Review Display**
- System shall display reviews on artisan profile page
- System shall calculate and display average rating
- System shall sort reviews by date (newest first) or rating
- System shall allow filtering reviews by star rating
- System shall show reviewer name, date, and verified badge

**FR7.4: Review Moderation**
- System shall allow flagging inappropriate reviews
- Flagged reviews shall appear in admin moderation queue
- Admin can hide or delete reviews after verification

---

#### FR8: Admin Panel

**FR8.1: Dashboard**
- System shall display key metrics:
  - Total users, artisans, bookings
  - Revenue (today, this week, this month)
  - New registrations
  - Active bookings
- System shall display charts for growth trends
- System shall show recent activity feed

**FR8.2: User Management**
- System shall list all users with search and filter
- System shall display user details and activity history
- System shall allow suspending/banning users
- System shall allow deleting accounts

**FR8.3: Artisan Management**
- System shall list all artisans with verification status
- System shall allow manual profile verification
- System shall display artisan earnings and booking stats
- System shall allow promoting featured artisans

**FR8.4: Booking Management**
- System shall list all bookings with filters (status, date, amount)
- System shall display booking details
- System shall allow admin to cancel bookings with refund
- System shall handle dispute resolution

**FR8.5: Payment Management**
- System shall display all transactions
- System shall show payment gateway logs
- System shall allow processing manual refunds
- System shall generate financial reports

**FR8.6: Content Management**
- System shall allow managing categories and subcategories
- System shall allow moderating flagged content
- System shall allow sending bulk notifications

---

### Non-Functional Requirements

#### NFR1: Performance

**NFR1.1: Response Time**
- API response time shall be < 200ms for 95% of requests (p95)
- Search results shall appear within 100ms
- Page load time shall be < 2 seconds on 4G connection
- Database queries shall execute in < 100ms (after optimization this semester)

**NFR1.2: Throughput**
- System shall handle 1000 concurrent users
- System shall handle 100 bookings per minute
- System shall handle 500 search queries per second

**NFR1.3: Scalability**
- System shall scale horizontally by adding server instances
- Database shall support sharding for future growth
- System shall use CDN for static assets

---

#### NFR2: Security

**NFR2.1: Data Protection**
- All data in transit shall be encrypted using HTTPS (TLS 1.3)
- Passwords shall be hashed using bcrypt (10 salt rounds)
- Sensitive data (bank details) shall be encrypted at rest (new this semester)
- JWT tokens shall be stored in HTTP-only cookies

**NFR2.2: Authentication**
- JWT tokens shall expire after 7 days
- Password reset links shall expire after 1 hour
- Failed login attempts shall be rate-limited (5 attempts per 15 minutes)

**NFR2.3: Input Validation**
- All user input shall be validated on both client and server
- HTML/script tags shall be sanitized to prevent XSS (new this semester)
- Regex patterns shall be escaped to prevent ReDoS (new this semester)
- MongoDB queries shall be sanitized to prevent NoSQL injection

**NFR2.4: Payment Security**
- Payment details shall never be stored on our servers (handled by Razorpay)
- Webhook signatures shall be verified before processing
- Idempotency keys shall prevent duplicate payment processing (new this semester)
- PCI DSS compliance maintained via Razorpay

---

#### NFR3: Reliability

**NFR3.1: Availability**
- System uptime shall be > 99.5% (< 3.5 hours downtime per month)
- System shall have automated health checks every 5 minutes
- System shall automatically restart on crashes

**NFR3.2: Data Integrity**
- Database shall have automated daily backups
- Critical data (bookings, payments) shall have point-in-time recovery
- Failed transactions shall be logged for manual review

**NFR3.3: Error Handling**
- System shall catch and log all errors (Sentry integration)
- User-facing errors shall display helpful messages
- System shall implement error boundaries to prevent full app crashes (new this semester)
- Background jobs shall retry failed tasks 3 times before alerting

---

#### NFR4: Usability

**NFR4.1: User Interface**
- Interface shall be responsive (mobile, tablet, desktop)
- Interface shall follow consistent design system (new this semester)
- Loading states shall be shown during async operations
- Empty states shall guide users on next actions

**NFR4.2: Accessibility**
- System shall meet WCAG 2.1 Level AA standards (future goal)
- Color contrast ratio shall be > 4.5:1 for text
- All interactive elements shall be keyboard accessible
- Screen reader support for key user journeys

**NFR4.3: Browser Support**
- System shall support Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- System shall degrade gracefully on unsupported browsers

---

#### NFR5: Maintainability

**NFR5.1: Code Quality**
- Code shall follow ESLint rules
- Components shall not exceed 300 lines (refactor if larger)
- All React components shall have PropTypes validation (new this semester)
- Test coverage shall be > 60% for backend, > 50% for frontend (new this semester)

**NFR5.2: Documentation**
- API endpoints shall be documented with Swagger/OpenAPI
- Code shall have inline comments for complex logic
- README shall include setup and deployment instructions

**NFR5.3: Monitoring**
- System shall log all errors to Sentry
- System shall track user actions with PostHog
- System shall record critical user sessions with LogRocket
- System shall alert team on critical errors (>100 errors/hour)

---

#### NFR6: Compliance

**NFR6.1: Data Privacy**
- System shall have privacy policy and terms of service
- Users shall be able to export their data (GDPR-like)
- Users shall be able to request account deletion
- System shall not share user data with third parties without consent

**NFR6.2: Legal**
- Platform shall comply with Indian IT Act 2000
- Payment processing shall comply with RBI guidelines
- System shall have DMCA takedown procedure

---

## 3.2 Module Hierarchy Diagram

### Diagram Specification for Creation

**Title:** KalaSetu - Module Hierarchy Diagram

**Instructions for Creating Diagram:**
Use PowerPoint, Draw.io, or Lucidchart to create a diagram with the following structure:

**Central Hub:**
- Large blue oval in center: **"KalaSetu Platform"**

**Primary Modules (surrounding central hub):**
These connect directly to the central hub with lines.

1. **Authentication & Authorization** (Dark Red/Maroon oval)
   - Registration
   - Login (Email/OAuth)
   - JWT Management
   - Password Reset

2. **User Management** (Orange oval)
   - User Profiles
   - Artisan Profiles
   - Profile Editor
   - Portfolio Management

3. **Search & Discovery** (Purple oval)
   - Algolia Search
   - Filters & Sorting
   - Category Browsing
   - Location-based Search

4. **Booking System** (Green oval) - **ENHANCED THIS SEMESTER**
   - Booking Creation
   - ✨ Approval Workflow (NEW)
   - ✨ Modification/Rescheduling (NEW)
   - ✨ Cancellation System (NEW)
   - ✨ Automated Reminders (NEW)
   - Booking History

5. **Payment System** (Blue oval) - **ENHANCED THIS SEMESTER**
   - Razorpay Integration
   - Payment Processing
   - ✨ Refund System (NEW)
   - ✨ Withdrawal/Payout (NEW)
   - ✨ Invoice Generation (NEW)
   - Transaction History

6. **Communication** (Light Blue oval)
   - Stream Chat Integration
   - Daily.co Video Calls
   - OneSignal Push Notifications
   - Email Notifications

7. **Review & Rating** (Yellow oval) - **ENHANCED THIS SEMESTER**
   - Review Submission
   - ✨ Photo/Video Reviews (NEW)
   - ✨ Artisan Response (NEW)
   - Rating Calculation
   - Review Moderation

8. **Admin Panel** (Pink oval)
   - Dashboard Analytics
   - User Management
   - Content Moderation
   - Payment Management
   - System Configuration

9. **✨ Subscription System** (Light Green oval) - **NEW THIS SEMESTER**
   - ✨ Free Tier
   - ✨ Professional Tier
   - ✨ Premium Tier
   - ✨ Commission Calculation

10. **✨ Analytics & Insights** (Teal oval) - **NEW THIS SEMESTER**
    - ✨ Artisan Dashboard
    - ✨ Earnings Analytics
    - ✨ Booking Trends
    - ✨ Customer Insights

**Secondary Modules (smaller ovals connecting to primary modules):**

Connected to **Authentication**:
- Firebase Auth
- JWT Tokens
- Bcrypt Hashing

Connected to **Search & Discovery**:
- Algolia Index
- Geo-location API
- Search Analytics

Connected to **Payment System**:
- Razorpay SDK
- Webhook Handler
- PDF Generator (NEW)

Connected to **Communication**:
- Stream Chat API
- Daily.co API
- Email Service (Nodemailer)

**Color Coding:**
- **Existing modules from last semester:** Regular color saturation
- **✨ NEW/Enhanced modules this semester:** Brighter colors with "✨ NEW" label
- **Third-party integrations:** Dashed borders

**Layout:**
```
         [Auth]       [User Mgmt]      [Search]
              \           |           /
               \          |          /
                \         |         /
                 [KalaSetu Platform]  ←  CENTER
                /         |         \
               /          |          \
              /           |           \
       [Booking]   [Payment]    [Communication]
         (NEW)       (NEW)

    [Review]   [Admin]   [Subscription]   [Analytics]
     (NEW)                  (NEW)           (NEW)
```

---

## 3.3 Sample Input and Output Screens

**Note for Document Creation:** Include actual screenshots from your application here. Below are descriptions of key screens to capture and include.

### Screen 1: Artisan Registration Page

**Purpose:** Allow new artisans to create account

**Input Elements:**
- Full Name (text input)
- Email Address (email input)
- Phone Number (tel input with country code)
- Password (password input with strength indicator)
- Confirm Password (password input)
- Skills/Specialization (multi-select dropdown)
- City (text input with autocomplete)
- Terms & Conditions checkbox
- "Register as Artisan" button

**Validation:**
- Email format validation
- Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- Phone number format validation
- Password match validation

**Output:**
- Success: Redirect to email verification page with message "Please verify your email"
- Error: Display error message below relevant field (e.g., "Email already registered")

**Screenshot Location:** `kalasetu-frontend/src/pages/RegisterPage.jsx`

---

### Screen 2: Artisan Search Results Page

**Purpose:** Display filtered artisan search results

**Input Elements:**
- Search bar (text input with search icon)
- Location filter (dropdown or geolocation button)
- Category filter (checkbox list)
- Price range filter (dual slider)
- Rating filter (star buttons, minimum 3★, 4★, 5★)
- Sort dropdown (Relevance, Rating, Distance, Price)

**Output Display:**
- **Artisan Cards (Grid Layout):**
  - Profile picture
  - Name and primary skill
  - Star rating with review count
  - Location (city) with distance
  - Starting price
  - "View Profile" button
  - (Optional) "Featured" badge

- **Top Section:**
  - Number of results found: "245 artisans found in Pune"
  - Active filters with remove (×) buttons
  - Clear all filters button

- **Bottom:**
  - Pagination or infinite scroll loader

**Edge Cases:**
- No results: Show empty state with "No artisans found. Try adjusting your filters."
- Loading: Show skeleton cards (6 placeholders)

**Screenshot Location:** `kalasetu-frontend/src/pages/SearchResults.jsx`

---

### Screen 3: Artisan Profile Page

**Purpose:** Showcase artisan's complete profile to potential customers

**Sections:**

**A. Header Section:**
- Profile picture (large, circular)
- Artisan name and title
- Star rating (e.g., 4.8 ★) with "245 reviews" link
- Location (city, state) with map icon
- "Chat" and "Book Now" buttons (prominent)
- ✅ "Verified Artisan" badge (if verified)
- 🌟 "Premium Member" badge (if subscribed)

**B. About Section:**
- Bio/description (max 500 chars)
- Years of experience
- Skills/specializations (tags)

**C. Services Section:**
- Service cards showing:
  - Service name
  - Description
  - Price (₹500/hour or ₹5000 fixed)
  - Duration estimate
  - "Book This Service" button

**D. Portfolio Section:**
- Image gallery (grid layout, 3-4 columns)
- Click to open lightbox view
- Project descriptions below images
- Before/After image pairs (if available)

**E. Reviews Section:**
- Average rating with breakdown (5★: 120, 4★: 80, 3★: 30, 2★: 10, 1★: 5)
- Sort dropdown (Newest, Highest Rated, Lowest Rated)
- Individual review cards:
  - Reviewer name and profile pic
  - Star rating and date
  - ✅ "Verified Purchase" badge
  - Review text
  - 📷 Photo attachments (if any)
  - Artisan response (if any, shown below review)
  - "Helpful" and "Report" buttons

**F. Availability Calendar (Optional):**
- Calendar showing available/booked dates
- Time slot picker

**Output Actions:**
- Click "Chat": Open chat interface
- Click "Book Now": Open booking modal
- Click portfolio image: Open image lightbox
- Click service "Book This Service": Pre-fill booking form with that service

**Screenshot Location:** `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx`

---

### Screen 4: Booking Creation Modal/Page (Enhanced This Semester)

**Purpose:** Allow customer to create booking with all details

**Input Elements:**

**Step 1: Service Selection**
- Dropdown or radio buttons showing artisan's services
- Selected service shows price and description

**Step 2: Date & Time Selection**
- Calendar date picker (shows availability, blocks past dates)
- Time slot dropdown (e.g., 9:00 AM, 10:00 AM, 2:00 PM)
- Shows artisan's working hours

**Step 3: Location**
- Radio buttons:
  - "At artisan's workshop" (shows address)
  - "At my location" (show address input + map)
- Full address input (street, city, pincode)
- Google Maps integration for location picking

**Step 4: Additional Details**
- "Special Requirements" text area (optional, max 500 chars)
- Example: "Need to complete by evening" or "Materials should be eco-friendly"

**Step 5: Booking Summary**
- Service name and description
- Date and time
- Location
- Pricing breakdown:
  - Service price: ₹1,000
  - Taxes (18% GST): ₹180
  - Platform fee (5%): ₹50
  - **Total: ₹1,230**

**Action Buttons:**
- "Request Booking" (if artisan requires approval)
- "Confirm & Pay" (if instant booking enabled)
- "Cancel" button

**Output:**
- Success: Redirect to payment page or show "Booking request sent" message
- Error: Show validation errors (e.g., "Please select a date")

**New This Semester:**
- Shows "⏳ Artisan will respond within 24 hours" if approval required
- Shows alternative date suggestions from artisan (if artisan suggests)

**Screenshot Location:** `kalasetu-frontend/src/components/booking/BookingModal.jsx`

---

### Screen 5: Artisan Dashboard - Bookings Tab (New/Enhanced This Semester)

**Purpose:** Allow artisans to manage incoming and existing bookings

**Layout:**

**Header:**
- Tab navigation: "Pending Requests (5)" | "Upcoming (12)" | "Completed (140)" | "Cancelled (8)"

**Pending Requests Tab:**

Each booking request card shows:
- Customer name and profile pic
- Service requested
- Requested date and time
- Location
- Special requirements (if any)
- Price breakdown
- Time remaining to respond: "⏳ 18 hours left to respond"

**Action Buttons:**
- ✅ "Accept" button (green)
- ❌ "Reject with reason" button (red)
- 📅 "Suggest Alternative" button (blue)

**Alternative Date Modal** (if clicked "Suggest Alternative"):
- Calendar picker
- Time picker
- Message to customer (optional)
- "Send Suggestion" button

**Upcoming Tab:**

Each confirmed booking card shows:
- Customer name, photo, contact button
- Service details
- Date, time, location
- Days remaining: "🗓️ 3 days from now"
- "View Details" button
- "Chat with Customer" button
- "Mark as Completed" button (visible only on/after booking date)

**Completed Tab:**

Each completed booking card shows:
- Customer name and service
- Date completed
- Amount earned (after commission)
- Customer rating and review (if given)
- "View Invoice" button

**Cancelled Tab:**

Each cancelled booking shows:
- Service and date
- Cancelled by: Customer/Artisan
- Cancellation reason
- Refund status (if applicable)
- Date cancelled

**Filters:**
- Search by customer name
- Filter by service type
- Date range picker

**Output Actions:**
- Accept booking: Show success toast, send notification to customer, move to "Upcoming"
- Reject booking: Show reason input modal, notify customer, move to "Cancelled"
- Suggest alternative: Send notification to customer with suggested time
- Mark as completed: Prompt for confirmation, update status, trigger review request to customer

**New This Semester:**
- ✨ This entire page was a blank stub last semester - now fully functional
- ✨ Approval workflow implemented
- ✨ Alternative date suggestion feature
- ✨ Automated reminders sent to artisan

**Screenshot Location:** `kalasetu-frontend/src/pages/dashboard/artisan/Bookings.jsx`

---

### Screen 6: Payment Page (Razorpay Integration)

**Purpose:** Secure payment processing

**Layout:**

**Left Section: Order Summary**
- Service name and description
- Artisan name and profile pic
- Date and time of service
- Location
- **Price Breakdown:**
  - Service charge: ₹1,000
  - GST (18%): ₹180
  - Platform fee (5%): ₹50
  - **Total Amount: ₹1,230**

**Right Section: Payment Gateway (Razorpay Modal)**
- Shows Razorpay checkout modal with:
  - UPI (GPay, PhonePe, Paytm, etc.)
  - Credit/Debit Cards
  - Net Banking
  - Wallets

**After Payment Success:**
- Show success animation (checkmark)
- Display confirmation message: "Booking Confirmed! 🎉"
- Show booking ID
- "View Booking Details" button
- "Download Invoice" button (NEW this semester)

**After Payment Failure:**
- Show error message: "Payment Failed"
- Reason (if available from Razorpay)
- "Retry Payment" button
- "Contact Support" button

**New This Semester:**
- ✨ Automatic invoice generation and email
- ✨ Payment status tracked in real-time via webhooks

**Screenshot Location:** `kalasetu-frontend/src/components/payment/PaymentButton.jsx` (triggers Razorpay)

---

### Screen 7: Artisan Earnings Dashboard (New This Semester)

**Purpose:** Show artisan's financial analytics and insights

**Layout:**

**Top Section: Key Metrics (Cards)**
- **This Month's Earnings:** ₹42,500 (↑ 15% from last month)
- **Available Balance:** ₹12,300 ("Withdraw" button if balance ≥ ₹500)
- **Total Withdrawn:** ₹1,50,000
- **Pending Settlements:** ₹5,200 (from recent bookings, will be available in 3 days)

**Charts Section:**

**A. Earnings Chart (Line/Bar Chart)**
- X-axis: Months (Jan, Feb, Mar, Apr, May, Jun)
- Y-axis: Earnings (₹)
- Show trend line
- Toggle between: "6 months" | "1 year" | "All time"

**B. Bookings by Service (Pie Chart)**
- Each slice represents a service type
- Shows percentage and count
- Example: Carpentry (45%), Painting (30%), Repairs (25%)

**C. Revenue Breakdown (Donut Chart)**
- Service charges: ₹1,00,000 (85%)
- Platform commission deducted: ₹15,000 (15%)
- Net earnings: ₹85,000

**Table Section: Recent Transactions**

| Date | Booking ID | Service | Amount | Commission | Net Earnings | Status |
|------|------------|---------|--------|------------|--------------|--------|
| May 15, 2025 | #BK1234 | Room Painting | ₹5,000 | ₹750 (15%) | ₹4,250 | ✅ Settled |
| May 14, 2025 | #BK1233 | Furniture Repair | ₹1,500 | ₹225 (15%) | ₹1,275 | ⏳ Pending |
| May 12, 2025 | #BK1232 | Cabinet Making | ₹8,000 | ₹1,200 (15%) | ₹6,800 | ✅ Settled |

**Withdrawal Section:**
- Current balance: ₹12,300
- Minimum withdrawal: ₹500
- "Withdraw Funds" button (prominent)
- Shows bank account on file (masked): "HDFC Bank ****1234"
- "Update Bank Details" link

**Withdrawal Modal** (when button clicked):
- Amount input (max: available balance)
- Bank account dropdown (if multiple accounts)
- Confirmation: "Amount will be credited within 1-2 business days"
- "Confirm Withdrawal" button

**New This Semester:**
- ✨ Entire analytics dashboard with charts
- ✨ Withdrawal system implementation
- ✨ Detailed transaction history

**Screenshot Location:** `kalasetu-frontend/src/pages/dashboard/artisan/EarningsTab.jsx`

---

### Screen 8: Review Submission Form (Enhanced This Semester)

**Purpose:** Allow customers to leave detailed reviews after service

**Layout:**

**Header:**
- "How was your experience with [Artisan Name]?"
- Service name and date

**Rating Section:**
- 5 large stars (clickable, highlight on hover)
- Shows rating label below: "Outstanding!" (5★), "Great!" (4★), etc.

**Written Review:**
- Text area (optional)
- Placeholder: "Tell us about your experience..."
- Character counter: 0/500

**📷 Photo/Video Upload (New This Semester):**
- "Add Photos" button
- Shows thumbnails of uploaded images
- Max 5 photos, 10MB each
- Optional: "Add Video" (max 50MB, 30 seconds)

**Specific Ratings (Optional):**
- Quality of Work: ★★★★★
- Professionalism: ★★★★★
- Value for Money: ★★★★★
- Timeliness: ★★★★★

**Checkboxes:**
- ☑️ "I recommend this artisan"
- ☑️ "I agree to public display of this review"

**Action Buttons:**
- "Submit Review" (blue, prominent)
- "Skip for Now" (text link)

**Output:**
- Success: Show thank you message, "Your review helps others make better decisions"
- Redirect to booking history
- Send notification to artisan about new review

**New This Semester:**
- ✨ Photo/video review support
- ✨ Verified purchase badge automatically added
- ✨ Review appears on artisan profile immediately

**Screenshot Location:** `kalasetu-frontend/src/components/review/ReviewForm.jsx`

---

### Screen 9: Admin Dashboard - Analytics Overview

**Purpose:** Platform-wide metrics for admins

**Top Section: Key Metrics (Cards)**
- Total Users: 12,450 (↑ 8% this week)
- Total Artisans: 3,200 (↑ 5% this week)
- Total Bookings: 45,678 (↑ 12% this month)
- Revenue This Month: ₹12,50,000 (↑ 18%)

**Charts:**

**A. Growth Chart (Line Chart)**
- Shows user and artisan growth over time
- X-axis: Months
- Y-axis: Count
- Two lines: Users (blue), Artisans (orange)

**B. Booking Status Breakdown (Donut Chart)**
- Completed: 65%
- Upcoming: 20%
- Pending: 10%
- Cancelled: 5%

**C. Revenue by Category (Bar Chart)**
- X-axis: Categories (Carpentry, Plumbing, Electrical, etc.)
- Y-axis: Revenue (₹)

**D. Geographic Heat Map**
- Map of India showing booking density by state
- Darker colors = more bookings
- Top 5 cities listed below:
  1. Pune: 12,500 bookings
  2. Mumbai: 10,200 bookings
  3. Bangalore: 8,900 bookings
  4. Delhi: 7,600 bookings
  5. Chennai: 5,400 bookings

**Recent Activity Feed:**
- Live feed of recent events:
  - "New artisan registered: Rajesh Kumar (Carpenter, Pune)"
  - "Booking #BK12345 completed"
  - "Payment received: ₹2,500"
  - "Review submitted for Artisan #ART789"

**Quick Actions:**
- "View Pending Verifications (15)"
- "View Flagged Content (3)"
- "Send Bulk Notification"

**Screenshot Location:** `kalasetu-frontend/src/pages/admin/AdminDashboard.jsx`

---

**Note:** For actual synopsis document, replace these descriptions with real screenshots from your application. Take high-quality screenshots (1920x1080) and crop relevant sections.

---

## 3.4 Database

### Database Management System: MongoDB 7.x

MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents. We chose MongoDB for:
- **Flexible Schema:** Allows easy modification of data structure as requirements evolve
- **Scalability:** Horizontal scaling with sharding for future growth
- **Performance:** Fast read/write operations with indexing
- **Developer Productivity:** Natural mapping to JavaScript objects
- **Atlas Cloud:** Managed service with automatic backups and monitoring

### Database Architecture

**Deployment:** MongoDB Atlas (Cloud)
**Cluster Configuration:** M2 tier (2 GB RAM, 10 GB storage) for production
**Backup Strategy:** Automated daily backups with point-in-time recovery
**Replication:** 3-node replica set for high availability

---

### Entity Relationship Overview

The KalaSetu database consists of 13 primary collections (models). Here's the relationship map:

```
User (Customer) ─┬─── Booking ──── Artisan
                 │         │
                 │         ├─── Payment
                 │         └─── Review
                 │
                 ├─── Notification
                 └─── (chat via Stream Chat)

Artisan ─────────┬─── ArtisanService
                 ├─── Portfolio (embedded in Artisan)
                 ├─── Availability
                 ├─── Booking
                 ├─── Review (received)
                 └─── Payment (received)

Category ──── ArtisanService
              (many-to-many via category field)

Admin ─────── (manages all entities)

CallHistory ── Booking (related)
OTP ───────── User/Artisan (verification)
```

---

### Collection Schemas

#### 1. User Model
**Collection Name:** `users`
**Purpose:** Store customer account information

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **fullName** (String): Customer's full name. Required, 2-50 characters.
- **email** (String): Email address. Required, unique, validated.
- **phone** (String): Phone number. Optional, 10 digits.
- **password** (String): Hashed password. Required, bcrypt hashed.
- **profilePicture** (String): Cloudinary URL. Optional.
- **address** (Object): Embedded address. Optional.
  - **street** (String): Street address.
  - **city** (String): City.
  - **state** (String): State.
  - **pincode** (String): PIN code. 6 digits.
- **role** (String): User role. Default: "user".
- **isVerified** (Boolean): Email verification status. Default: false.
- **firebaseUID** (String): Firebase user ID for OAuth. Optional, unique.
- **favoriteArtisans** ([ObjectId]): Array of artisan IDs. References Artisan model.
- **savedAddresses** ([Object]): Multiple addresses for home services.
- **createdAt** (Date): Registration date. Auto-generated.
- **updatedAt** (Date): Last update. Auto-generated.

**Indexes:**
- `{ email: 1 }` - Unique index for login
- `{ firebaseUID: 1 }` - Unique index for OAuth users
- `{ createdAt: -1 }` - For admin analytics

---

#### 2. Artisan Model
**Collection Name:** `artisans`
**Purpose:** Store artisan profiles and business information

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **fullName** (String): Artisan's full name. Required.
- **email** (String): Email address. Required, unique.
- **phone** (String): Phone number. Required, 10 digits.
- **password** (String): Hashed password. Required.
- **profilePicture** (String): Cloudinary URL. Optional.
- **bio** (String): Professional description. Max 500 chars.
- **skills** ([String]): Array of skills/specializations. Required, min 1.
- **experience** (Number): Years of experience. Optional.
- **address** (Object): Business address. Required.
  - **street** (String): Street address.
  - **city** (String): City. Required, indexed.
  - **state** (String): State. Required.
  - **pincode** (String): PIN code. 6 digits.
  - **coordinates** ([Number]): [longitude, latitude] for geo-search.
- **serviceArea** (Object): Service coverage area. Optional.
  - **cities** ([String]): Cities served.
  - **radius** (Number): Service radius in km.
- **rating** (Number): Average rating. 0-5, default: 0.
- **reviewCount** (Number): Total reviews. Default: 0.
- **completedBookings** (Number): Completed bookings count. Default: 0.
- **portfolio** ([Object]): Array of portfolio items. Max 20 items.
  - **imageUrl** (String): Cloudinary URL. Required.
  - **videoUrl** (String): Cloudinary video URL. Optional.
  - **title** (String): Project title. Max 100 chars.
  - **description** (String): Project description. Max 500 chars.
  - **beforeImage** (String): Before photo URL. Optional.
  - **afterImage** (String): After photo URL. Optional.
- **bankDetails** (Object): NEW - Encrypted. Required for payouts.
  - **accountHolderName** (String): Encrypted field.
  - **accountNumber** (String): Encrypted field.
  - **ifscCode** (String): Encrypted field.
  - **bankName** (String): Plain text.
  - **kycVerified** (Boolean): KYC status. Default: false.
- **subscriptionTier** (String): NEW. Enum: free, professional, premium.
- **subscriptionExpiry** (Date): NEW. Subscription end date.
- **balance** (Number): NEW. Available earnings (Rs.).
- **totalEarnings** (Number): NEW. Lifetime earnings.
- **isVerified** (Boolean): Platform verification. Default: false.
- **isActive** (Boolean): Account status. Default: true.
- **workingHours** (Object): Business hours.
  - **[day]** (Object): Per-day hours.
    - **start** (String): Opening time. "09:00".
    - **end** (String): Closing time. "18:00".
- **algoliaObjectID** (String): Algolia search index ID. Unique.
- **createdAt** (Date): Registration date. Auto-generated.
- **updatedAt** (Date): Last update. Auto-generated.

**Indexes:**
- `{ email: 1 }` - Unique index
- `{ "address.city": 1, rating: -1 }` - Compound index for search
- `{ "address.coordinates": "2dsphere" }` - Geospatial index
- `{ skills: 1 }` - Multi-key index for skill search
- `{ subscriptionTier: 1, createdAt: -1 }` - For subscription analytics

**Encryption:**
- `bankDetails.accountHolderName` - AES-256 encryption
- `bankDetails.accountNumber` - AES-256 encryption
- `bankDetails.ifscCode` - AES-256 encryption

---

#### 3. ArtisanService Model
**Collection Name:** `artisanservices`
**Purpose:** Store services offered by artisans

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **artisan** (ObjectId): Reference to Artisan. Required, indexed.
- **name** (String): Service name. Required, max 100 chars.
- **description** (String): Service description. Max 1000 chars.
- **category** (ObjectId): Reference to Category. Required, indexed.
- **subcategory** (String): Subcategory name. Optional.
- **pricingType** (String): Pricing model. Enum: fixed, hourly, per_sqft, quote.
- **price** (Number): Price amount. Required if not 'quote'.
- **duration** (Number): Estimated duration in minutes. Optional.
- **images** ([String]): Service images. Max 5 images.
- **isActive** (Boolean): Service availability. Default: true.
- **createdAt** (Date): Creation date. Auto-generated.
- **updatedAt** (Date): Last update. Auto-generated.

**Indexes:**
- `{ artisan: 1, isActive: 1 }` - Get active services by artisan
- `{ category: 1, price: 1 }` - Category-wise price sorting

---

#### 4. Category Model
**Collection Name:** `categories`
**Purpose:** Organize artisan services into categories

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **name** (String): Category name. Required, unique.
- **slug** (String): URL-friendly name. Unique, lowercase.
- **description** (String): Category description. Optional.
- **icon** (String): Icon name/URL. Optional.
- **subcategories** ([String]): Array of subcategories. Optional.
- **serviceCount** (Number): Number of services. Default: 0.
- **isActive** (Boolean): Category status. Default: true.
- **createdAt** (Date): Creation date. Auto-generated.

**Example Categories:**
- Carpentry (furniture, doors, repairs)
- Electrical (wiring, repairs, installations)
- Plumbing (repairs, installations, maintenance)
- Painting (interior, exterior, texture)
- Mehendi (bridal, party, simple)
- Tailoring (stitching, alterations, custom)

**Indexes:**
- `{ slug: 1 }` - Unique index for URL routing
- `{ name: 1 }` - For quick lookups

---

#### 5. Booking Model
**Collection Name:** `bookings`
**Purpose:** Store booking/appointment information

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **bookingId** (String): Human-readable ID. Unique, e.g., "BK12345".
- **user** (ObjectId): Reference to User. Required, indexed.
- **artisan** (ObjectId): Reference to Artisan. Required, indexed.
- **service** (ObjectId): Reference to ArtisanService. Required.
- **scheduledDate** (Date): Service date. Required.
- **scheduledTime** (String): Service time. Required, "HH:MM" format.
- **location** (Object): Service location. Required.
  - **type** (String): Location type. Enum: workshop, customer.
  - **address** (Object): Full address. Required if customer.
  - **coordinates** ([Number]): [longitude, latitude]. Optional.
- **status** (String): Booking status. Enum: pending, confirmed, completed, cancelled, disputed.
- **notes** (String): Customer requirements. Max 1000 chars.
- **amount** (Number): Total booking amount. Required.
- **pricingBreakdown** (Object): Price details.
  - **basePrice** (Number): Service base price.
  - **tax** (Number): GST amount.
  - **platformFee** (Number): Platform commission.
- **payment** (ObjectId): Reference to Payment. Optional.
- **streamChannelId** (String): Stream Chat channel ID. Auto-generated.
- **cancellationReason** (String): NEW. If cancelled.
- **cancellationRequestedBy** (String): NEW. Enum: user, artisan.
- **cancellationDate** (Date): NEW. When cancelled.
- **rescheduledFrom** (ObjectId): NEW. Original booking if rescheduled.
- **alternativeDatesSuggested** ([Object]): NEW. Artisan's alternative dates.
  - **date** (Date): Suggested date.
  - **time** (String): Suggested time.
  - **message** (String): Artisan's message.
- **remindersSent** ([Object]): NEW. Reminder tracking.
  - **type** (String): Enum: email, push, sms.
  - **sentAt** (Date): When sent.
  - **status** (String): Delivery status.
- **respondedAt** (Date): When artisan responded.
- **completedAt** (Date): When marked complete.
- **createdAt** (Date): Booking creation date. Auto-generated.
- **updatedAt** (Date): Last update. Auto-generated.

**Indexes:**
- `{ user: 1, status: 1, scheduledDate: -1 }` - User's bookings
- `{ artisan: 1, status: 1, scheduledDate: 1 }` - Artisan's bookings
- `{ bookingId: 1 }` - Unique booking ID lookup
- `{ scheduledDate: 1 }` - Date-based queries
- `{ status: 1, scheduledDate: 1 }` - Admin dashboard

**New This Semester:**
- Cancellation tracking fields
- Alternative date suggestion system
- Automated reminder tracking

---

#### 6. Payment Model
**Collection Name:** `payments`
**Purpose:** Store payment transaction records

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **booking** (ObjectId): Reference to Booking. Required, indexed.
- **payer** (ObjectId): Reference to User. Required, indexed.
- **payee** (ObjectId): Reference to Artisan. Required, indexed.
- **amount** (Number): Payment amount (Rs.). Required.
- **currency** (String): Currency code. Default: "INR".
- **razorpayOrderId** (String): Razorpay order ID. Unique.
- **razorpayPaymentId** (String): Razorpay payment ID. Unique.
- **razorpaySignature** (String): Payment signature for verification.
- **status** (String): Payment status. Enum: pending, completed, failed, refunded.
- **paymentMethod** (String): Payment method used. e.g., "UPI", "Card".
- **paidAt** (Date): Payment completion time.
- **refund** (Object): NEW - Refund details.
  - **amount** (Number): Refund amount.
  - **razorpayRefundId** (String): Razorpay refund ID.
  - **reason** (String): Refund reason.
  - **status** (String): Refund status. Enum: pending, processed, failed.
  - **processedAt** (Date): Refund processed date.
- **commission** (Object): NEW - Platform commission.
  - **rate** (Number): Commission percentage. 10-20% based on tier.
  - **amount** (Number): Commission amount (Rs.).
  - **tier** (String): Artisan's subscription tier.
- **artisanEarning** (Number): NEW. Amount payable to artisan.
- **invoiceUrl** (String): NEW. PDF invoice URL on Cloudinary.
- **webhookEventId** (String): NEW. Razorpay webhook ID for idempotency.
- **metadata** (Object): Additional data. Flexible schema.
- **createdAt** (Date): Transaction date. Auto-generated.
- **updatedAt** (Date): Last update. Auto-generated.

**Indexes:**
- `{ booking: 1 }` - Unique payment per booking
- `{ payer: 1, createdAt: -1 }` - User's payment history
- `{ payee: 1, status: 1 }` - Artisan's earnings
- `{ razorpayOrderId: 1 }` - Razorpay order lookup
- `{ webhookEventId: 1 }` - Idempotency check

**New This Semester:**
- Complete refund system
- Commission calculation and tracking
- Invoice generation
- Webhook idempotency

---

#### 7. Review Model
**Collection Name:** `reviews`
**Purpose:** Store customer reviews for artisans

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **booking** (ObjectId): Reference to Booking. Required, unique.
- **artisan** (ObjectId): Reference to Artisan. Required, indexed.
- **user** (ObjectId): Reference to User. Required.
- **rating** (Number): Overall rating. Required, 1-5.
- **comment** (String): Written review. Max 500 chars.
- **specificRatings** (Object): Detailed ratings. Optional.
  - **quality** (Number): Quality of work. 1-5.
  - **professionalism** (Number): Professionalism. 1-5.
  - **value** (Number): Value for money. 1-5.
  - **timeliness** (Number): Timeliness. 1-5.
- **photos** ([String]): NEW. Review images. Max 5, Cloudinary URLs.
- **videos** ([String]): NEW. Review videos. Max 1, Cloudinary URL.
- **isVerified** (Boolean): NEW. Verified purchase badge. Auto-set to true.
- **artisanResponse** (Object): NEW. Artisan's response.
  - **text** (String): Response text. Max 300 chars.
  - **respondedAt** (Date): Response date.
- **isRecommended** (Boolean): User recommends artisan. Default: true.
- **isPublic** (Boolean): Public visibility. Default: true.
- **helpfulCount** (Number): "Helpful" votes. Default: 0.
- **flagCount** (Number): Report count. Default: 0.
- **isFlagged** (Boolean): Flagged for moderation. Default: false.
- **createdAt** (Date): Review date. Auto-generated.
- **updatedAt** (Date): Last update. Auto-generated.

**Indexes:**
- `{ artisan: 1, createdAt: -1 }` - Artisan's reviews (latest first)
- `{ booking: 1 }` - Unique review per booking
- `{ user: 1 }` - User's review history
- `{ rating: 1 }` - Filter by rating

**Validation:**
- User can only review after booking completion
- One review per booking
- User can edit review within 7 days

**New This Semester:**
- Photo/video review support
- Verified purchase badge
- Artisan response capability
- Helpful voting and flagging

---

#### 8. Notification Model
**Collection Name:** `notifications`
**Purpose:** Store in-app notifications

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **recipient** (ObjectId): User or Artisan ID. Required, indexed.
- **recipientType** (String): Recipient type. Enum: user, artisan, admin.
- **type** (String): Notification type. Enum: booking, payment, review, message, system.
- **title** (String): Notification title. Required, max 100 chars.
- **message** (String): Notification body. Max 500 chars.
- **actionUrl** (String): Deep link URL. Optional.
- **relatedEntity** (Object): Related entity reference.
  - **entityType** (String): Entity type. e.g., "booking", "payment".
  - **entityId** (ObjectId): Entity ID.
- **isRead** (Boolean): Read status. Default: false.
- **readAt** (Date): When read.
- **priority** (String): Notification priority. Enum: low, medium, high.
- **createdAt** (Date): Notification date. Auto-generated.

**Indexes:**
- `{ recipient: 1, isRead: 1, createdAt: -1 }` - Unread notifications
- `{ createdAt: 1 }` - TTL index (delete after 90 days)

---

#### 9. Availability Model
**Collection Name:** `availabilities`
**Purpose:** Track artisan's calendar availability

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **artisan** (ObjectId): Reference to Artisan. Required, indexed.
- **date** (Date): Specific date. Required.
- **timeSlots** ([Object]): Array of time slots.
  - **start** (String): Start time. "HH:MM" format.
  - **end** (String): End time. "HH:MM" format.
  - **isBooked** (Boolean): Slot booked status. Default: false.
- **isHoliday** (Boolean): Unavailable whole day. Default: false.
- **holidayReason** (String): Reason for unavailability. Optional.
- **createdAt** (Date): Creation date. Auto-generated.
- **updatedAt** (Date): Last update. Auto-generated.

**Indexes:**
- `{ artisan: 1, date: 1 }` - Unique per artisan per date
- `{ date: 1 }` - Date range queries

---

#### 10. CallHistory Model
**Collection Name:** `callhistories`
**Purpose:** Log video call sessions

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **booking** (ObjectId): Reference to Booking. Optional.
- **participants** ([Object]): Call participants.
  - **user** (ObjectId): User/Artisan ID.
  - **userType** (String): Participant type. Enum: user, artisan.
  - **joinedAt** (Date): Join timestamp.
- **dailyRoomName** (String): Daily.co room ID. Unique.
- **startedAt** (Date): Call start time. Required.
- **endedAt** (Date): Call end time.
- **duration** (Number): Call duration (seconds). Auto-calculated.
- **recordingUrl** (String): Recording URL. Optional.
- **status** (String): Call status. Enum: ongoing, completed, failed.

**Indexes:**
- `{ participants.user: 1, startedAt: -1 }` - User's call history
- `{ dailyRoomName: 1 }` - Room lookup

---

#### 11. OTP Model
**Collection Name:** `otps`
**Purpose:** Store OTPs for verification (phone/email)

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **identifier** (String): Email or phone number. Required, indexed.
- **otp** (String): 6-digit OTP code. Required.
- **purpose** (String): OTP purpose. Enum: registration, password_reset, phone_verify.
- **expiresAt** (Date): OTP expiration time. 10 minutes from creation.
- **isUsed** (Boolean): Used status. Default: false.
- **attempts** (Number): Verification attempts. Default: 0, max 3.
- **createdAt** (Date): Creation date. Auto-generated.

**Indexes:**
- `{ identifier: 1, purpose: 1, isUsed: 1 }` - Lookup active OTP
- `{ expiresAt: 1 }` - TTL index (auto-delete expired OTPs)

---

#### 12. Admin Model
**Collection Name:** `admins`
**Purpose:** Store admin account information

**Schema Fields:**

- **_id** (ObjectId): Unique identifier. Auto-generated.
- **fullName** (String): Admin name. Required.
- **email** (String): Email address. Required, unique.
- **password** (String): Hashed password. Required.
- **role** (String): Admin role. Enum: super_admin, moderator, support.
- **permissions** ([String]): Admin permissions. Array of permission strings.
- **isActive** (Boolean): Account status. Default: true.
- **lastLogin** (Date): Last login timestamp.
- **createdAt** (Date): Account creation date. Auto-generated.

**Indexes:**
- `{ email: 1 }` - Unique index for login

---

#### 13. Project Model (Optional)
**Collection Name:** `projects`
**Purpose:** Track development project tasks (internal use)

This is an internal model not related to main application functionality.

---

### Database Relationships Diagram Specification

**For Synopsis Document - Create this diagram:**

Use a traditional ER diagram format with:

**Entities (Rectangles):**
1. User
2. Artisan
3. ArtisanService
4. Category
5. Booking
6. Payment
7. Review
8. Notification
9. Availability
10. CallHistory

**Relationships (Diamond shapes with lines):**

```
User ──(1:N)── Books ──(N:1)── Booking ──(N:1)── Booked by ──(1:N)── Artisan
                                    │
                                    ├──(1:1)── Pays for ──(1:1)── Payment
                                    │
                                    └──(1:1)── Has ──(1:1)── Review

Artisan ──(1:N)── Offers ──(N:1)── ArtisanService ──(N:1)── Belongs to ──(1:N)── Category

Artisan ──(1:N)── Has ──(N:1)── Availability

Booking ──(1:1)── May have ──(1:1)── CallHistory

User ──(1:N)── Receives ──(N:1)── Notification
Artisan ──(1:N)── Receives ──(N:1)── Notification
```

**Cardinality:**
- 1:1 (One-to-One)
- 1:N (One-to-Many)
- N:M (Many-to-Many)

---

### Sample Data Examples

**Sample User:**
```json
{
  "_id": "60d5ec49eb1c4b3a2c5e4f1a",
  "fullName": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "phone": "9876543210",
  "profilePicture": "https://res.cloudinary.com/.../priya.jpg",
  "address": {
    "street": "123 MG Road",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001"
  },
  "role": "user",
  "isVerified": true,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Sample Artisan:**
```json
{
  "_id": "60d5ec49eb1c4b3a2c5e4f1b",
  "fullName": "Rajesh Kumar",
  "email": "rajesh.carpenter@example.com",
  "phone": "9988776655",
  "bio": "Experienced carpenter with 15+ years in custom furniture and woodwork.",
  "skills": ["Carpentry", "Furniture Making", "Wood Carving"],
  "experience": 15,
  "address": {
    "city": "Pune",
    "state": "Maharashtra",
    "coordinates": [73.8567, 18.5204]
  },
  "rating": 4.8,
  "reviewCount": 245,
  "subscriptionTier": "professional",
  "balance": 12500,
  "isVerified": true,
  "createdAt": "2024-06-10T08:00:00Z"
}
```

**Sample Booking:**
```json
{
  "_id": "60d5ec49eb1c4b3a2c5e4f1c",
  "bookingId": "BK12345",
  "user": "60d5ec49eb1c4b3a2c5e4f1a",
  "artisan": "60d5ec49eb1c4b3a2c5e4f1b",
  "service": "60d5ec49eb1c4b3a2c5e4f1d",
  "scheduledDate": "2025-05-20T00:00:00Z",
  "scheduledTime": "10:00",
  "location": {
    "type": "customer",
    "address": {
      "street": "123 MG Road",
      "city": "Pune",
      "pincode": "411001"
    }
  },
  "status": "confirmed",
  "amount": 5000,
  "pricingBreakdown": {
    "basePrice": 4200,
    "tax": 756,
    "platformFee": 44
  },
  "createdAt": "2025-05-15T14:20:00Z"
}
```

---

### Database Performance Considerations

**Indexing Strategy:**
- **Compound Indexes:** For common query patterns (e.g., `{ artisan: 1, status: 1, date: -1 }`)
- **Geospatial Index:** On artisan coordinates for location-based search
- **Text Index:** On artisan bio and skills for full-text search (backup to Algolia)
- **TTL Indexes:** On OTP and old notifications for auto-deletion

**Query Optimization (This Semester's Work):**
- Replace N+1 queries with aggregation pipelines
- Use projection to limit returned fields
- Implement cursor-based pagination for large result sets
- Add Redis caching for frequently accessed data (artisan profiles, categories)

**Data Volume Estimates:**
```
Users: 10,000 → ~50 MB
Artisans: 3,000 → ~30 MB (with portfolios)
Bookings: 50,000 → ~100 MB
Payments: 50,000 → ~80 MB
Reviews: 30,000 → ~60 MB
Notifications: 100,000 → ~40 MB (with TTL cleanup)
---
Total: ~360 MB (well within M2 tier 10 GB limit)
```

**Backup Strategy:**
- Automated daily backups via MongoDB Atlas
- Point-in-time recovery enabled
- Backup retention: 7 days

---

### Security Measures

1. **Encryption:**
   - Data in transit: HTTPS (TLS 1.3)
   - Data at rest: MongoDB Atlas encryption
   - Sensitive fields: AES-256 encryption (bank details)

2. **Access Control:**
   - Database user with least privilege (read/write specific collections only)
   - Admin user separate credentials
   - No root access from application

3. **Connection Security:**
   - MongoDB Atlas whitelist IP addresses
   - Connection string in environment variables (never committed to Git)
   - Connection pooling with max connections limit

4. **Audit Logging:**
   - All database operations logged via application logger
   - Critical operations (payments, deletions) logged to Sentry

---

## Conclusion

This completes the Analysis and Design section covering:
- ✅ Comprehensive functional requirements (60+ requirements)
- ✅ Non-functional requirements (security, performance, reliability)
- ✅ Module hierarchy diagram specification
- ✅ Sample input/output screen descriptions
- ✅ Complete database schema (13 models with all fields documented)

The system is designed to be:
- **Scalable:** Horizontal scaling, sharding support
- **Secure:** Encryption, authentication, input validation
- **Performant:** Indexes, caching, query optimization
- **Maintainable:** Clear schema, proper relationships, documentation

**This semester's enhancements focus on:**
- Security hardening (XSS, ReDoS, encryption)
- Feature completion (bookings, payments, reviews)
- New business features (subscriptions, analytics, withdrawals)
- Testing infrastructure (60%+ coverage target)

---

# END OF SYNOPSIS

**For Final Document Formatting:**

1. **Add MITWPU Logo:** Place university logo at top of title page
2. **Insert Screenshots:** Replace screen descriptions with actual screenshots
3. **Create Module Diagram:** Use the specification in Section 3.2 to create visual diagram
4. **Format Tables:** Ensure all tables are properly formatted with borders
5. **Page Numbers:** Add page numbers matching the index
6. **Header/Footer:** Add project name in header, team names in footer
7. **Signature Page:** Add guide signature and HOD signature placeholders
8. **Print Format:** A4 size, margins: Top 1", Bottom 1", Left 1.25", Right 1"

---

**Total Pages:** Approximately 25-30 pages with screenshots and diagrams

**Submission Checklist:**
- [ ] Title page with logo
- [ ] Index matching page numbers
- [ ] All sections 1-3.4 complete
- [ ] Module diagram created and inserted
- [ ] 9 screenshots captured and inserted
- [ ] Database ER diagram created
- [ ] All tables properly formatted
- [ ] Proofread for spelling/grammar
- [ ] PDF generated
- [ ] Printed and bound (if physical submission required)
