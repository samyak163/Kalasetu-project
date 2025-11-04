# 🌱 Artisan Database Seeding Guide

## Overview

The `seedArtisans.js` script populates your database with **20 realistic demo artisans** across various crafts in Pune. Perfect for testing and demos!

## Features

✅ **20 Diverse Artisans** - Different craft categories and experience levels  
✅ **Geolocation Data** - Real Pune coordinates for map and search features  
✅ **Complete Profiles** - Bios, ratings, reviews, working hours, and more  
✅ **Realistic Data** - Years of experience, team sizes, service radius, languages  
✅ **Auto-Generated Avatars** - Professional profile images for each artisan  
✅ **Demo Credentials** - Easy test accounts for manual testing  
✅ **Idempotent** - Safe to run multiple times (won't create duplicates)  

## Quick Start

### Step 1: Run the Seed Script

```bash
cd kalasetu-backend
npm run seed
```

Or run directly:
```bash
node scripts/seedArtisans.js
```

### Step 2: Watch the Output

The script will display:
- ✅ Each artisan created with their location
- 📊 Total count of artisans
- 🔐 Demo login credentials
- 📍 Artisan locations map
- ✨ Demo features overview

### Step 3: Start Your App

```bash
npm run dev
```

Your app is now ready with 20 demo artisans!

---

## Demo Credentials

### Primary Test Account

```
Email:    rajesh.patil@demo.kalasetu.com
Password: Password123
```

### All Demo Artisans

All demo artisans use the same password: **`Password123`**

Email format: `firstname.lastname@demo.kalasetu.com`

Examples:
- `priya.sharma@demo.kalasetu.com`
- `amit.kulkarni@demo.kalasetu.com`
- `sneha.deshmukh@demo.kalasetu.com`
- And 17 more...

---

## What Gets Created

### 20 Artisans Across These Crafts

| # | Artisan | Craft | Location | Experience |
|----|---------|-------|----------|-------------|
| 1 | Rajesh Patil | Pottery & Ceramics | Kothrud | 15+ years |
| 2 | Priya Sharma | Textiles & Weaving | Shivajinagar | 20+ years |
| 3 | Amit Kulkarni | Woodwork | Aundh | 12 years |
| 4 | Sneha Deshmukh | Jewelry & Metalwork | Baner | 10 years |
| 5 | Vikram Pawar | Leather Craft | Kalyani Nagar | 8 years |
| 6 | Anita Joshi | Painting & Art | Wakad | 18 years |
| 7 | Suresh Bhosale | Metal Craft | Pimple Saudagar | 22 years |
| 8 | Meera Kale | Embroidery & Stitching | Hinjewadi | 14 years |
| 9 | Ganesh Jadhav | Stone Work | Viman Nagar | 25 years |
| 10 | Kavita Thorat | Bamboo Craft | Deccan Gymkhana | 11 years |
| 11 | Rahul Shinde | Toys & Puppets | Kothrud | 9 years |
| 12 | Pooja Mahajan | Block Printing | Shivajinagar | 13 years |
| 13 | Anil Mane | Glass Art | Aundh | 16 years |
| 14 | Sunita Rane | Paper Craft | Baner | 7 years |
| 15 | Deepak Gaikwad | Cane & Rattan | Kalyani Nagar | 19 years |
| 16 | Lata Patwardhan | Folk Painting | Wakad | 17 years |
| 17 | Sachin Nikam | Natural Materials | Pimple Saudagar | 6 years |
| 18 | Vaishali Sawant | Decorative Art | Hinjewadi | 10 years |
| 19 | Mangesh Kadam | Metal Casting | Viman Nagar | 21 years |
| 20 | Asha Deshpande | Paper Quilling | Deccan Gymkhana | 5 years |

### Profile Data Includes

Each artisan has:
- ✅ Full name and email
- ✅ Phone number (WhatsApp number)
- ✅ Craft category and business name
- ✅ Professional tagline
- ✅ Detailed bio
- ✅ Years of experience
- ✅ Team size information
- ✅ Languages spoken (Marathi, Hindi, English)
- ✅ Business type (individual/small_business)
- ✅ Service radius (8-25 km)
- ✅ Real Pune location with coordinates
- ✅ Auto-generated profile image
- ✅ Working hours (Mon-Sat, closed Sundays)
- ✅ Business phone and WhatsApp
- ✅ Realistic stats:
  - Profile views: 10-110
  - Bookings: 5-55
  - Earnings: ₹10,000-₹60,000
  - Rating: 4.0-5.0 stars
  - Reviews: 5-35
  - Response rate: 90-100%
  - Acceptance rate: 85-100%

---

## Pune Locations Map

All artisans are scattered across 10 different areas of Pune:

```
Pune City Areas (with coordinates):
  🔴 Kothrud (73.8077, 18.5074)
  🔴 Shivajinagar (73.8449, 18.5304)
  🔴 Aundh (73.8077, 18.5591)
  🔴 Baner (73.7799, 18.5598)
  🔴 Kalyani Nagar (73.9056, 18.5489)
  🔴 Wakad (73.7549, 18.5978)
  🔴 Pimple Saudagar (73.8013, 18.5946)
  🔴 Hinjewadi (73.7279, 18.5913)
  🔴 Viman Nagar (73.9151, 18.5678)
  🔴 Deccan Gymkhana (73.8389, 18.5203)

Distance between locations: 2-10 km apart
```

### Perfect for Testing

- **Search Nearby:** Users can search for artisans within different radius (8-25 km)
- **Map View:** All 20 artisans with real coordinates appear on map
- **Geolocation:** Proper 2dsphere indexing works correctly
- **Distance Calculations:** Google Maps API integrations test correctly

---

## Usage Examples for Your Demo

### 🔍 **Search Nearby**
1. Open the app
2. Go to "Search Nearby"
3. See 20 artisans scattered across Pune
4. Filter by distance (5 km, 10 km, 20 km)
5. Click on artisan to see full profile

### 🏷️ **Filter by Craft**
1. Open search
2. Filter by category: "Pottery & Ceramics", "Jewelry", "Painting", etc.
3. Show variety of crafts available
4. Demonstrate diverse artisan community

### 👤 **View Profiles**
1. Click any artisan profile
2. Show complete information:
   - Professional bio
   - Experience and credentials
   - Ratings and reviews
   - Working hours
   - Service area
   - Contact options

### 📱 **Booking Flow** (if implemented)
1. Select an artisan
2. View availability
3. Create booking request
4. Demonstrate message/chat system
5. Show payment options

---

## Command Reference

### Run Seeding

```bash
# Basic seed
npm run seed

# Seed + Index to Algolia (if configured)
npm run seed:index
```

### Manual Command

```bash
cd kalasetu-backend
node scripts/seedArtisans.js
```

---

## Script Output Explanation

When you run the script, you'll see:

```
✅ MongoDB Connected
🌱 Starting to seed artisans...
📊 Total artisans to create: 20
📍 All artisans will be located in Pune

✅ Created: Rajesh Patil | Pottery & Ceramics | Kothrud
✅ Created: Priya Sharma | Textiles & Weaving | Shivajinagar
... (18 more artisans)

🎉 Seeding complete!
✅ Created: 20 artisans
📊 Total in database: 32  ← Includes existing artisans

🔐 Demo Login Credentials:
Email:    rajesh.patil@demo.kalasetu.com
Password: Password123

📍 Artisan Locations in Pune:
    1. Rajesh Patil → Kothrud
    2. Priya Sharma → Shivajinagar
    ... (18 more)

✨ Demo Features:
  ✓ Search Nearby
  ✓ Search by Craft
  ✓ View Profiles
  ✓ Map Integration
  ✓ Booking System

👋 Database connection closed
```

---

## Important Notes

### ✅ Safe to Run Multiple Times

The script checks if each artisan already exists before creating:

```javascript
const existingArtisan = await Artisan.findOne({ email: artisanData.email });
if (existingArtisan) {
  console.log(`⏭️  Skipping ${artisanData.fullName} - already exists`);
  continue;
}
```

**Won't create duplicates!**

### 🔒 Password Security

- Passwords are hashed with bcrypt (10 salt rounds)
- Safe to run in production
- Demo emails have `@demo.kalasetu.com` domain (easy to identify)

### 🗺️ Geolocation

- Uses proper GeoJSON format for MongoDB
- 2dsphere index enabled for proximity searches
- Real Pune coordinates ensure accurate distance calculations

### 📊 Realistic Metrics

- Random but realistic stats for:
  - Profile views (10-110)
  - Ratings (4.0-5.0 stars)
  - Reviews (5-35)
  - Bookings (5-55)
  - Earnings (₹10K-₹60K)

---

## Troubleshooting

### ❌ "MongoDB Connection Error"

**Problem:** Cannot connect to database

**Solution:**
1. Ensure MongoDB is running
2. Check `MONGO_URI` in `.env` file
3. Verify network connection to MongoDB

```bash
# Test connection
npm run dev  # Start server first
```

### ❌ "Email already exists"

**Problem:** Script says "already exist" for all artisans

**Solution:**
- Script is working correctly - it found existing artisans
- Safe to run again (won't create duplicates)
- If you want fresh artisans, delete old ones:

```bash
# In MongoDB
db.artisans.deleteMany({ email: { $regex: '@demo.kalasetu.com$' } })
# Then run seed again
npm run seed
```

### ⚠️ "All emails have @example.com"

**Problem:** Old seed script created @example.com emails

**Solution:**
- New script uses `@demo.kalasetu.com`
- Easy to identify and delete demo artisans
- Won't conflict with real user accounts

---

## Next Steps

### 1. **Start Your Application**
```bash
npm run dev
```

### 2. **Test Features**
- Search nearby artisans
- Filter by craft
- View profiles
- Check ratings and reviews

### 3. **(Optional) Index to Algolia**
If you have Algolia configured:
```bash
npm run seed:index
```

### 4. **Manual Testing**
Use demo credentials to log in as an artisan and test features

### 5. **Integration Testing**
- Test booking flow
- Test message system
- Test payment integration
- Test review system

---

## Schema Mapping

The seed script creates artisans with these schema fields:

```javascript
{
  publicId: "ks_a1b2c3d4",           // Auto-generated
  fullName: "Rajesh Patil",          // From data
  email: "rajesh.patil@demo...",    // From data
  phoneNumber: "+91987654321",       // From data
  password: "hashed_password",       // Hashed with bcrypt
  craft: "Pottery & Ceramics",       // From data
  businessName: "Patil Pottery...",  // From data
  tagline: "Traditional Pottery...", // From data
  bio: "Master potter with 15...",   // From data
  yearsOfExperience: "15+ years",    // From data
  teamSize: "2-5 people",            // From data
  languagesSpoken: ["Marathi", ...], // From data
  businessType: "small_business",    // From data
  serviceRadius: 15,                 // From data (km)
  location: {                        // GeoJSON Point
    type: "Point",
    coordinates: [73.8077, 18.5074],
    address: "Kothrud, Pune...",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    postalCode: "411038"
  },
  profileImageUrl: "https://ui-avatars.com...",  // Auto-generated
  workingHours: { ... },             // Mon-Sat 9-18, Sun closed
  profileViews: 45,                  // Random
  totalBookings: 28,                 // Random
  completedBookings: 26,             // Random
  averageRating: 4.5,                // Random 4.0-5.0
  totalReviews: 18,                  // Random 5-35
  responseRate: 95,                  // Random 90-100
  acceptanceRate: 92,                // Random 85-100
  // ... and many more fields
}
```

---

## Best Practices

### ✅ DO

- ✅ Run seed script before demos
- ✅ Use demo credentials for testing
- ✅ Keep demo artisans for testing reference
- ✅ Run multiple times (safe and idempotent)
- ✅ Show different artisan profiles to demonstrate variety

### ❌ DON'T

- ❌ Don't use demo credentials for production
- ❌ Don't modify @demo.kalasetu.com emails after creation
- ❌ Don't mix demo and real user data
- ❌ Don't rely on demo stats for accuracy (they're random)

---

## Support & Questions

If you encounter issues:

1. Check MongoDB connection: `npm run dev`
2. Verify `.env` file has `MONGO_URI`
3. Run script again (idempotent, safe)
4. Check script output for specific errors

---

**Happy Demoing! 🚀**
