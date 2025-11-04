# 🎯 Demo Checklist for Tomorrow

## ✅ Pre-Demo Setup (Do This Before Showing)

### 1. Seed the Database
```bash
cd kalasetu-backend
npm run seed
```

**Expected Output:**
- ✅ MongoDB Connected
- ✅ 20 artisans created across Pune
- ✅ Demo credentials displayed

### 2. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd kalasetu-backend
npm run dev
```
Should show: `✅ Server running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd kalasetu-frontend
npm run dev
```
Should show: `VITE v5.x.x ready in x.xx ms`

### 3. Open in Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/test

---

## 🎬 Demo Flow (10-15 minutes)

### Part 1: Login & Profile (2 min)

**Login as Artisan:**
```
Email:    rajesh.patil@demo.kalasetu.com
Password: Password123
```

**Show:**
- ✓ Successful login
- ✓ Dashboard with profile
- ✓ Profile completion status
- ✓ Working hours setup
- ✓ Availability settings

---

### Part 2: Search & Discovery (4-5 min)

**Navigate to Search:**

**Show Search Nearby:**
1. Click "Search Nearby"
2. See **20 artisans on map** across Pune
3. Filter by distance (5 km, 10 km, 15 km)
4. Demonstrate geolocation accuracy
5. Show artisan cards with images

**Show Search by Craft:**
1. Click category filter
2. Show diverse crafts:
   - Pottery & Ceramics
   - Jewelry & Metalwork
   - Textiles & Weaving
   - Wood Work
   - Painting & Art
   - Metal Craft
   - ... and 14 more

**Show Search Results:**
- Each result shows: photo, name, craft, rating, reviews
- Click to see full profile

---

### Part 3: Artisan Profile (3-4 min)

**Click on Any Artisan** (e.g., Rajesh Patil):

**Show Profile Section:**
- ✓ Professional photo
- ✓ Business name & tagline
- ✓ Detailed bio
- ✓ Experience level (15+ years)
- ✓ Team size
- ✓ Languages spoken
- ✓ Service radius

**Show Stats:**
- ✓ Rating: 4.5/5 ⭐
- ✓ Total reviews: 28
- ✓ Completed bookings: 26
- ✓ Response rate: 95%
- ✓ Acceptance rate: 92%

**Show Location:**
- ✓ Map with real Pune coordinates
- ✓ Address details
- ✓ Service radius circle

**Show Working Hours:**
- ✓ Monday-Saturday: 9 AM - 6 PM
- ✓ Sunday: Closed
- ✓ Emergency services available

**Show Contact Options:**
- ✓ Phone number
- ✓ WhatsApp button
- ✓ Message button (if chat implemented)

---

### Part 4: Features to Highlight (2-3 min)

**1. 20 Diverse Artisans** 🎨
- Different craft specialties
- Various experience levels (5-25 years)
- Spread across Pune (2-25 km range)

**2. Realistic Data** 📊
- Professional profiles
- Detailed bios
- Working hours setup
- Rating & review system
- Booking history

**3. Geolocation Integration** 🗺️
- Google Maps embedded
- Real Pune coordinates
- Distance-based search
- Service radius visualization

**4. Professional Presentation** 💼
- Auto-generated avatars
- Clean profile layouts
- Business information
- Contact details

---

## 🔐 Demo Credentials

### Primary Account:
```
Email:    rajesh.patil@demo.kalasetu.com
Password: Password123
```

### Other Test Artisans:
```
priya.sharma@demo.kalasetu.com       - Textiles & Weaving (20+ years)
amit.kulkarni@demo.kalasetu.com      - Woodwork (12 years)
sneha.deshmukh@demo.kalasetu.com     - Jewelry & Metalwork (10 years)
anita.joshi@demo.kalasetu.com        - Painting & Art (18 years)
suresh.bhosale@demo.kalasetu.com     - Metal Craft (22 years)
ganesh.jadhav@demo.kalasetu.com      - Stone Work (25 years)
```

**Password for all:** `Password123`

---

## 📱 Demo Data Overview

### 20 Artisans
- ✅ 20 different craft categories
- ✅ 5-25 years of experience
- ✅ Ratings: 4.0-5.0 ⭐
- ✅ Reviews: 5-35 per artisan
- ✅ Realistic booking stats

### 10 Pune Locations
- Kothrud, Shivajinagar, Aundh, Baner
- Kalyani Nagar, Wakad, Pimple Saudagar
- Hinjewadi, Viman Nagar, Deccan Gymkhana

### Complete Profiles
- Professional photos (auto-generated)
- Working hours setup
- Business information
- Contact details
- Service area (8-25 km)

---

## ⚠️ Things to Remember

### ✅ DO
- ✅ Show search nearby first (impressive with map)
- ✅ Click on different artisans to show variety
- ✅ Highlight the 20 different craft types
- ✅ Show realistic stats and ratings
- ✅ Mention eco-friendly and traditional crafts

### ❌ DON'T
- ❌ Don't mention @demo.kalasetu.com emails
- ❌ Don't show backend code or console logs
- ❌ Don't try features not yet implemented
- ❌ Don't worry about lint warnings (they're not breaking)

---

## 🎯 Key Talking Points

**"This is KalaSetu - connecting customers with local artisans"**

### Highlight:
1. **Diverse Craft Community** - 20 different traditional and modern crafts
2. **Local Expertise** - All artisans in Pune with real experience
3. **Discovery** - Easy search by location, craft, or name
4. **Trust** - Ratings, reviews, and verified profiles
5. **Convenience** - See working hours, contact info, service radius

---

## 🚀 Optional: Next Steps to Mention

If demo goes well:
- "We can integrate payment processing (Razorpay)"
- "Real-time chat system is ready (Stream Chat)"
- "Video consultation with Daily.co"
- "Email notifications and bookings"
- "Advanced analytics dashboard"

---

## 📋 Quick Troubleshooting

### ❌ App won't load?
**Solution:** Check both servers are running
```bash
npm run dev  # Start from project root or separate terminals
```

### ❌ No artisans showing?
**Solution:** Run seed script
```bash
npm run seed
```

### ❌ Map not showing?
**Solution:** Google Maps API key configured in `.env`

### ❌ Stuck on loading?
**Solution:** Clear cache and refresh (Ctrl+Shift+R)

---

## ✨ Demo Success Criteria

You know the demo is successful when:

✅ App loads cleanly  
✅ Login works with demo credentials  
✅ Search nearby shows 20 artisans on map  
✅ Filtering by craft works  
✅ Clicking profiles shows complete information  
✅ Ratings and reviews are displayed  
✅ Working hours are visible  
✅ Location map is accurate  

---

## 📝 Notes for Tomorrow

Write down:
- What features impressed your "mam" most
- Any questions they asked
- Feedback to incorporate
- Next features to build

---

**Good luck with your demo! 🎉**

**Questions? Check SEEDING_GUIDE.md for more details**
