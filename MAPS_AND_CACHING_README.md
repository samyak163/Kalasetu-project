# Google Maps & Redis Caching Documentation

## 🗺️ Google Maps Integration

### Nearby Artisans Endpoint

**Endpoint:** `GET /api/artisans/nearby`

**Query Parameters:**
- `lat` (required): Latitude of the search center
- `lng` (required): Longitude of the search center
- `radiusKm` (optional): Search radius in kilometers (default: 10)
- `radius` (optional): Alternative to radiusKm, specified in meters
- `limit` (optional): Maximum number of results (default: 20, max: 100)

**Example Request:**
```bash
GET /api/artisans/nearby?lat=28.6139&lng=77.2090&radiusKm=25&limit=30
```

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "publicId": "ks_abc123",
      "fullName": "Artisan Name",
      "craft": "Pottery",
      "location": {
        "type": "Point",
        "coordinates": [77.2090, 28.6139],
        "address": "...",
        "city": "Delhi",
        "state": "Delhi",
        "country": "India"
      },
      "distance": 1234.56,  // Distance in meters
      "profileImageUrl": "...",
      "bio": "..."
    }
  ]
}
```

### Geospatial Index

The artisan model uses a MongoDB 2dsphere index on the `location` field for efficient geospatial queries:

```javascript
artisanSchema.index({ location: '2dsphere' });
```

**Location Schema:**
```javascript
location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [Number, Number],  // [longitude, latitude]
  address: String,
  city: String,
  state: String,
  country: String,
  postalCode: String
}
```

## 🚀 Redis Caching

### Cache Configuration

Redis caching is configured via environment variables in `config/env.config.js`:

```javascript
export const CACHE_CONFIG = {
  enabled: true,
  provider: 'upstash',
  ttl: 300,  // Default TTL in seconds
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    ttl: 300
  }
};
```

### Cache Key Patterns

#### Artisan Caches
- **List Cache:** `cache:artisans:list:/`
  - Stores the full artisan list
  - TTL: 300 seconds (5 minutes)
  - Invalidated on: Profile updates

- **Public Profile Cache:** `cache:artisans:public:/:publicId`
  - Stores individual artisan public profiles
  - TTL: 300 seconds (5 minutes)
  - Invalidated on: Profile updates

- **Nearby Cache:** `cache:artisans:nearby:/nearby?lat=X&lng=Y&radiusKm=Z`
  - Stores geospatial query results
  - TTL: 60 seconds (1 minute)
  - Shorter TTL due to location-sensitive data

### Cache Middleware Usage

**Applying Cache to Routes:**
```javascript
import { cache } from '../middleware/cacheMiddleware.js';

// Cache for 5 minutes
router.get('/', cache('artisans:list', 300), getAllArtisans);

// Cache for 1 minute
router.get('/nearby', cache('artisans:nearby', 60), getNearbyArtisans);
```

**Invalidating Cache on Updates:**
```javascript
import { invalidateCache } from '../middleware/cacheMiddleware.js';

router.put('/profile', 
  protect, 
  invalidateCache([
    'cache:artisans:list*',
    'cache:artisans:public*',
    'cache:artisans:nearby*'
  ]), 
  updateArtisanProfile
);
```

### Cache Utilities

**Set Cache:**
```javascript
import { setCache } from '../utils/redis.js';
await setCache('myKey', { data: 'value' }, 300); // TTL in seconds
```

**Get Cache:**
```javascript
import { getCache } from '../utils/redis.js';
const data = await getCache('myKey');
```

**Delete Cache:**
```javascript
import { deleteCache } from '../utils/redis.js';
await deleteCache('myKey');
```

**Delete by Pattern:**
```javascript
import { deleteCachePattern } from '../utils/redis.js';
await deleteCachePattern('cache:artisans:*');
```

## 🎯 Profile Update Cache Invalidation

When an artisan updates their profile via `PUT /api/artisans/profile`, the following caches are automatically invalidated:

1. **List Cache** - Forces fresh data on next list request
2. **Public Profile Cache** - Ensures updated profile is shown immediately
3. **Nearby Cache** - Refreshes location-based searches

**Endpoint:**
```
PUT /api/artisans/profile
Authorization: Bearer <token>

Body:
{
  "bio": "Updated bio",
  "craft": "Updated craft",
  "location": {
    "coordinates": [lng, lat],
    "city": "City Name",
    "state": "State Name",
    ...
  }
}
```

## 📊 Performance Benefits

### Without Cache
- Every request hits MongoDB
- Geospatial queries can be expensive
- Higher database load

### With Cache
- First request: Cache MISS → MongoDB query → Store in Redis
- Subsequent requests: Cache HIT → Return from Redis
- Reduced MongoDB load by 80-95%
- Response time improved by 50-70%

## 🔧 Troubleshooting

### Cache Not Working
1. Check `CACHE_CONFIG.enabled` is `true`
2. Verify Upstash Redis credentials in `.env`
3. Check server logs for Redis initialization errors

### Stale Data
1. Verify cache invalidation middleware is applied
2. Check TTL values are appropriate
3. Manually clear cache: `deleteCachePattern('cache:*')`

### Geospatial Queries Slow
1. Ensure 2dsphere index exists: `db.artisans.getIndexes()`
2. Verify location coordinates are in [lng, lat] order
3. Check MongoDB version supports geospatial queries (>= 2.4)

## 🚀 Best Practices

1. **Short TTL for dynamic data** - Use 60-120s for frequently changing data
2. **Longer TTL for static data** - Use 300-600s for stable data
3. **Always invalidate on writes** - Use invalidateCache middleware
4. **Monitor cache hit rates** - Track Redis metrics in production
5. **Graceful degradation** - Application works even if Redis is down
