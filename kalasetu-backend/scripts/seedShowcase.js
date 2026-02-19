/**
 * seedShowcase.js — Creates clean showcase data for UI testing.
 *
 * Wipes ALL accounts and creates:
 *  - 1 Artisan (fully filled profile, 5 services, portfolio, availability, reviews)
 *  - 1 User (customer)
 *  - 1 Admin (super_admin)
 *
 * Usage: node scripts/seedShowcase.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import ArtisanService from '../models/artisanServiceModel.js';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';
import Category from '../models/categoryModel.js';
import Availability from '../models/availabilityModel.js';
import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import Review from '../models/reviewModel.js';
import Notification from '../models/notificationModel.js';
import RefundRequest from '../models/refundRequestModel.js';

dotenv.config();

// ──────────────────────────────────────────────
// Credentials (printed at end)
// ──────────────────────────────────────────────
const ARTISAN_EMAIL = 'priya@kalasetu.demo';
const ARTISAN_PASSWORD = 'Demo@1234';
const USER_EMAIL = 'rahul@kalasetu.demo';
const USER_PASSWORD = 'Demo@1234';
const ADMIN_EMAIL = 'admin@kalasetu.demo';
const ADMIN_PASSWORD = 'Admin@1234';

// ──────────────────────────────────────────────
// Image URLs (picsum.photos — deterministic, reliable)
// ──────────────────────────────────────────────
const IMG = {
  artisanProfile: 'https://picsum.photos/seed/ks-artisan-face/400/400',
  artisanCover: 'https://picsum.photos/seed/ks-artisan-workshop/1200/500',
  portfolio: [
    'https://picsum.photos/seed/ks-portfolio-1/800/600',
    'https://picsum.photos/seed/ks-portfolio-2/800/600',
    'https://picsum.photos/seed/ks-portfolio-3/800/600',
    'https://picsum.photos/seed/ks-portfolio-4/800/600',
    'https://picsum.photos/seed/ks-portfolio-5/800/600',
    'https://picsum.photos/seed/ks-portfolio-6/800/600',
  ],
  services: [
    ['https://picsum.photos/seed/ks-svc-mehndi-bridal/600/400', 'https://picsum.photos/seed/ks-svc-mehndi-bridal2/600/400'],
    ['https://picsum.photos/seed/ks-svc-mehndi-party/600/400', 'https://picsum.photos/seed/ks-svc-mehndi-party2/600/400'],
    ['https://picsum.photos/seed/ks-svc-mehndi-arabic/600/400', 'https://picsum.photos/seed/ks-svc-mehndi-arabic2/600/400'],
    ['https://picsum.photos/seed/ks-svc-mehndi-baby/600/400'],
    ['https://picsum.photos/seed/ks-svc-mehndi-class/600/400', 'https://picsum.photos/seed/ks-svc-mehndi-class2/600/400'],
  ],
};

// ──────────────────────────────────────────────
// Category data
// ──────────────────────────────────────────────
const CATEGORIES = [
  {
    name: 'Wellness & Beauty',
    slug: 'wellness-beauty',
    suggestedServices: [
      { name: 'Beautician' }, { name: 'Makeup Artist' }, { name: 'Mehendi Artist' },
      { name: 'Hair Stylist' }, { name: 'Massage Therapist' },
    ],
    active: true,
  },
  {
    name: 'Handicrafts',
    slug: 'handicrafts',
    suggestedServices: [
      { name: 'Pottery' }, { name: 'Wood Carving' }, { name: 'Jewelry Making' },
      { name: 'Bamboo Craft' }, { name: 'Glass Art' },
    ],
    active: true,
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    suggestedServices: [
      { name: 'Plumber' }, { name: 'Electrician' }, { name: 'Carpenter' },
      { name: 'Painter' }, { name: 'House Cleaning' },
    ],
    active: true,
  },
  {
    name: 'Food & Catering',
    slug: 'food-catering',
    suggestedServices: [
      { name: 'Home Chef' }, { name: 'Tiffin Service' }, { name: 'Baker' },
      { name: 'Caterer' }, { name: 'Snack Stall' },
    ],
    active: true,
  },
  {
    name: 'Clothing & Tailoring',
    slug: 'clothing-tailoring',
    suggestedServices: [
      { name: 'Tailor' }, { name: 'Embroidery' }, { name: 'Boutique Designer' },
      { name: 'Alterations' }, { name: 'Block Printing' },
    ],
    active: true,
  },
];

// ──────────────────────────────────────────────
// Connect
// ──────────────────────────────────────────────
async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI / MONGODB_URI missing from .env');
  await mongoose.connect(uri);
  console.log('  Connected to MongoDB');
}

// ──────────────────────────────────────────────
// Wipe everything
// ──────────────────────────────────────────────
async function wipeAll() {
  const collections = [
    User, Artisan, Admin, ArtisanService, Category,
    Availability, Booking, Payment, Review, Notification, RefundRequest,
  ];
  await Promise.all(collections.map((M) => M.deleteMany({})));
  console.log('  Wiped all collections');
}

// ──────────────────────────────────────────────
// Seed categories
// ──────────────────────────────────────────────
async function seedCategories() {
  const docs = await Category.insertMany(
    CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      image: '',
      suggestedServices: c.suggestedServices,
      active: c.active,
    }))
  );
  console.log(`  Created ${docs.length} categories`);
  return docs;
}

// ──────────────────────────────────────────────
// Create artisan — fully loaded profile
// ──────────────────────────────────────────────
async function seedArtisan(categories) {
  const wellnessCategory = categories.find((c) => c.slug === 'wellness-beauty');

  const artisan = await Artisan.create({
    fullName: 'Priya Sharma',
    email: ARTISAN_EMAIL,
    phoneNumber: '+919876543210',
    password: ARTISAN_PASSWORD, // pre-save hook will hash
    craft: 'Mehendi Art',
    businessName: 'Priya Mehendi Studio',
    tagline: 'Award-winning Mehendi Artist | 8+ Years | Bridal & Events',
    bio: 'Hi! I\'m Priya, a certified Mehendi artist based in Kothrud, Pune. I specialize in intricate bridal mehndi, Arabic patterns, and fusion designs. Having decorated over 2,000 happy brides and event guests, I bring a blend of traditional Rajasthani motifs with contemporary flair. I use only organic, chemical-free henna paste prepared fresh for every appointment. Whether it\'s your wedding, baby shower, or a festive celebration \u2014 I\'ll make it unforgettable.',
    yearsOfExperience: '8+ years',
    teamSize: '2-5',
    languagesSpoken: ['English', 'Hindi', 'Marathi', 'Gujarati'],
    emailVerified: true,
    isVerified: true,
    isActive: true,
    profileImageUrl: IMG.artisanProfile,
    coverImageUrl: IMG.artisanCover,
    portfolioImageUrls: IMG.portfolio,
    businessPhone: '+919876543211',
    whatsappNumber: '+919876543210',
    location: {
      type: 'Point',
      coordinates: [73.8077, 18.5074], // Kothrud, Pune
      address: '42, Prabhat Road, Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411038',
    },
    certifications: [
      {
        name: 'Certified Mehendi Artist',
        issuingAuthority: 'Indian Mehendi Arts Academy',
        certificateNumber: 'IMAA-2019-0842',
        issueDate: new Date('2019-03-15'),
      },
      {
        name: 'Organic Henna Safety Certification',
        issuingAuthority: 'Natural Beauty Standards Council',
        certificateNumber: 'NBSC-OH-2022',
        issueDate: new Date('2022-06-20'),
        expiryDate: new Date('2027-06-20'),
      },
    ],
    workingHours: {
      monday:    { start: '09:00', end: '18:00', active: true },
      tuesday:   { start: '09:00', end: '18:00', active: true },
      wednesday: { start: '09:00', end: '18:00', active: true },
      thursday:  { start: '09:00', end: '18:00', active: true },
      friday:    { start: '09:00', end: '18:00', active: true },
      saturday:  { start: '10:00', end: '16:00', active: true },
      sunday:    { start: '', end: '', active: false },
    },
    emergencyServices: true,
    serviceRadius: 25,
    minimumBookingNotice: 2, // hours
    businessType: 'small_business',
    autoAcceptBookings: true,
    bufferTimeBetweenBookings: 30,
    maxBookingsPerDay: 6,
    // Stats — realistic numbers
    profileViews: 1847,
    totalBookings: 156,
    completedBookings: 142,
    cancelledBookings: 3,
    totalEarnings: 487500,
    averageRating: 4.7,
    totalReviews: 28,
    responseRate: 96,
    acceptanceRate: 98,
    lastLoginAt: new Date(),
  });

  console.log(`  Created artisan: ${artisan.fullName} (${artisan.publicId})`);

  // ── Services ──
  const servicesData = [
    {
      name: 'Bridal Mehndi \u2014 Full Hands & Feet',
      description: 'Elaborate bridal mehndi covering both hands (till elbow) and both feet (till ankle). Includes traditional Rajasthani motifs, couple portraits, wedding date, and custom elements. Organic henna paste, 4\u20135 hour session. Dark stain guaranteed.',
      price: 8000,
      durationMinutes: 270,
      images: IMG.services[0],
    },
    {
      name: 'Party Mehndi \u2014 Single Hand',
      description: 'Beautiful party-ready mehndi on one hand (front). Perfect for festivals, sangeet, or casual celebrations. Arabic and fusion designs available. Quick application, rich color.',
      price: 500,
      durationMinutes: 30,
      images: IMG.services[1],
    },
    {
      name: 'Arabic Mehndi \u2014 Both Hands',
      description: 'Elegant Arabic-style mehndi with bold floral patterns and clean negative space. Covers both hand fronts. Popular for Eid, engagements, and corporate events.',
      price: 1500,
      durationMinutes: 60,
      images: IMG.services[2],
    },
    {
      name: 'Baby Shower Mehndi Package',
      description: 'Mehendi for the mom-to-be (both hands, front & back) plus simple designs for up to 5 guests. Includes baby-themed motifs, name integration, and cute cradle designs.',
      price: 5000,
      durationMinutes: 180,
      images: IMG.services[3],
    },
    {
      name: 'Mehndi Workshop \u2014 Group of 5',
      description: 'Learn the art of mehndi! 2-hour hands-on workshop for a group of up to 5 people. Includes organic henna cones, practice sheets, design booklet, and guided instruction from basic to intermediate patterns.',
      price: 3000,
      durationMinutes: 120,
      images: IMG.services[4],
    },
  ];

  const services = [];
  for (const svc of servicesData) {
    const doc = await ArtisanService.create({
      artisan: artisan._id,
      category: wellnessCategory._id,
      categoryName: wellnessCategory.name,
      ...svc,
      isActive: true,
    });
    services.push(doc);
  }
  console.log(`  Created ${services.length} services for ${artisan.fullName}`);

  // ── Availability schedule ──
  await Availability.create({
    artisan: artisan._id,
    recurringSchedule: [
      { dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Mon
      { dayOfWeek: 2, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Tue
      { dayOfWeek: 3, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Wed
      { dayOfWeek: 4, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Thu
      { dayOfWeek: 5, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] }, // Fri
      { dayOfWeek: 6, slots: [{ startTime: '10:00', endTime: '16:00' }] }, // Sat
      // Sunday: no entry = closed
    ],
    exceptions: [],
    bufferTime: 30,
    advanceBookingDays: 30,
    minNoticeHours: 2,
  });
  console.log('  Created availability schedule');

  return { artisan, services };
}

// ──────────────────────────────────────────────
// Create customer user
// ──────────────────────────────────────────────
async function seedUser() {
  const user = await User.create({
    fullName: 'Rahul Deshmukh',
    email: USER_EMAIL,
    phoneNumber: '+919123456789',
    password: USER_PASSWORD, // pre-save hook will hash
    emailVerified: true,
  });
  console.log(`  Created user: ${user.fullName}`);
  return user;
}

// ──────────────────────────────────────────────
// Create admin
// ──────────────────────────────────────────────
async function seedAdmin() {
  const admin = await Admin.create({
    fullName: 'KalaSetu Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD, // pre-save hook will hash
    role: 'super_admin',
    isActive: true,
  });
  console.log(`  Created admin: ${admin.fullName}`);
  return admin;
}

// ──────────────────────────────────────────────
// Create sample reviews for the artisan
// ──────────────────────────────────────────────
async function seedReviews(artisan, user) {
  // Create temporary reviewer users for variety (different names)
  const reviewerNames = [
    'Anita Kulkarni', 'Sneha Patil', 'Meera Joshi', 'Kavita Nair', 'Deepa Reddy',
  ];

  const reviewers = [];
  for (let i = 0; i < reviewerNames.length; i++) {
    const r = await User.create({
      fullName: reviewerNames[i],
      email: `reviewer${i + 1}@kalasetu.demo`,
      password: 'Demo@1234',
      emailVerified: true,
    });
    reviewers.push(r);
  }

  const reviewsData = [
    {
      user: reviewers[0]._id,
      rating: 5,
      comment: 'Priya did my bridal mehndi and it was absolutely stunning! The designs were intricate and exactly what I wanted. She was patient with all my requests and the stain came out beautifully dark. Everyone at the wedding was asking who did my mehndi. Highly recommended!',
      isVerified: true,
      response: {
        text: 'Thank you so much Anita! It was a joy decorating your hands for your special day. Wishing you a lifetime of happiness!',
        createdAt: new Date(Date.now() - 25 * 86400000),
      },
    },
    {
      user: reviewers[1]._id,
      rating: 5,
      comment: 'Booked Priya for my sister\'s baby shower and she was amazing. The baby-themed designs were so cute! She also did simple designs for all the guests. Very professional and on time.',
      isVerified: true,
    },
    {
      user: reviewers[2]._id,
      rating: 4,
      comment: 'Great Arabic mehndi design. Clean lines and beautiful patterns. Took a bit longer than expected but the result was worth the wait. The color lasted for almost two weeks!',
      isVerified: true,
      response: {
        text: 'Thanks for your patience, Meera! Arabic designs need extra time for precision. Glad you loved the result!',
        createdAt: new Date(Date.now() - 15 * 86400000),
      },
    },
    {
      user: reviewers[3]._id,
      rating: 5,
      comment: 'Attended the mehndi workshop with friends and we had so much fun! Priya is a wonderful teacher. She broke down complex patterns into simple steps. We went home with our own henna cones and a design booklet. Great experience!',
      isVerified: true,
    },
    {
      user: reviewers[4]._id,
      rating: 4,
      comment: 'Good party mehndi. Quick and beautiful. The organic henna smell was so nice compared to chemical ones. Would book again for the next festival.',
      isVerified: true,
    },
  ];

  for (let i = 0; i < reviewsData.length; i++) {
    await Review.create({
      artisan: artisan._id,
      ...reviewsData[i],
      status: 'active',
      createdAt: new Date(Date.now() - (30 - i * 5) * 86400000), // spread over last month
    });
  }

  console.log(`  Created ${reviewsData.length} reviews (avg 4.6 stars)`);
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function run() {
  console.log('\n\u250C\u2500 KalaSetu Showcase Seed \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
  try {
    await connectDB();
    await wipeAll();

    const categories = await seedCategories();
    const { artisan } = await seedArtisan(categories);
    const user = await seedUser();
    await seedAdmin();
    await seedReviews(artisan, user);

    console.log('\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    console.log('');
    console.log('\u250C\u2500 Login Credentials \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    console.log('\u2502');
    console.log(`\u2502  ARTISAN  (Priya Sharma \u2014 Mehendi Artist)`);
    console.log(`\u2502    Email:    ${ARTISAN_EMAIL}`);
    console.log(`\u2502    Password: ${ARTISAN_PASSWORD}`);
    console.log(`\u2502    Login:    /artisan/login`);
    console.log(`\u2502    Profile:  /artisan/${artisan.publicId}`);
    console.log('\u2502');
    console.log(`\u2502  CUSTOMER (Rahul Deshmukh)`);
    console.log(`\u2502    Email:    ${USER_EMAIL}`);
    console.log(`\u2502    Password: ${USER_PASSWORD}`);
    console.log(`\u2502    Login:    /user/login`);
    console.log('\u2502');
    console.log(`\u2502  ADMIN    (Super Admin)`);
    console.log(`\u2502    Email:    ${ADMIN_EMAIL}`);
    console.log(`\u2502    Password: ${ADMIN_PASSWORD}`);
    console.log(`\u2502    Login:    /admin`);
    console.log('\u2502');
    console.log('\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    console.log('');
  } catch (e) {
    console.error('\n  SEED FAILED:', e.message);
    console.error(e.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

run();
