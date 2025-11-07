// Script to create sample chat channels between demo users and demo artisans
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';
import connectDB from '../config/db.js';
import { upsertStreamUser, createDirectMessageChannel } from '../utils/streamChat.js';

dotenv.config();

async function seedSampleChats() {
  await connectDB();
  const demoArtisans = await Artisan.find({ email: /@demo.kalasetu.com$/ });
  const demoUsers = await User.find({ email: /@demo.kalasetu.com$/ });
  if (!demoArtisans.length || !demoUsers.length) {
    console.log('No demo artisans or users found. Run seed scripts first.');
    mongoose.connection.close();
    return;
  }
  for (const user of demoUsers) {
    await upsertStreamUser(user);
    for (const artisan of demoArtisans.slice(0, 3)) {
      await upsertStreamUser(artisan);
      await createDirectMessageChannel(user._id.toString(), artisan._id.toString());
      console.log(`Created sample chat channel between ${user.email} and ${artisan.email}`);
    }
  }
  mongoose.connection.close();
}

seedSampleChats().catch(e => { console.error(e); mongoose.connection.close(); });
