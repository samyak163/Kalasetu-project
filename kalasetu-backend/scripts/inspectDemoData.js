// Inspect current database state - shows what demo data exists
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import Project from '../models/Project.js';
import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import Review from '../models/reviewModel.js';
import CallHistory from '../models/callHistoryModel.js';

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

async function inspect() {
  console.log('📊 DATABASE INSPECTION REPORT');
  console.log('═'.repeat(80));
  
  // Artisans
  const totalArtisans = await Artisan.countDocuments();
  const demoArtisans = await Artisan.find({ email: /@demo\.kalasetu\.com$/i }).select('fullName email craft emailVerified isVerified');
  const verifiedArtisans = await Artisan.countDocuments({ emailVerified: true });
  
  console.log('\n🎨 ARTISANS');
  console.log('─'.repeat(80));
  console.log(`Total artisans: ${totalArtisans}`);
  console.log(`Verified artisans: ${verifiedArtisans}`);
  console.log(`Demo artisans (@demo.kalasetu.com): ${demoArtisans.length}`);
  
  if (demoArtisans.length > 0) {
    console.log('\nDemo artisan list:');
    demoArtisans.forEach((a, i) => {
      const verified = a.emailVerified && a.isVerified ? '✅' : '❌';
      console.log(`  ${i + 1}. ${verified} ${a.fullName.padEnd(30)} | ${a.email.padEnd(40)} | ${a.craft || 'N/A'}`);
    });
  }
  
  // Users
  const totalUsers = await User.countDocuments();
  const demoUsers = await User.find({ email: /@kalasetu\.com$/i }).select('fullName email bookmarks');
  const usersWithBookmarks = await User.countDocuments({ bookmarks: { $exists: true, $ne: [] } });
  
  console.log('\n\n👥 USERS');
  console.log('─'.repeat(80));
  console.log(`Total users: ${totalUsers}`);
  console.log(`Users with bookmarks: ${usersWithBookmarks}`);
  console.log(`Demo users (@kalasetu.com): ${demoUsers.length}`);
  
  if (demoUsers.length > 0) {
    console.log('\nDemo user list:');
    demoUsers.forEach((u, i) => {
      const bookmarkCount = u.bookmarks?.length || 0;
      console.log(`  ${i + 1}. ${u.fullName.padEnd(25)} | ${u.email.padEnd(35)} | ${bookmarkCount} bookmarks`);
    });
  }
  
  // Projects
  const totalProjects = await Project.countDocuments();
  const projectsByArtisan = await Project.aggregate([
    { $group: { _id: '$artisan', count: { $sum: 1 } } },
    { $count: 'artisansWithProjects' }
  ]);
  
  console.log('\n\n📁 PROJECTS (Portfolio)');
  console.log('─'.repeat(80));
  console.log(`Total projects: ${totalProjects}`);
  console.log(`Artisans with projects: ${projectsByArtisan[0]?.artisansWithProjects || 0}`);
  
  // Bookings
  const totalBookings = await Booking.countDocuments();
  const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
  
  console.log('\n\n📅 BOOKINGS');
  console.log('─'.repeat(80));
  console.log(`Total bookings: ${totalBookings}`);
  console.log(`Confirmed bookings: ${confirmedBookings}`);
  
  // Payments
  const totalPayments = await Payment.countDocuments();
  const capturedPayments = await Payment.countDocuments({ status: 'captured' });
  
  console.log('\n\n💳 PAYMENTS');
  console.log('─'.repeat(80));
  console.log(`Total payments: ${totalPayments}`);
  console.log(`Captured payments: ${capturedPayments}`);
  
  // Reviews
  const totalReviews = await Review.countDocuments();
  const verifiedReviews = await Review.countDocuments({ isVerified: true });
  
  console.log('\n\n⭐ REVIEWS');
  console.log('─'.repeat(80));
  console.log(`Total reviews: ${totalReviews}`);
  console.log(`Verified reviews: ${verifiedReviews}`);
  
  // Call History
  const totalCalls = await CallHistory.countDocuments();
  const completedCalls = await CallHistory.countDocuments({ status: 'completed' });
  
  console.log('\n\n📞 CALL HISTORY');
  console.log('─'.repeat(80));
  console.log(`Total calls: ${totalCalls}`);
  console.log(`Completed calls: ${completedCalls}`);
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 INSPECTION COMPLETE\n');
}

async function run() {
  await connectDB();
  try {
    await inspect();
  } catch (e) {
    console.error('❌ Inspection failed:', e);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB connection closed\n');
  }
}

run();
