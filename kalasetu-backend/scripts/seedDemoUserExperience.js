import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/userModel.js';
import { seedDemoDataForUsers } from '../utils/demoSeed.js';

dotenv.config();

async function run() {
  await connectDB();

  try {
    const emailArg = process.argv.find((arg) => arg.startsWith('--email='));
    const email = emailArg ? emailArg.split('=')[1] : null;

    const query = email ? { email: email.toLowerCase().trim() } : {};
    const users = await User.find(query).lean();

    if (!users.length) {
      console.log(email ? `No users found for ${email}` : 'No users found in database.');
      return;
    }

    console.log(`Seeding demo data for ${users.length} user(s)...`);
    await seedDemoDataForUsers(users);
    console.log('✅ Demo data seeded successfully.');
  } catch (error) {
    console.error('Failed to seed demo data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

run();


