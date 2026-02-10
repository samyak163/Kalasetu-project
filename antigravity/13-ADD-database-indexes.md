# TASK: Add Missing Database Indexes

## Priority: MEDIUM (Performance)

## Problem
Several common query patterns don't have indexes, causing slow queries as data grows.

## Files to Update

### 1. bookingModel.js
`kalasetu-backend/models/bookingModel.js`

Add these indexes at the end of the schema, before `export`:

```javascript
// Add after schema definition, before export

// Index for user's bookings (sorted by date)
bookingSchema.index({ user: 1, createdAt: -1 });

// Index for artisan's bookings (sorted by date)
bookingSchema.index({ artisan: 1, createdAt: -1 });

// Index for filtering by status
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ artisan: 1, status: 1 });

// Index for scheduled date queries
bookingSchema.index({ artisan: 1, scheduledDate: 1 });
bookingSchema.index({ user: 1, scheduledDate: 1 });

// Index for finding responded bookings
bookingSchema.index({ respondedAt: 1 });
```

### 2. paymentModel.js
`kalasetu-backend/models/paymentModel.js`

Add these indexes:

```javascript
// Index for user's payment history
paymentSchema.index({ payerId: 1, createdAt: -1 });

// Index for artisan's received payments
paymentSchema.index({ recipientId: 1, createdAt: -1 });

// Index for booking's payments
paymentSchema.index({ booking: 1 });

// Index for payment status queries
paymentSchema.index({ status: 1, createdAt: -1 });

// Index for Razorpay order lookup
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
```

### 3. reviewModel.js
`kalasetu-backend/models/reviewModel.js`

Add these indexes:

```javascript
// Index for artisan's reviews (sorted by date)
reviewSchema.index({ artisan: 1, createdAt: -1 });

// Index for user's given reviews
reviewSchema.index({ user: 1, createdAt: -1 });

// Index for booking's review (should be unique)
reviewSchema.index({ booking: 1 }, { unique: true, sparse: true });

// Index for rating queries
reviewSchema.index({ artisan: 1, rating: -1 });
```

### 4. artisanModel.js
`kalasetu-backend/models/artisanModel.js`

Check if these exist, add if missing:

```javascript
// Index for public profile lookup
artisanSchema.index({ publicId: 1 }, { unique: true });

// Index for email lookup (should exist for auth)
artisanSchema.index({ email: 1 }, { unique: true });

// Index for phone lookup
artisanSchema.index({ phoneNumber: 1 }, { sparse: true });

// Index for category filtering
artisanSchema.index({ category: 1 });

// Index for location-based queries (2dsphere for geo)
artisanSchema.index({ location: '2dsphere' });

// Index for search/filtering
artisanSchema.index({ verified: 1, rating: -1 });

// Compound index for common search patterns
artisanSchema.index({ category: 1, verified: 1, rating: -1 });
```

### 5. userModel.js
`kalasetu-backend/models/userModel.js`

Add these indexes:

```javascript
// Index for email lookup (should exist)
userSchema.index({ email: 1 }, { unique: true });

// Index for phone lookup
userSchema.index({ phoneNumber: 1 }, { sparse: true });
```

### 6. callHistoryModel.js
`kalasetu-backend/models/callHistoryModel.js`

Add these indexes:

```javascript
// Index for user's call history
callHistorySchema.index({ participants: 1, startTime: -1 });

// Index for booking's calls
callHistorySchema.index({ booking: 1 });
```

## How to Add Indexes

### Method 1: In the model file (Recommended)

Add after schema definition:
```javascript
const bookingSchema = new mongoose.Schema({
  // ... fields
});

// Add indexes here
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ artisan: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
```

### Method 2: Via MongoDB shell or Atlas

```javascript
// In MongoDB shell or Atlas
db.bookings.createIndex({ user: 1, createdAt: -1 });
db.bookings.createIndex({ artisan: 1, status: 1 });
```

## Index Explanation

```javascript
// Single field index - for filtering by one field
schema.index({ field: 1 });  // 1 = ascending, -1 = descending

// Compound index - for queries on multiple fields
schema.index({ field1: 1, field2: -1 });  // Order matters!

// Unique index - prevents duplicates
schema.index({ email: 1 }, { unique: true });

// Sparse index - only indexes documents that have the field
schema.index({ optionalField: 1 }, { sparse: true });

// 2dsphere - for geospatial queries
schema.index({ location: '2dsphere' });
```

## Steps

1. Open each model file
2. Add the indexes as shown above
3. Restart the backend server
4. Mongoose will automatically create the indexes

## Verify Indexes Were Created

After restarting the server, check in MongoDB:

```javascript
// In MongoDB shell or Atlas
db.bookings.getIndexes()
db.payments.getIndexes()
db.artisans.getIndexes()
```

## Performance Impact

With proper indexes:
- User's booking list: ~50ms → ~5ms
- Artisan dashboard queries: ~200ms → ~20ms
- Payment history: ~100ms → ~10ms

## Success Criteria
- All indexes created without errors
- Server starts without index errors
- Queries are noticeably faster
- No duplicate key errors (for unique indexes)
