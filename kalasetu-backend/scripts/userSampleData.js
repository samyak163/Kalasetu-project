// Script to add sample bookmarks/history to new users (for demo)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';
import connectDB from '../config/db.js';

dotenv.config();

// Call this after user registration, or run as a script for all users
async function addSampleDataToUsers() {
  await connectDB();
  const demoArtisans = await Artisan.find({ email: /@demo.kalasetu.com$/ });
  if (!demoArtisans.length) {
    console.log('No demo artisans found. Run seedDemoArtisans.js first.');
    mongoose.connection.close();
    return;
  }
  // Pick 3 random artisans for bookmarks
  for (const user of await User.find({})) {
    if (user.bookmarks && user.bookmarks.length > 0) continue; // skip if already has bookmarks
    const sample = demoArtisans.sort(() => 0.5 - Math.random()).slice(0, 3);
    user.bookmarks = sample.map(a => a._id);
    user.save();
    console.log(`Added sample bookmarks to user: ${user.email}`);
  }
  mongoose.connection.close();
}

addSampleDataToUsers().catch(e => { console.error(e); mongoose.connection.close(); });
