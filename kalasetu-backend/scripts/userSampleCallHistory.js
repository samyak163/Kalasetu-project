// Script to add sample call history to new users (for demo)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';
import CallHistory from '../models/callHistoryModel.js';
import connectDB from '../config/db.js';

dotenv.config();

async function addSampleCallHistoryToUsers() {
  await connectDB();
  const demoArtisans = await Artisan.find({ email: /@demo.kalasetu.com$/ });
  if (!demoArtisans.length) {
    console.log('No demo artisans found. Run seedDemoArtisans.js first.');
    mongoose.connection.close();
    return;
  }
  for (const user of await User.find({})) {
    const existing = await CallHistory.findOne({ user: user._id });
    if (existing) continue; // skip if user already has call history
    const sample = demoArtisans.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const artisan of sample) {
      await CallHistory.create({
        artisan: artisan._id,
        user: user._id,
        startedAt: new Date(Date.now() - Math.floor(Math.random() * 100000000)),
        endedAt: new Date(),
        durationSec: Math.floor(Math.random() * 600) + 60,
        type: 'video',
        status: 'completed',
      });
    }
    console.log(`Added sample call history to user: ${user.email}`);
  }
  mongoose.connection.close();
}

addSampleCallHistoryToUsers().catch(e => { console.error(e); mongoose.connection.close(); });
