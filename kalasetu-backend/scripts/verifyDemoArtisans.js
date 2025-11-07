// FILE: kalasetu-backend/scripts/verifyDemoArtisans.js
// Updates all demo artisans (ending with @demo.kalasetu.com) to be email verified
// Usage: node scripts/verifyDemoArtisans.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';

dotenv.config();

// Demo artisan emails (from seed script)
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

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (e) {
    console.error('❌ Failed DB connection:', e.message);
    process.exit(1);
  }
}

async function verifyDemoArtisans() {
  console.log('\n🔐 Verifying Demo Artisans...\n');

  try {
    // Find all demo artisans
    const demoArtisans = await Artisan.find({
      email: { $in: DEMO_ARTISAN_EMAILS }
    });

    console.log(`📊 Found ${demoArtisans.length} demo artisans in database`);

    // Check verification status
    const unverified = demoArtisans.filter(a => !a.emailVerified);
    const verified = demoArtisans.filter(a => a.emailVerified);

    console.log(`✅ Already verified: ${verified.length}`);
    console.log(`⏳ Need verification: ${unverified.length}\n`);

    if (unverified.length === 0) {
      console.log('✨ All demo artisans are already verified!\n');
      return;
    }

    // Update unverified artisans
    console.log('🔧 Updating unverified demo artisans...\n');

    const result = await Artisan.updateMany(
      {
        email: { $in: DEMO_ARTISAN_EMAILS },
        emailVerified: { $ne: true }
      },
      {
        $set: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          isActive: true,
          isVerified: true,
          'location.address': 'Pune, Maharashtra, India',
          'location.city': 'Pune',
          'location.state': 'Maharashtra',
          'location.country': 'India',
          'location.postalCode': '411001',
          'location.coordinates': [73.8567, 18.5204],
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} artisans`);
    
    // Show updated artisans
    if (result.modifiedCount > 0) {
      console.log('\n📋 Newly verified artisans:');
      unverified.forEach(a => {
        console.log(`   ✓ ${a.fullName} (${a.email})`);
      });
    }

    console.log('\n🎉 All demo artisans are now verified and will show on website!');
    console.log('🌐 They can now:');
    console.log('   • Appear in search results');
    console.log('   • Be visible on artisan listings');
    console.log('   • Accept bookings and messages');
    console.log('   • Login without email verification\n');

  } catch (error) {
    console.error('❌ Error verifying artisans:', error);
    throw error;
  }
}

async function run() {
  await connectDB();
  try {
    await verifyDemoArtisans();
  } catch (e) {
    console.error('❌ Script failed:', e);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB connection closed\n');
  }
}

run();
