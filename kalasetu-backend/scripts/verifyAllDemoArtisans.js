// Verify ALL artisans ending with @demo.kalasetu.com
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (e) {
    console.error('❌ Failed DB connection:', e.message);
    process.exit(1);
  }
}

async function verifyAllDemoArtisans() {
  console.log('🔐 Verifying ALL Demo Artisans...\n');

  try {
    // Find all artisans with @demo.kalasetu.com email
    const demoArtisans = await Artisan.find({
      email: /@demo\.kalasetu\.com$/i
    });

    console.log(`📊 Found ${demoArtisans.length} demo artisans in database`);

    // Check verification status
    const unverified = demoArtisans.filter(a => !a.emailVerified || !a.isVerified || !a.isActive);
    const verified = demoArtisans.filter(a => a.emailVerified && a.isVerified && a.isActive);

    console.log(`✅ Already verified: ${verified.length}`);
    console.log(`⏳ Need verification: ${unverified.length}\n`);

    if (unverified.length === 0) {
      console.log('✨ All demo artisans are already verified!\n');
      return;
    }

    // Update ALL demo artisans with @demo.kalasetu.com
    console.log('🔧 Updating unverified demo artisans...\n');

    const result = await Artisan.updateMany(
      {
        email: /@demo\.kalasetu\.com$/i,
        $or: [
          { emailVerified: { $ne: true } },
          { isVerified: { $ne: true } },
          { isActive: { $ne: true } }
        ]
      },
      {
        $set: {
          emailVerified: true,
          isVerified: true,
          isActive: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
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
    await verifyAllDemoArtisans();
  } catch (e) {
    console.error('❌ Script failed:', e);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB connection closed\n');
  }
}

run();
