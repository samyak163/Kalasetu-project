// FILE: kalasetu-backend/scripts/seedDemoUsers.js
// Creates demo users with bookmarks, history, and interactions with demo artisans
// Usage: node scripts/seedDemoUsers.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';

dotenv.config();

// Demo user data
const DEMO_USERS = [
  {
    fullName: 'Demo User',
    email: 'demo.user@kalasetu.com',
    password: 'DemoUser123',
    emailVerified: true,
  },
  {
    fullName: 'Test Customer',
    email: 'test.customer@kalasetu.com',
    password: 'TestCustomer123',
    emailVerified: true,
  },
  {
    fullName: 'Sample Buyer',
    email: 'sample.buyer@kalasetu.com',
    password: 'SampleBuyer123',
    emailVerified: true,
  }
];

// Demo artisan emails to use for bookmarks
const DEMO_ARTISAN_EMAILS = [
  'rajesh.patil@demo.kalasetu.com',
  'priya.sharma@demo.kalasetu.com',
  'amit.kulkarni@demo.kalasetu.com',
  'sneha.deshmukh@demo.kalasetu.com',
  'vikram.pawar@demo.kalasetu.com',
  'anita.joshi@demo.kalasetu.com',
  'suresh.bhosale@demo.kalasetu.com',
  'meera.kale@demo.kalasetu.com',
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (e) {
    console.error('❌ Failed DB connection:', e.message);
    process.exit(1);
  }
}

async function seedDemoUsers() {
  try {
    console.log('\n👥 Starting to seed demo users...\n');

    // Fetch demo artisans to bookmark
    const demoArtisans = await Artisan.find({
      email: { $in: DEMO_ARTISAN_EMAILS }
    }).select('_id email fullName craft');

    if (demoArtisans.length === 0) {
      console.log('⚠️  No demo artisans found. Run "npm run seed" first to create demo artisans.');
      return;
    }

    console.log(`📊 Found ${demoArtisans.length} demo artisans to use for bookmarks\n`);
    console.log('─'.repeat(70));

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < DEMO_USERS.length; i++) {
      const userData = DEMO_USERS[i];

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      // Select random artisans for bookmarks (3-6 bookmarks per user)
      const numBookmarks = Math.floor(Math.random() * 4) + 3; // 3 to 6
      const shuffled = [...demoArtisans].sort(() => 0.5 - Math.random());
      const bookmarkedArtisans = shuffled.slice(0, numBookmarks);
      const bookmarkIds = bookmarkedArtisans.map(a => a._id);

      if (existingUser) {
        // Update existing user with bookmarks
        existingUser.bookmarks = bookmarkIds;
        existingUser.emailVerified = true;
        await existingUser.save({ validateBeforeSave: false });

        console.log(`🔄 Updated: ${userData.fullName.padEnd(20)} | ${userData.email}`);
        console.log(`   📌 Bookmarks: ${bookmarkedArtisans.map(a => a.fullName).join(', ')}`);
        updatedCount++;
      } else {
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = new User({
          fullName: userData.fullName,
          email: userData.email,
          password: hashedPassword,
          emailVerified: userData.emailVerified,
          bookmarks: bookmarkIds,
        });

        await newUser.save();

        console.log(`✅ Created: ${userData.fullName.padEnd(20)} | ${userData.email}`);
        console.log(`   📌 Bookmarks: ${bookmarkedArtisans.map(a => a.fullName).join(', ')}`);
        createdCount++;
      }
    }

    console.log('─'.repeat(70));
    console.log('\n🎉 Demo user seeding complete!\n');
    console.log(`✅ Created: ${createdCount} users`);
    console.log(`🔄 Updated: ${updatedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`📊 Total users in database: ${await User.countDocuments()}`);

    console.log('\n🔐 Demo User Login Credentials:');
    console.log('─'.repeat(70));
    DEMO_USERS.forEach(user => {
      console.log(`Email:    ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log('');
    });
    console.log('─'.repeat(70));

    console.log('\n✨ Features to Test:');
    console.log('  ✓ Login as demo user');
    console.log('  ✓ View bookmarked artisans');
    console.log('  ✓ Search for artisans by craft');
    console.log('  ✓ View artisan profiles');
    console.log('  ✓ Add/remove bookmarks');
    console.log('  ✓ Browse artisan listings');

    console.log('\n🚀 Next Steps:');
    console.log('  1. Start your frontend: cd kalasetu-frontend && npm run dev');
    console.log('  2. Login with any demo user credentials above');
    console.log('  3. View bookmarked artisans in your profile');
    console.log('  4. Browse and interact with artisans\n');

  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
}

async function run() {
  await connectDB();
  await seedDemoUsers();
}

run();
