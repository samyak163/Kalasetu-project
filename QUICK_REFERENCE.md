# 🚀 Quick Reference - New Features

## 🗺️ Google Maps + Geospatial

**Frontend:**
- Component: `<NearbyArtisans />` (already on HomePage)
- Location utilities: `src/lib/googleMaps.js`

**Backend:**
```bash
GET /api/artisans/nearby?lat=28.6139&lng=77.2090&radiusKm=25
```

**Env Vars:**
```bash
# Backend
GOOGLE_MAPS_API_KEY=

# Frontend
VITE_GOOGLE_MAPS_API_KEY=
```

---

## 🚀 Redis Caching

**Usage:**
```javascript
// Apply cache to route (backend)
import { cache } from '../middleware/cacheMiddleware.js';
router.get('/endpoint', cache('prefix', 300), handler);

// Invalidate cache on mutations
import { invalidateCache } from '../middleware/cacheMiddleware.js';
router.put('/update', invalidateCache(['cache:prefix*']), handler);
```

**Cache Keys:**
- `cache:artisans:list` - 5 min
- `cache:artisans:public:*` - 5 min  
- `cache:artisans:nearby:*` - 1 min

**Env Vars:**
```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## ⏰ QStash Background Jobs

**Queue a Job:**
```javascript
import { queueWelcomeEmail, queueArtisanIndexing } from './utils/jobQueue.js';

await queueWelcomeEmail(userId, email, name);
await queueArtisanIndexing(artisanId);
```

**Scheduled Jobs:**
- Daily cleanup: 2 AM
- Daily reports: 8 AM

**Webhook:**
```bash
POST /api/jobs/webhook
```

**Env Vars:**
```bash
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
```

---

## 💳 Razorpay Payments

**Frontend:**
```jsx
import PaymentButton from '../components/Payment/PaymentButton';

<PaymentButton
  amount={500}
  purpose="consultation"
  recipientId={artisanId}
  description="30-min consultation"
  onSuccess={(data) => console.log('Payment successful', data)}
  onError={(err) => console.error('Payment failed', err)}
/>
```

**Backend:**
```bash
POST /api/payments/create-order    # Create order
POST /api/payments/verify          # Verify payment
GET  /api/payments                 # List payments
POST /api/payments/:id/refund      # Refund
POST /api/payments/webhook         # Webhook
```

**Env Vars:**
```bash
# Backend
RAZORPAY_KEY_ID=rzp_test_
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Frontend
VITE_RAZORPAY_KEY_ID=rzp_test_
```

---

## 📦 Install Packages

**Backend:**
```bash
cd kalasetu-backend
npm install @upstash/redis @upstash/qstash razorpay
```

**Frontend:**
```bash
cd kalasetu-frontend
npm install @react-google-maps/api
```

---

## 🧪 Quick Test

### 1. Test Nearby Artisans
```bash
curl "http://localhost:5000/api/artisans/nearby?lat=28.6139&lng=77.2090&radiusKm=50"
```

### 2. Test Cache
```bash
# First call (slow - cache miss)
curl http://localhost:5000/api/artisans

# Second call (fast - cache hit)
curl http://localhost:5000/api/artisans
```

### 3. Test Payment
- Visit `/payments` page
- Click "Pay" button
- Use Razorpay test card: 4111 1111 1111 1111

### 4. Test Job Queue
```bash
# In your code
import { queueArtisanIndexing } from './utils/jobQueue.js';
await queueArtisanIndexing('ARTISAN_ID');
```

---

## 🔗 Dashboards

- **Upstash:** https://console.upstash.com
- **Razorpay:** https://dashboard.razorpay.com
- **Google Maps:** https://console.cloud.google.com

---

## 📚 Full Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete feature summary
- `MAPS_AND_CACHING_README.md` - Maps & caching details
- `TOOLS_AND_SERVICES_LIST.md` - All services & configs
