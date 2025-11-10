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
  return {
    fullName,
    email: `${serviceName.toLowerCase().replace(/\s+/g, '-')}.${idx + 1}@sample.kalasetu.com`,
    phoneNumber: `+9199${(10000000 + idx).toString().slice(0, 8)}`,
    password: 'Password123',
    craft: categoryName,
    businessName: `${serviceName} Services`,
    tagline: `Expert ${serviceName}`,
    bio: `Experienced ${serviceName} offering professional services.`,
    yearsOfExperience: '5+ years',
    teamSize: 'Solo',
    languagesSpoken: ['English', 'Hindi'],
    emailVerified: true, // ensure verified
    isVerified: true,    // ensure verified flag
    isActive: true,
    location: {
      type: 'Point',
      coordinates: [73.8297, 18.5165], // Pune default
      address: 'Pune, Maharashtra',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411038',
    },
    profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=400&background=random&rounded=true`,
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
        images: [profile.profileImageUrl],
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


