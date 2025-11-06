// FILE: kalasetu-backend/scripts/cleanupProfiles.js
// Usage:
//   node scripts/cleanupProfiles.js --dry-run     (shows what would be deleted)
//   node scripts/cleanupProfiles.js               (performs deletion)
//
// This script removes all Artisan and User documents EXCEPT the seeded demo artisans
// defined by email list below. It does NOT touch Admin documents.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';

dotenv.config();

// Demo artisan emails preserved (from seedArtisans.js)
const DEMO_ARTISAN_EMAILS = [
  'rajesh.patil@demo.kalasetu.com',
  'priya.sharma@demo.kalasetu.com',
  'amit.kulkarni@demo.kalasetu.com',
  'sneha.deshmukh@demo.kalasetu.com',
  'vikram.pawar@demo.kalasetu.com',
  'anita.joshi@demo.kalasetu.com',
  'suresh.bhosale@demo.kalasetu.com',
  'meera.kale@demo.kalasetu.com',
  'ganesh.jadhav@demo.kalasetu.com',
  'kavita.thorat@demo.kalasetu.com',
  'rahul.shinde@demo.kalasetu.com',
  'pooja.mahajan@demo.kalasetu.com',
  'anil.mane@demo.kalasetu.com',
  'sunita.rane@demo.kalasetu.com',
  'deepak.gaikwad@demo.kalasetu.com',
  'lata.patwardhan@demo.kalasetu.com',
  'sachin.nikam@demo.kalasetu.com',
  'vaishali.sawant@demo.kalasetu.com',
  'mangesh.kadam@demo.kalasetu.com',
  'asha.deshpande@demo.kalasetu.com',
];

const isDryRun = process.argv.includes('--dry-run');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (e) {
    console.error('❌ Failed DB connection:', e.message);
    process.exit(1);
  }
}

async function cleanup() {
  console.log('\n🧹 Starting profile cleanup');
  console.log(`🔒 Preserving ${DEMO_ARTISAN_EMAILS.length} demo artisans`);
  console.log(isDryRun ? '💡 Dry run mode (no deletions will occur)' : '⚠️ LIVE mode (documents will be deleted)');

  // Artisans to delete: all whose email NOT in the preserve list OR missing email
  const artisansToDelete = await Artisan.find({
    $or: [
      { email: { $nin: DEMO_ARTISAN_EMAILS } },
      { email: { $exists: false } },
    ],
  }).select('email fullName');

  const usersToDelete = await User.find({}).select('email fullName');

  console.log(`\n📦 Found artisans total: ${(await Artisan.countDocuments())}`);
  console.log(`   → Will delete: ${artisansToDelete.length}`);
  console.log(`   → Will keep: ${DEMO_ARTISAN_EMAILS.length}`);
  console.log(`👥 Found users total: ${(await User.countDocuments())}`);
  console.log(`   → Will delete all users: ${usersToDelete.length}`);

  if (isDryRun) {
    console.log('\n🔍 Dry-run listing (first 15 artisans to delete):');
    artisansToDelete.slice(0, 15).forEach(a => {
      console.log(`   - ${a.fullName || '(no name)'} | ${a.email || '(no email)'}`);
    });
    console.log('\n🔍 Dry-run listing (first 15 users):');
    usersToDelete.slice(0, 15).forEach(u => {
      console.log(`   - ${u.fullName || '(no name)'} | ${u.email || '(no email)'}`);
    });
    console.log('\n✅ Dry run complete. Re-run without --dry-run to perform deletions.');
    return;
  }

  // Perform deletions
  const artisanEmailsDeleted = artisansToDelete.map(a => a.email).filter(Boolean);
  await Artisan.deleteMany({ _id: { $in: artisansToDelete.map(a => a._id) } });
  await User.deleteMany({ _id: { $in: usersToDelete.map(u => u._id) } });

  console.log('\n🗑️ Deleted artisans:', artisanEmailsDeleted.length);
  console.log('🗑️ Deleted users:', usersToDelete.length);
  console.log('📊 Remaining artisans:', await Artisan.countDocuments());
  console.log('📊 Remaining users:', await User.countDocuments());
  console.log('\n✅ Cleanup complete');
}

async function run() {
  await connectDB();
  try {
    await cleanup();
  } catch (e) {
    console.error('❌ Cleanup failed:', e);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB connection closed');
  }
}

run();
