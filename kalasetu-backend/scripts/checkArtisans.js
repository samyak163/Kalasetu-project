import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import ArtisanService from '../models/artisanServiceModel.js';

dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Missing MONGO_URI/MONGODB_URI in environment.');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const totalArtisans = await Artisan.countDocuments();
    const verifiedCount = await Artisan.countDocuments({ emailVerified: true, isVerified: true });
    console.log(`🧑‍🎨 Total artisans: ${totalArtisans}`);
    console.log(`✅ Verified artisans: ${verifiedCount}`);

    const artisans = await Artisan.find({}).sort({ createdAt: -1 }).limit(10).lean();
    for (const artisan of artisans) {
      const serviceCount = await ArtisanService.countDocuments({ artisan: artisan._id });
      console.log(`- ${artisan.fullName} (${artisan.publicId}) | ${artisan.craft} | services: ${serviceCount}`);
    }
  } catch (err) {
    console.error('❌ Error while checking artisans:', err);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connection closed');
  }
}

run();
