import 'dotenv/config';
import mongoose from 'mongoose';
import CallHistory from '../models/callHistoryModel.js';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCallHistory = async () => {
  try {
    await connectDB();

    // Get sample users and artisans
    const users = await User.find().limit(3);
    const artisans = await Artisan.find().limit(5);

    if (users.length === 0 || artisans.length === 0) {
      console.log('⚠️  No users or artisans found. Please seed users and artisans first.');
      process.exit(0);
    }

    // Clear existing call history
    await CallHistory.deleteMany({});
    console.log('🗑️  Cleared existing call history');

    const callHistoryData = [];

    // Create 10 sample calls
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const artisan = artisans[Math.floor(Math.random() * artisans.length)];
      
      const daysAgo = Math.floor(Math.random() * 30); // Calls from last 30 days
      const startedAt = new Date();
      startedAt.setDate(startedAt.getDate() - daysAgo);
      startedAt.setHours(Math.floor(Math.random() * 12) + 9); // Between 9 AM - 9 PM
      startedAt.setMinutes(Math.floor(Math.random() * 60));

      const durationSec = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes in seconds
      const endedAt = new Date(startedAt.getTime() + durationSec * 1000);

      const statuses = ['completed', 'completed', 'completed', 'missed', 'cancelled'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      callHistoryData.push({
        user: user._id,
        artisan: artisan._id,
        startedAt,
        endedAt: status === 'completed' ? endedAt : undefined,
        durationSec: status === 'completed' ? durationSec : undefined,
        status,
        type: 'video',
      });
    }

    // Insert call history
    const calls = await CallHistory.insertMany(callHistoryData);
    console.log(`✅ Created ${calls.length} call history entries`);

    // Display sample data
    console.log('\n📊 Sample Call History:');
    calls.slice(0, 3).forEach((call, index) => {
      console.log(`\n${index + 1}. Call ID: ${call._id}`);
      console.log(`   User: ${call.user}`);
      console.log(`   Artisan: ${call.artisan}`);
      console.log(`   Started: ${call.startedAt}`);
      console.log(`   Status: ${call.status}`);
      if (call.durationSec) {
        console.log(`   Duration: ${Math.round(call.durationSec / 60)} minutes`);
      }
    });

    console.log('\n✅ Call history seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding call history:', error);
    process.exit(1);
  }
};

seedCallHistory();
