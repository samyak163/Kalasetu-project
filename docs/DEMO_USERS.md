# 👥 Demo Users Setup Guide

## Overview

This guide explains how to set up demo users with pre-populated bookmarks and interactions for testing the user experience in KalaSetu.

---

## What Gets Created

### 3 Demo Users

| User | Email | Password | Purpose |
|------|-------|----------|---------|
| Demo User | demo.user@kalasetu.com | DemoUser123 | General testing |
| Test Customer | test.customer@kalasetu.com | TestCustomer123 | Customer flow testing |
| Sample Buyer | sample.buyer@kalasetu.com | SampleBuyer123 | Purchase flow testing |

### Pre-Populated Data

Each demo user automatically gets:

✅ **Email Verified**: No verification needed  
✅ **3-6 Random Bookmarks**: Pre-selected demo artisans  
✅ **Active Account**: Ready to use immediately  

---

## Quick Setup

### Option 1: Seed Users Only
```bash
cd kalasetu-backend
npm run seed:users
```

### Option 2: Seed Everything
```bash
cd kalasetu-backend
npm run seed:all
```
This runs both `seed` (artisans) and `seed:users` (users)

---

## Testing User Features

### 1. Login as a User
```
Frontend: http://localhost:5173
Email: demo.user@kalasetu.com
Password: DemoUser123
```

### 2. View Bookmarks
- Navigate to user profile/dashboard
- See pre-bookmarked artisans
- Click to view artisan profiles

### 3. Bookmark Management
- Browse artisan listings
- Add new bookmarks
- Remove existing bookmarks
- See bookmark count update

### 4. Search & Browse
- Search artisans by craft
- Filter by location/rating
- View artisan profiles
- See contact information

### 5. Interactions (if implemented)
- Send messages to artisans
- Create booking requests
- View booking history
- Leave reviews

---

## API Testing

### Get User Bookmarks
```bash
# Login first to get cookie
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.user@kalasetu.com","password":"DemoUser123"}' \
  -c cookies.txt

# Get user profile with bookmarks
curl http://localhost:5000/api/users/me \
  -b cookies.txt
```

### Add Bookmark
```bash
# Get artisan ID first
curl http://localhost:5000/api/artisans | jq '.[0]._id'

# Add to bookmarks (implement endpoint if needed)
curl -X POST http://localhost:5000/api/users/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"artisanId":"<artisan_id>"}' \
  -b cookies.txt
```

---

## Script Details

### Location
`kalasetu-backend/scripts/seedDemoUsers.js`

### What It Does

1. Connects to MongoDB
2. Fetches existing demo artisans
3. Creates 3 demo users (or updates if exist)
4. Assigns 3-6 random bookmarks to each user
5. Sets `emailVerified: true`
6. Displays login credentials

### Re-run Behavior

- If user exists: Updates bookmarks (re-randomizes)
- If user doesn't exist: Creates new user
- Safe to run multiple times

---

## Cleanup Script Update

The cleanup script now preserves demo users:

```bash
# Dry run (see what will be deleted)
npm run cleanup:dry

# Actual cleanup (keeps demo artisans + demo users)
npm run cleanup
```

**Preserved Users:**
- demo.user@kalasetu.com
- test.customer@kalasetu.com
- sample.buyer@kalasetu.com

**Deleted Users:**
- All other user accounts

---

## Full Workflow

### Initial Setup
```bash
# 1. Seed demo artisans
npm run seed

# 2. Seed demo users
npm run seed:users

# 3. Start servers
npm run dev  # backend
cd ../kalasetu-frontend && npm run dev  # frontend
```

### Before Presentation
```bash
# Clean and re-seed everything
npm run cleanup
npm run seed:all
```

### After Testing
```bash
# Remove test data, keep demos
npm run cleanup
```

---

## Customization

### Add More Demo Users

Edit `scripts/seedDemoUsers.js`:

```javascript
const DEMO_USERS = [
  // ... existing users
  {
    fullName: 'New Demo User',
    email: 'new.demo@kalasetu.com',
    password: 'NewDemo123',
    emailVerified: true,
  }
];
```

### Change Bookmark Count

Edit the numBookmarks calculation:

```javascript
// Current: 3 to 6 bookmarks
const numBookmarks = Math.floor(Math.random() * 4) + 3;

// Change to: 5 to 10 bookmarks
const numBookmarks = Math.floor(Math.random() * 6) + 5;
```

### Preserve Custom Users in Cleanup

Edit `scripts/cleanupProfiles.js`:

```javascript
const DEMO_USER_EMAILS = [
  'demo.user@kalasetu.com',
  'test.customer@kalasetu.com',
  'sample.buyer@kalasetu.com',
  'your.custom.user@example.com',  // Add here
];
```

---

## Troubleshooting

### Users Not Created
**Issue**: Script says "No demo artisans found"

**Solution**: 
```bash
npm run seed  # Seed artisans first
npm run seed:users  # Then seed users
```

### Bookmarks Empty
**Issue**: Users created but no bookmarks

**Solution**: 
- Ensure demo artisans exist in database
- Check artisan emails match DEMO_ARTISAN_EMAILS list
- Re-run: `npm run seed:users`

### Login Fails
**Issue**: Cannot login with demo user credentials

**Check**:
1. User exists: Check MongoDB
2. Password correct: Use exact password from script
3. Backend running: Check http://localhost:5000
4. CORS configured: Check browser console

### Bookmarks Not Showing
**Issue**: Logged in but bookmarks don't appear

**Check**:
1. Frontend fetches bookmarks correctly
2. API endpoint returns bookmarks
3. User model populates bookmarks array
4. Frontend component displays bookmarks

---

## Database Queries

### Check Demo Users
```javascript
// MongoDB shell or Compass
db.users.find({ 
  email: { $in: [
    'demo.user@kalasetu.com',
    'test.customer@kalasetu.com',
    'sample.buyer@kalasetu.com'
  ]}
}, {
  fullName: 1,
  email: 1,
  emailVerified: 1,
  bookmarks: 1
})
```

### Count Bookmarks
```javascript
db.users.aggregate([
  { $match: { email: 'demo.user@kalasetu.com' }},
  { $project: { 
    fullName: 1,
    bookmarkCount: { $size: '$bookmarks' }
  }}
])
```

### Get Bookmarked Artisans
```javascript
db.users.aggregate([
  { $match: { email: 'demo.user@kalasetu.com' }},
  { $lookup: {
    from: 'artisans',
    localField: 'bookmarks',
    foreignField: '_id',
    as: 'bookmarkedArtisans'
  }},
  { $project: {
    fullName: 1,
    'bookmarkedArtisans.fullName': 1,
    'bookmarkedArtisans.craft': 1,
    'bookmarkedArtisans.email': 1
  }}
])
```

---

## Next Steps

1. ✅ Create demo users: `npm run seed:users`
2. 🧪 Test login with demo credentials
3. 👀 View bookmarked artisans in UI
4. ➕ Test adding/removing bookmarks
5. 🔍 Test search and browse features
6. 💬 Test messaging (if implemented)
7. 📅 Test booking flows (if implemented)

---

## Related Documentation

- **Artisan Seeding**: See `seedArtisans.js` or run `npm run seed`
- **Cleanup**: See `cleanupProfiles.js` or `README.md`
- **Verification**: See `DEMO_VERIFICATION.md`
- **Quick Reference**: See `DEMO_QUICK_REF.md`

---

**Status**: ✅ Ready to use - Demo users with bookmarks configured!
