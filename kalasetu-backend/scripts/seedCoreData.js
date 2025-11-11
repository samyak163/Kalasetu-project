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
    profile: 'https://placehold.co/400x400/A55233/FFFFFF?text=Handicrafts',
    cover: 'https://placehold.co/1200x400/A55233/FFFFFF?text=Handicrafts+Cover',
    gallery: [
      'https://placehold.co/800x600/A55233/FFFFFF?text=Handicraft+1',
      'https://placehold.co/800x600/A55233/FFFFFF?text=Handicraft+2',
      'https://placehold.co/800x600/A55233/FFFFFF?text=Handicraft+3',
    ],
  },
  'Home Services': {
    profile: 'https://placehold.co/400x400/2563EB/FFFFFF?text=Home+Services',
    cover: 'https://placehold.co/1200x400/2563EB/FFFFFF?text=Home+Services+Cover',
    gallery: [
      'https://placehold.co/800x600/2563EB/FFFFFF?text=Home+Service+1',
      'https://placehold.co/800x600/2563EB/FFFFFF?text=Home+Service+2',
      'https://placehold.co/800x600/2563EB/FFFFFF?text=Home+Service+3',
    ],
  },
  'Food & Catering': {
    profile: 'https://placehold.co/400x400/DC2626/FFFFFF?text=Food+Catering',
    cover: 'https://placehold.co/1200x400/DC2626/FFFFFF?text=Food+Catering+Cover',
    gallery: [
      'https://placehold.co/800x600/DC2626/FFFFFF?text=Food+1',
      'https://placehold.co/800x600/DC2626/FFFFFF?text=Food+2',
      'https://placehold.co/800x600/DC2626/FFFFFF?text=Food+3',
    ],
  },
  'Clothing & Tailoring': {
    profile: 'https://placehold.co/400x400/7C3AED/FFFFFF?text=Clothing',
    cover: 'https://placehold.co/1200x400/7C3AED/FFFFFF?text=Clothing+Cover',
    gallery: [
      'https://placehold.co/800x600/7C3AED/FFFFFF?text=Clothing+1',
      'https://placehold.co/800x600/7C3AED/FFFFFF?text=Clothing+2',
      'https://placehold.co/800x600/7C3AED/FFFFFF?text=Clothing+3',
    ],
  },
  'Wellness & Beauty': {
    profile: 'https://placehold.co/400x400/EC4899/FFFFFF?text=Wellness',
    cover: 'https://placehold.co/1200x400/EC4899/FFFFFF?text=Wellness+Cover',
    gallery: [
      'https://placehold.co/800x600/EC4899/FFFFFF?text=Wellness+1',
      'https://placehold.co/800x600/EC4899/FFFFFF?text=Wellness+2',
      'https://placehold.co/800x600/EC4899/FFFFFF?text=Wellness+3',
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
  
  // MITWPU, Kothrud, Pune coordinates: 18.518408915633827, 73.81513915383768
  // Spread artisans around MITWPU area with small variations (within 2km radius)
  const baseLat = 18.518408915633827;
  const baseLng = 73.81513915383768;
  // Create variations within ~2km radius (0.018 degrees ≈ 2km)
  const latVariation = ((idx % 5) * 0.003) - 0.006; // -0.006 to 0.006
  const lngVariation = ((Math.floor(idx / 5) % 5) * 0.003) - 0.006; // -0.006 to 0.006
  
  return {
    fullName,
    email: `${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${idx + 1}@sample.kalasetu.com`,
    phoneNumber: `+9199${(10000000 + idx).toString().slice(0, 8)}`,
    password: 'Password123',
    craft: categoryName,
    businessName: `${serviceName} Services`,
    tagline: `Expert ${serviceName}`,
    bio: `Experienced ${serviceName} offering professional services to customers across Pune, especially near MITWPU in Kothrud and nearby areas. Quality and customer satisfaction guaranteed.`,
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
      address: 'Near MITWPU, Kothrud, Pune, Maharashtra',
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


