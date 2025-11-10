// FILE: kalasetu-backend/scripts/wipeAllAccounts.js
// Danger: Deletes ALL users and artisans
// Usage: node scripts/wipeAllAccounts.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';

dotenv.config();

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGO_URI/MONGODB_URI not set');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (e) {
    console.error('❌ Failed DB connection:', e.message);
    process.exit(1);
  }
}

async function wipeAll() {
  const userCount = await User.countDocuments();
  const artisanCount = await Artisan.countDocuments();
  console.log(`\nAbout to delete ${userCount} users and ${artisanCount} artisans.`);
  console.log('This is irreversible. Make sure you have a backup.\n');

  const userResult = await User.deleteMany({});
  const artisanResult = await Artisan.deleteMany({});

  console.log('🗑️  Deleted users:', userResult.deletedCount);
  console.log('🗑️  Deleted artisans:', artisanResult.deletedCount);
}

async function run() {
  try {
    await connectDB();
    await wipeAll();
  } catch (err) {
    console.error('❌ Error wiping accounts:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

run();


