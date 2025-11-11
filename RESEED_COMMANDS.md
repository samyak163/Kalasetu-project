# Database Reseed Commands

## Complete Reseed Sequence

To completely reset and reseed the database with new sample data:

### Step 1: Navigate to Backend Directory
```bash
cd kalasetu-backend
```

### Step 2: Run the Seed Script
```bash
npm run seed:core
```

This will:
- Wipe all existing users, artisans, bookings, services, and categories
- Create new categories (Handicrafts, Home Services, Food & Catering, Clothing & Tailoring, Wellness & Beauty)
- Create 25 sample artisans (5 per category) with:
  - Locations near MITWPU, Kothrud, Pune (18.518408915633827, 73.81513915383768)
  - Working placeholder images
  - Services for each artisan
  - Verified and active status

### Alternative: Individual Commands

If you need to run specific operations:

```bash
# Check existing artisans
npm run check:artisans

# Clean up profiles (keeps demo artisans)
npm run cleanup

# Dry run cleanup (see what would be deleted)
npm run cleanup:dry

# Wipe all accounts
npm run wipe:all

# Then reseed
npm run seed:core
```

## After Reseeding

After running the seed script:
1. All sample artisans will be located near MITWPU, Kothrud, Pune
2. They will appear on the homepage "Nearby Artisans" section
3. Images will be working placeholder images
4. Each artisan will have at least one service
5. All artisans will be verified and active

## Notes

- Default password for all sample artisans: `Password123`
- Email format: `{service-name}.{number}@sample.kalasetu.com`
- All artisans are verified and active by default
- Locations are spread within ~2km radius of MITWPU

