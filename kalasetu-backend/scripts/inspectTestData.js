// Inspect and optionally clean test/fake data from MongoDB
// Usage: node scripts/inspectTestData.js          (inspect only)
//        node scripts/inspectTestData.js --clean   (remove test data)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const CLEAN = process.argv.includes('--clean');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db;

  // --- Payments ---
  const payments = await db.collection('payments').find({}).toArray();
  console.log(`=== PAYMENTS (${payments.length}) ===`);
  payments.forEach(p => {
    console.log(`  ID: ${p._id} | Amount: ₹${p.amount} | Status: ${p.status} | Purpose: ${p.purpose || '-'} | Created: ${p.createdAt}`);
  });

  // --- Bookings ---
  const bookings = await db.collection('bookings').find({}).toArray();
  console.log(`\n=== BOOKINGS (${bookings.length}) ===`);
  bookings.forEach(b => {
    console.log(`  ID: ${b._id} | Status: ${b.status} | Price: ₹${b.price || 0} | Service: ${b.serviceName || '-'} | Created: ${b.createdAt}`);
  });

  // --- Refunds ---
  const refunds = await db.collection('refunds').find({}).toArray();
  console.log(`\n=== REFUNDS (${refunds.length}) ===`);
  refunds.forEach(r => {
    console.log(`  ID: ${r._id} | Amount: ₹${r.amount} | Status: ${r.status} | Created: ${r.createdAt}`);
  });

  // --- Reviews ---
  const reviews = await db.collection('reviews').find({}).toArray();
  console.log(`\n=== REVIEWS (${reviews.length}) ===`);
  reviews.forEach(r => {
    console.log(`  ID: ${r._id} | Rating: ${r.rating} | Created: ${r.createdAt}`);
  });

  if (CLEAN) {
    console.log('\n🧹 CLEANING test data...');
    const pRes = await db.collection('payments').deleteMany({});
    const bRes = await db.collection('bookings').deleteMany({});
    const rRes = await db.collection('refunds').deleteMany({});
    const revRes = await db.collection('reviews').deleteMany({});
    console.log(`  Deleted ${pRes.deletedCount} payments`);
    console.log(`  Deleted ${bRes.deletedCount} bookings`);
    console.log(`  Deleted ${rRes.deletedCount} refunds`);
    console.log(`  Deleted ${revRes.deletedCount} reviews`);
    console.log('✅ Done — analytics will now show real zeros');
  } else {
    console.log('\n⚠️  Run with --clean to delete all the above data');
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
