// Seed core categories, suggested services, and 25 verified artisans (one per service)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Category from '../models/categoryModel.js';
import Artisan from '../models/artisanModel.js';
import ArtisanService from '../models/artisanServiceModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';

dotenv.config();

const CATEGORIES = [
  {
    name: 'Handicrafts',
    slug: 'handicrafts',
    suggestedServices: [
      { name: 'Pottery' },
      { name: 'Wood Carving' },
      { name: 'Jewelry Making' },
      { name: 'Bamboo Craft' },
      { name: 'Glass Art' },
    ],
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    suggestedServices: [
      { name: 'Plumber' },
      { name: 'Electrician' },
      { name: 'Carpenter' },
      { name: 'Painter' },
      { name: 'House Cleaning' },
    ],
  },
  {
    name: 'Food & Catering',
    slug: 'food-catering',
    suggestedServices: [
      { name: 'Home Chef' },
      { name: 'Tiffin Service' },
      { name: 'Baker' },
      { name: 'Caterer' },
      { name: 'Snack Stall' },
    ],
  },
  {
    name: 'Clothing & Tailoring',
    slug: 'clothing-tailoring',
    suggestedServices: [
      { name: 'Tailor' },
      { name: 'Embroidery' },
      { name: 'Boutique Designer' },
      { name: 'Alterations' },
      { name: 'Block Printing' },
    ],
  },
  {
    name: 'Wellness & Beauty',
    slug: 'wellness-beauty',
    suggestedServices: [
      { name: 'Beautician' },
      { name: 'Makeup Artist' },
      { name: 'Mehendi Artist' },
      { name: 'Hair Stylist' },
      { name: 'Massage Therapist' },
    ],
  },
];

const EXTRA_SERVICES = ['Event Setup', 'Photography', 'Home Organizer', 'Gardening', 'Pet Care'];

const CATEGORY_IMAGES = {
  Handicrafts: {
    profile: 'https://images.unsplash.com/photo-1503389152951-9f343605f61e?q=80&w=600&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=800&auto=format&fit=crop',
    ],
  },
  'Home Services': {
    profile: 'https://images.unsplash.com/photo-1512412046876-f3851adb218e?q=80&w=600&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
    ],
  },
  'Food & Catering': {
    profile: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?q=80&w=800&auto=format&fit=crop',
    ],
  },
  'Clothing & Tailoring': {
    profile: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    ],
  },
  'Wellness & Beauty': {
    profile: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    ],
  },
};

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI/MONGODB_URI missing');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}

async function wipeAll() {
  await Promise.all([
    User.deleteMany({}),
    Artisan.deleteMany({}),
    Booking.deleteMany({}),
    ArtisanService.deleteMany({}),
    Category.deleteMany({}),
  ]);
  console.log('🗑️  Wiped users, artisans, bookings, services, categories');
}

async function seedCategories() {
  const docs = await Category.insertMany(
    CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      image: '',
      suggestedServices: c.suggestedServices,
      active: true,
    }))
  );
  await Category.create({
    name: 'Extra Services',
    slug: 'extra-services',
    image: '',
    suggestedServices: EXTRA_SERVICES.map((name) => ({ name })),
    active: false,
  });
  console.log(`✅ Inserted categories: ${docs.length} + extra services`);
  return docs;
}

function generateArtisanProfile(serviceName, categoryName, idx) {
  const fullName = `${serviceName} Specialist ${idx + 1}`;
  const imageSet = CATEGORY_IMAGES[categoryName] || CATEGORY_IMAGES.Handicrafts;
  
  // Kothrud, Pune coordinates: approximately 18.5083° N, 73.8070° E
  // Spread artisans around Kothrud area with small variations
  const baseLat = 18.5083;
  const baseLng = 73.8070;
  const latVariation = (idx % 5) * 0.01 - 0.02; // -0.02 to 0.02
  const lngVariation = (Math.floor(idx / 5) % 5) * 0.01 - 0.02; // -0.02 to 0.02
  
  return {
    fullName,
    email: `${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${idx + 1}@sample.kalasetu.com`,
    phoneNumber: `+9199${(10000000 + idx).toString().slice(0, 8)}`,
    password: 'Password123',
    craft: categoryName,
    businessName: `${serviceName} Services`,
    tagline: `Expert ${serviceName}`,
    bio: `Experienced ${serviceName} offering professional services to customers across Pune, especially in Kothrud and nearby areas. Quality and customer satisfaction guaranteed.`,
    yearsOfExperience: '5+ years',
    teamSize: 'Solo',
    languagesSpoken: ['English', 'Hindi', 'Marathi'],
    emailVerified: true,
    isVerified: true,
    isActive: true,
    profileImageUrl: imageSet.profile,
    coverImageUrl: imageSet.cover,
    portfolioImageUrls: imageSet.gallery,
    businessPhone: `+9198${(10000000 + idx).toString().slice(0, 8)}`,
    location: {
      type: 'Point',
      coordinates: [baseLng + lngVariation, baseLat + latVariation],
      address: 'Kothrud, Pune, Maharashtra',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411038',
    },
  };
}

async function seedArtisansAndServices(categories) {
  let createdServices = 0;
  let idx = 0;
  for (const cat of categories) {
    for (const s of cat.suggestedServices) {
      const profile = generateArtisanProfile(s.name, cat.name, idx++);
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(profile.password, salt);
      const artisan = await Artisan.create({
        ...profile,
        password: hashed,
      });
      await ArtisanService.create({
        artisan: artisan._id,
        category: cat._id,
        categoryName: cat.name,
        name: s.name,
        description: profile.bio,
        price: 0,
        durationMinutes: 60,
        images: CATEGORY_IMAGES[cat.name]?.gallery || [],
        isActive: true,
      });
      createdServices++;
    }
  }
  console.log(`✅ Created artisans and services: ${createdServices}`);
}

async function run() {
  try {
    await connectDB();
    await wipeAll();
    const cats = await seedCategories();
    await seedArtisansAndServices(cats);
    console.log('🎉 Core data seeding complete');
  } catch (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

run();


