# ðŸ“¡ API Documentation

REST API documentation for KalaSetu backend.

**Base URL:** `http://localhost:5000/api` (development)

---

## Authentication

All authenticated endpoints require a JWT token in HTTP-only cookie or Authorization header.

### Register Artisan
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",     // Optional (email OR phone required)
  "phoneNumber": "+919876543210",  // Optional
  "password": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "artisan": { /* artisan object */ },
  "token": "jwt-token",
  "redirectTo": "/artisan/dashboard"
}
```

### Login Artisan
```http
POST /api/auth/login
Content-Type: application/json

{
  "loginIdentifier": "john@example.com",  // Email or phone
  "password": "SecurePass123"
}
```

### Register USER
```http
POST /api/users/register
Content-Type: application/json

{
  "fullName": "Jane USER",
  "email": "jane@example.com",
  "phoneNumber": "+919876543210",
  "password": "SecurePass123"
}
```

### Login USER
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me          // For artisans
GET /api/users/me         // For USERs
```

### Logout
```http
POST /api/auth/logout     // For artisans
POST /api/users/logout    // For USERs
```

---

## Artisans

### Get All Artisans
```http
GET /api/artisans
```

### Get Artisan by Public ID
```http
GET /api/artisans/:publicId
```

**Example:** `/api/artisans/ks_a1b2c3d4`

### Get Artisan by MongoDB ID
```http
GET /api/artisans/id/:id
```

### Get Nearby Artisans
```http
GET /api/artisans/nearby?lat=18.5204&lng=73.8567&radiusKm=50&limit=20&skills=pottery,weaving&minRating=4
```

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radiusKm` (optional, default: 50): Search radius in km
- `limit` (optional, default: 20, max: 100): Results per page
- `skills` (optional): Comma-separated skills to filter
- `minRating` (optional): Minimum rating (0-5)

**Response:**
```json
{
  "success": true,
  "artisans": [
    {
      "_id": "...",
      "fullName": "...",
      "location": { /* ... */ },
      "distance": 1234,        // meters
      "distanceKm": 1.2        // kilometers (rounded)
    }
  ],
  "count": 15,
  "searchCenter": { "latitude": 18.5204, "longitude": 73.8567 },
  "radiusKm": 50
}
```

### Update Artisan Profile (Protected)
```http
PUT /api/artisan/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "skills": ["pottery", "sculpture"],
  "location": {
    "coordinates": [73.8567, 18.5204],
    "city": "Pune",
    "state": "Maharashtra"
  }
}
```

---

## Search

### Search Artisans (Algolia)
```http
GET /api/search/artisans?q=pottery&page=0&hitsPerPage=20&aroundLatLng=18.5204,73.8567&aroundRadius=50000
```

**Query Parameters:**
- `q`: Search query
- `page`: Page number (default: 0)
- `hitsPerPage`: Results per page (default: 20)
- `filters`: Algolia filter string
- `aroundLatLng`: Geographic filter (lat,lng)
- `aroundRadius`: Radius in meters

**Response:**
```json
{
  "success": true,
  "hits": [ /* artisan objects */ ],
  "nbHits": 42,
  "page": 0,
  "nbPages": 3,
  "hitsPerPage": 20,
  "processingTimeMS": 12
}
```

### Get Search Suggestions
```http
GET /api/search/suggestions?q=pot
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "id": "ks_a1b2c3d4",
      "name": "Pottery Master",
      "skills": ["pottery", "ceramics"],
      "image": "https://...",
      "highlighted": { /* highlighted fields */ }
    }
  ]
}
```

### Get Search Facets
```http
GET /api/search/facets
```

---

## SEO

### Get Artisan SEO Data
```http
GET /api/seo/artisan/:publicId
```

**Response:**
```json
{
  "success": true,
  "seo": {
    "title": "John Doe - Traditional Artisan | KalaSetu",
    "description": "Connect with John Doe, a skilled artisan...",
    "keywords": "John Doe, pottery, ceramics, traditional artisan...",
    "image": "https://...",
    "url": "https://kalasetu.com/artisan/ks_a1b2c3d4",
    "type": "profile",
    "structuredData": { /* Schema.org JSON-LD */ }
  }
}
```

### Get Sitemap Data
```http
GET /api/seo/sitemap
```

---

## Uploads

### Get Cloudinary Signature
```http
POST /api/uploads/cloudinary-signature
Authorization: Bearer <token>
```

**Response:**
```json
{
  "signature": "...",
  "timestamp": 1234567890,
  "cloudName": "your-cloud",
  "apiKey": "your-key",
  "uploadPreset": "kalasetu_profiles"
}
```

---

## Chat (Stream)

### Get Stream Token
```http
GET /api/chat/token
Authorization: Bearer <token>
```

### Create Chat Channel
```http
POST /api/chat/channel
Authorization: Bearer <token>
Content-Type: application/json

{
  "artisanId": "artisan-mongodb-id",
  "USERId": "USER-mongodb-id"
}
```

---

## Video Calls (Daily.co)

### Create Video Room
```http
POST /api/video/create-room
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "room-name-optional",
  "privacy": "public"
}
```

### Get Room Details
```http
GET /api/video/room/:roomName
Authorization: Bearer <token>
```

---

## Payments (Razorpay)

### Create Order
```http
POST /api/payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,           // Amount in paise (â‚¹500.00)
  "currency": "INR",
  "notes": { /* custom data */ }
}
```

### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

---

## Notifications

### Send Push Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id",
  "title": "New message",
  "message": "You have a new message from...",
  "url": "/messages"
}
```

---

## Contact

### Submit Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I would like to..."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Status Codes:**
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid auth token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource doesn't exist
- `409` Conflict - Duplicate email/phone
- `423` Locked - Account temporarily locked
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server issue

---

## Rate Limiting

- **Limit:** 300 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit`: Max requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Webhooks

### QStash Job Webhook
```http
POST /api/jobs/webhook
X-Upstash-Signature: signature

{
  "type": "send-welcome-email",
  "data": { /* job data */ }
}
```

### Razorpay Webhook
```http
POST /api/payments/webhook
X-Razorpay-Signature: signature

{
  "event": "payment.captured",
  "payload": { /* payment data */ }
}
```

---

**Last Updated:** November 4, 2025
