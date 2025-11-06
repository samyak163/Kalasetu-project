# 🎯 Complete Demo Setup - Quick Start

## ✅ What's Available Now

### Demo Artisans (20)
- Auto-verified email accounts
- Locations across Pune
- Different crafts (Pottery, Textiles, Woodwork, etc.)
- Login: Any `*@demo.kalasetu.com` + password `Password123`

### Demo Users (3)
- Pre-populated bookmarks (3-6 artisans each)
- Email verified
- Ready to test user flows
- See login credentials below

---

## 🚀 One-Command Setup

```bash
cd kalasetu-backend

# Option 1: Seed everything from scratch
npm run seed:all

# Option 2: Step by step
npm run seed        # Artisans first
npm run seed:users  # Then users
```

---

## 🔐 Login Credentials

### As Artisan (Service Provider)
```
Email: rajesh.patil@demo.kalasetu.com
Password: Password123

Or any other @demo.kalasetu.com email (see DEMO_VERIFICATION.md for full list)
```

### As User (Customer)
```
Email: demo.user@kalasetu.com
Password: DemoUser123
```

**Other users:**
- `test.customer@kalasetu.com` / `TestCustomer123`
- `sample.buyer@kalasetu.com` / `SampleBuyer123`

---

## 📋 What to Test

### As User (Customer)
1. ✅ Login
2. ✅ View bookmarked artisans (3-6 pre-loaded)
3. ✅ Browse all artisans
4. ✅ Search by craft/location
5. ✅ View artisan profiles
6. ✅ Add/remove bookmarks
7. ✅ Send messages (if implemented)
8. ✅ Create bookings (if implemented)

### As Artisan (Service Provider)
1. ✅ Login
2. ✅ View own profile
3. ✅ Edit profile details
4. ✅ Manage availability
5. ✅ View bookings
6. ✅ Respond to messages
7. ✅ Update portfolio

---

## 🧹 Cleanup & Reset

### Keep Demos, Remove Test Data
```bash
npm run cleanup
```
Preserves:
- 20 demo artisans
- 3 demo users

Deletes:
- All other artisans
- All other users

### Fresh Start
```bash
npm run cleanup && npm run seed:all
```

---

## 📊 Current Database State

Run this to check what's in your database:

```bash
# From backend directory
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Artisan = mongoose.model('Artisan', new mongoose.Schema({}, {strict: false}));
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  console.log('Artisans:', await Artisan.countDocuments());
  console.log('Users:', await User.countDocuments());
  console.log('Demo Artisans:', await Artisan.countDocuments({email: /@demo\.kalasetu\.com$/}));
  console.log('Demo Users:', await User.countDocuments({email: /@kalasetu\.com$/}));
  await mongoose.connection.close();
  process.exit(0);
});
"
```

---

## 🎬 Demo Scenario Examples

### Scenario 1: Customer Finds & Books Artisan
1. Login as `demo.user@kalasetu.com`
2. Browse artisans or use search
3. View profile of `Rajesh Patil` (Pottery)
4. Check his location (MIT-WPU, Kothrud)
5. See ratings and reviews
6. Click "Book Now" or "Contact"
7. Add to bookmarks

### Scenario 2: Artisan Manages Profile
1. Login as `rajesh.patil@demo.kalasetu.com`
2. View dashboard
3. Edit business hours
4. Upload portfolio images
5. View booking requests
6. Respond to customer messages

### Scenario 3: User Manages Bookmarks
1. Login as `test.customer@kalasetu.com`
2. View bookmarks (already has 3-6)
3. Browse for more artisans
4. Add new bookmark
5. Remove old bookmark
6. Compare bookmarked artisans

---

## 🔧 NPM Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run seed` | Seed 20 demo artisans |
| `npm run seed:users` | Seed 3 demo users with bookmarks |
| `npm run seed:all` | Seed artisans + users |
| `npm run cleanup:dry` | Preview what will be deleted |
| `npm run cleanup` | Delete non-demo data |
| `npm run verify:demos` | Verify demo artisan emails |
| `npm run dev` | Start backend server |

---

## 📍 Local URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API**: http://localhost:5000/api

---

## 🆘 Troubleshooting

### Users can't see bookmarks?
```bash
# Re-seed users
npm run seed:users
```

### Artisans not showing?
```bash
# Verify demo artisans
npm run verify:demos
```

### Database is messy?
```bash
# Clean and re-seed
npm run cleanup && npm run seed:all
```

### Need fresh start?
```bash
# Delete everything and start over
# (Be careful! This removes ALL data)
# Then:
npm run seed:all
```

---

## 📚 Documentation

- **Complete Guide**: `docs/DEMO_USERS.md`
- **Artisan Setup**: `docs/DEMO_VERIFICATION.md`
- **Quick Reference**: `DEMO_QUICK_REF.md`
- **Email Setup**: `docs/EMAIL_SETUP.md`

---

## ✨ Next Steps

1. ✅ Run `npm run seed:all` (if not done)
2. 🚀 Start servers (backend + frontend)
3. 🧪 Test user login
4. 👀 Check bookmarks
5. 🎨 Test artisan profiles
6. 📱 Test on mobile (responsive design)
7. 🎬 Prepare demo script for presentation

---

**Status**: ✅ All demo data configured and ready!

**Last Updated**: After adding demo users with bookmarks
