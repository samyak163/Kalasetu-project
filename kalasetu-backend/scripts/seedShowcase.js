/**
 * seedShowcase.js — Creates clean showcase data for UI testing.
 *
 * Wipes ALL accounts and creates:
 *  - 3 Artisans (fully filled profiles, services, portfolio, availability, reviews)
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
const ARTISAN_1_EMAIL = 'priya@kalasetu.demo';
const ARTISAN_2_EMAIL = 'ravi@kalasetu.demo';
const ARTISAN_3_EMAIL = 'lakshmi@kalasetu.demo';
const ARTISAN_PASSWORD = 'Demo@1234';
const USER_EMAIL = 'rahul@kalasetu.demo';
const USER_PASSWORD = 'Demo@1234';
const ADMIN_EMAIL = 'admin@kalasetu.demo';
const ADMIN_PASSWORD = 'Admin@1234';

// ──────────────────────────────────────────────
// Image URLs (Unsplash — free, real artisan photos)
// ──────────────────────────────────────────────
const IMG = {
  // Artisan 1: Priya Sharma — Mehendi Artist
  priya: {
    profile: 'https://images.unsplash.com/photo-1580746453801-37b0bc56f3b4?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/flagged/photo-1557695742-6ddd2cd63a5d?w=1200&h=500&fit=crop',
    portfolio: [
      'https://images.unsplash.com/photo-1570105566322-0e5bdccc9501?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1563962750292-d3401f66d46b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565368114375-ba1a4db7099f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1676134014048-bcc764ea015d?w=800&h=600&fit=crop',
    ],
    services: [
      ['https://images.unsplash.com/photo-1676134014048-bcc764ea015d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1676134138844-9a52b5210cf9?w=600&h=400&fit=crop'],
      ['https://images.unsplash.com/photo-1570105566322-0e5bdccc9501?w=600&h=400&fit=crop'],
      ['https://images.unsplash.com/photo-1563962750292-d3401f66d46b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1565368114375-ba1a4db7099f?w=600&h=400&fit=crop'],
    ],
  },
  // Artisan 2: Ravi Kumar — Potter
  ravi: {
    profile: 'https://images.unsplash.com/photo-1753164725863-d5ddc330978c?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1753164725849-98df639afb7a?w=1200&h=500&fit=crop',
    portfolio: [
      'https://images.unsplash.com/photo-1510828561531-05a3388f6d3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1603972596426-133f7802b856?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1749518295706-dc15ca3b5fd5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1633112046092-a161d99563d1?w=800&h=600&fit=crop',
    ],
    services: [
      ['https://images.unsplash.com/photo-1633112046092-a161d99563d1?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1510828561531-05a3388f6d3d?w=600&h=400&fit=crop'],
      ['https://images.unsplash.com/photo-1675101337462-a19b63af8b1b?w=600&h=400&fit=crop'],
      ['https://images.unsplash.com/photo-1603972596426-133f7802b856?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1749518295706-dc15ca3b5fd5?w=600&h=400&fit=crop'],
    ],
  },
  // Artisan 3: Lakshmi Devi — Tailor / Textile
  lakshmi: {
    profile: 'https://images.unsplash.com/photo-1659451335972-c3f976f4e567?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=1200&h=500&fit=crop',
    portfolio: [
      'https://images.unsplash.com/photo-1466027449668-27f96b692ba4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1545206085-d0e519bdcecd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?w=800&h=600&fit=crop',
    ],
    services: [
      ['https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1545206085-d0e519bdcecd?w=600&h=400&fit=crop'],
      ['https://images.unsplash.com/photo-1653220266006-27b87f590eaf?w=600&h=400&fit=crop'],
      ['https://images.unsplash.com/photo-1759738096144-b43206226765?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1466027449668-27f96b692ba4?w=600&h=400&fit=crop'],
    ],
  },
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
// Artisan definitions — 3 artisans
// ──────────────────────────────────────────────
function getArtisanProfiles(categories) {
  const wellness = categories.find((c) => c.slug === 'wellness-beauty');
  const handicrafts = categories.find((c) => c.slug === 'handicrafts');
  const clothing = categories.find((c) => c.slug === 'clothing-tailoring');

  return [
    // ─── Artisan 1: Priya Sharma — Mehendi Artist ───
    {
      profile: {
        fullName: 'Priya Sharma',
        email: ARTISAN_1_EMAIL,
        phoneNumber: '+919876543210',
        password: ARTISAN_PASSWORD,
        craft: 'Mehendi Art',
        businessName: 'Priya Mehendi Studio',
        tagline: 'Award-winning Mehendi Artist | 8+ Years | Bridal & Events',
        bio: 'Hi! I\'m Priya, a certified Mehendi artist based in Kothrud, Pune. I specialize in intricate bridal mehndi, Arabic patterns, and fusion designs. Having decorated over 2,000 happy brides and event guests, I bring a blend of traditional Rajasthani motifs with contemporary flair. I use only organic, chemical-free henna paste prepared fresh for every appointment.',
        yearsOfExperience: '8+ years',
        teamSize: '2-5',
        languagesSpoken: ['English', 'Hindi', 'Marathi', 'Gujarati'],
        emailVerified: true, isVerified: true, isActive: true,
        profileImageUrl: IMG.priya.profile,
        coverImageUrl: IMG.priya.cover,
        portfolioImageUrls: IMG.priya.portfolio,
        businessPhone: '+919876543211',
        whatsappNumber: '+919876543210',
        location: {
          type: 'Point',
          coordinates: [73.8077, 18.5074], // Kothrud, Pune
          address: '42, Prabhat Road, Kothrud',
          city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411038',
        },
        certifications: [
          { name: 'Certified Mehendi Artist', issuingAuthority: 'Indian Mehendi Arts Academy', certificateNumber: 'IMAA-2019-0842', issueDate: new Date('2019-03-15') },
        ],
        workingHours: {
          monday: { start: '09:00', end: '18:00', active: true },
          tuesday: { start: '09:00', end: '18:00', active: true },
          wednesday: { start: '09:00', end: '18:00', active: true },
          thursday: { start: '09:00', end: '18:00', active: true },
          friday: { start: '09:00', end: '18:00', active: true },
          saturday: { start: '10:00', end: '16:00', active: true },
          sunday: { start: '', end: '', active: false },
        },
        emergencyServices: true,
        serviceRadius: 25,
        minimumBookingNotice: 2,
        businessType: 'small_business',
        autoAcceptBookings: true,
        bufferTimeBetweenBookings: 30,
        maxBookingsPerDay: 6,
        profileViews: 1847, totalBookings: 156, completedBookings: 142, cancelledBookings: 3,
        totalEarnings: 487500, averageRating: 4.7, totalReviews: 28,
        responseRate: 96, acceptanceRate: 98, lastLoginAt: new Date(),
      },
      category: wellness,
      services: [
        {
          name: 'Bridal Mehndi \u2014 Full Hands & Feet',
          description: 'Elaborate bridal mehndi covering both hands (till elbow) and both feet (till ankle). Includes traditional Rajasthani motifs, couple portraits, and custom elements. Organic henna paste, 4\u20135 hour session.',
          price: 8000, durationMinutes: 270, images: IMG.priya.services[0],
        },
        {
          name: 'Party Mehndi \u2014 Both Hands',
          description: 'Beautiful party-ready mehndi on both hands. Perfect for festivals, sangeet, or celebrations. Arabic and fusion designs available.',
          price: 1500, durationMinutes: 60, images: IMG.priya.services[1],
        },
        {
          name: 'Arabic Mehndi \u2014 Single Hand',
          description: 'Elegant Arabic-style mehndi with bold floral patterns and clean negative space. Popular for Eid, engagements, and corporate events.',
          price: 500, durationMinutes: 30, images: IMG.priya.services[2],
        },
      ],
      availability: [
        { dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 2, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 3, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 4, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 5, slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }] },
        { dayOfWeek: 6, slots: [{ startTime: '10:00', endTime: '16:00' }] },
      ],
    },

    // ─── Artisan 2: Ravi Kumar — Potter ───
    {
      profile: {
        fullName: 'Ravi Kumar',
        email: ARTISAN_2_EMAIL,
        phoneNumber: '+919823456701',
        password: ARTISAN_PASSWORD,
        craft: 'Pottery & Ceramics',
        businessName: 'Mitti Studio',
        tagline: 'Handcrafted Pottery & Ceramics | Workshops | Custom Orders',
        bio: 'I\'m Ravi, a third-generation potter from Pune. What started as a childhood spent watching my grandfather shape clay has become my life\'s work. At Mitti Studio, I create handcrafted terracotta and stoneware pieces \u2014 from decorative vases and planters to functional kitchenware. I also run pottery workshops for beginners and experienced enthusiasts. Every piece is wheel-thrown, hand-glazed, and kiln-fired in my studio.',
        yearsOfExperience: '12+ years',
        teamSize: '2-5',
        languagesSpoken: ['English', 'Hindi', 'Marathi'],
        emailVerified: true, isVerified: true, isActive: true,
        profileImageUrl: IMG.ravi.profile,
        coverImageUrl: IMG.ravi.cover,
        portfolioImageUrls: IMG.ravi.portfolio,
        businessPhone: '+919823456702',
        whatsappNumber: '+919823456701',
        location: {
          type: 'Point',
          coordinates: [73.8567, 18.5196], // Shivajinagar, Pune
          address: '15, Shivaji Road, Shivajinagar',
          city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411005',
        },
        certifications: [
          { name: 'Master Craftsman Certificate', issuingAuthority: 'Maharashtra State Handicrafts Board', certificateNumber: 'MSHB-2018-PT-0156', issueDate: new Date('2018-11-10') },
        ],
        workingHours: {
          monday: { start: '08:00', end: '17:00', active: true },
          tuesday: { start: '08:00', end: '17:00', active: true },
          wednesday: { start: '08:00', end: '17:00', active: true },
          thursday: { start: '08:00', end: '17:00', active: true },
          friday: { start: '08:00', end: '17:00', active: true },
          saturday: { start: '09:00', end: '14:00', active: true },
          sunday: { start: '', end: '', active: false },
        },
        emergencyServices: false,
        serviceRadius: 15,
        minimumBookingNotice: 24,
        businessType: 'small_business',
        autoAcceptBookings: false,
        bufferTimeBetweenBookings: 60,
        maxBookingsPerDay: 4,
        profileViews: 923, totalBookings: 87, completedBookings: 79, cancelledBookings: 2,
        totalEarnings: 312000, averageRating: 4.8, totalReviews: 15,
        responseRate: 92, acceptanceRate: 95, lastLoginAt: new Date(),
      },
      category: handicrafts,
      services: [
        {
          name: 'Custom Pottery \u2014 Handcrafted Piece',
          description: 'Commission a unique, handcrafted pottery piece \u2014 vases, planters, bowls, or decorative items. Discuss your vision, choose the clay type and glaze. Includes wheel-throwing, drying, glazing, and kiln firing. Ready in 2\u20133 weeks.',
          price: 2500, durationMinutes: 120, images: IMG.ravi.services[0],
        },
        {
          name: 'Pottery Workshop \u2014 Beginner (2 hours)',
          description: 'Hands-on pottery workshop for beginners. Learn centering, throwing, and shaping on the potter\'s wheel. Take home your own creation after firing. All materials included. Groups of up to 6.',
          price: 1200, durationMinutes: 120, images: IMG.ravi.services[1],
        },
        {
          name: 'Terracotta Planter Set (3 pcs)',
          description: 'Set of 3 hand-thrown terracotta planters in small, medium, and large sizes. Natural terracotta with optional painted designs. Perfect for balcony gardens. Drainage holes included.',
          price: 1800, durationMinutes: 0, images: IMG.ravi.services[2],
        },
      ],
      availability: [
        { dayOfWeek: 1, slots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '13:00', endTime: '17:00' }] },
        { dayOfWeek: 2, slots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '13:00', endTime: '17:00' }] },
        { dayOfWeek: 3, slots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '13:00', endTime: '17:00' }] },
        { dayOfWeek: 4, slots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '13:00', endTime: '17:00' }] },
        { dayOfWeek: 5, slots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '13:00', endTime: '17:00' }] },
        { dayOfWeek: 6, slots: [{ startTime: '09:00', endTime: '14:00' }] },
      ],
    },

    // ─── Artisan 3: Lakshmi Devi — Tailor / Textile ───
    {
      profile: {
        fullName: 'Lakshmi Devi',
        email: ARTISAN_3_EMAIL,
        phoneNumber: '+919845678901',
        password: ARTISAN_PASSWORD,
        craft: 'Tailoring & Embroidery',
        businessName: 'Lakshmi Boutique',
        tagline: 'Custom Tailoring | Hand Embroidery | Traditional & Modern Designs',
        bio: 'Namaste! I\'m Lakshmi, a master tailor and embroidery artist with over 15 years of experience. I specialize in custom-fitted Indian ethnic wear \u2014 saree blouses, lehengas, kurtas, and sherwanis. My hand embroidery work includes zardozi, chikankari, and mirror work. I learned the craft from my mother in Lucknow and now run my boutique in Pune. Every garment is personally cut, stitched, and finished by me or my small team.',
        yearsOfExperience: '15+ years',
        teamSize: '2-5',
        languagesSpoken: ['English', 'Hindi', 'Marathi', 'Urdu'],
        emailVerified: true, isVerified: true, isActive: true,
        profileImageUrl: IMG.lakshmi.profile,
        coverImageUrl: IMG.lakshmi.cover,
        portfolioImageUrls: IMG.lakshmi.portfolio,
        businessPhone: '+919845678902',
        whatsappNumber: '+919845678901',
        location: {
          type: 'Point',
          coordinates: [73.8478, 18.4618], // Swargate, Pune
          address: '88, Tilak Road, Swargate',
          city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411042',
        },
        certifications: [
          { name: 'National Award for Handicrafts', issuingAuthority: 'Ministry of Textiles, Govt. of India', certificateNumber: 'MOT-NAH-2020-1042', issueDate: new Date('2020-01-26') },
        ],
        workingHours: {
          monday: { start: '10:00', end: '19:00', active: true },
          tuesday: { start: '10:00', end: '19:00', active: true },
          wednesday: { start: '10:00', end: '19:00', active: true },
          thursday: { start: '10:00', end: '19:00', active: true },
          friday: { start: '10:00', end: '19:00', active: true },
          saturday: { start: '10:00', end: '17:00', active: true },
          sunday: { start: '11:00', end: '15:00', active: true },
        },
        emergencyServices: true,
        serviceRadius: 20,
        minimumBookingNotice: 4,
        businessType: 'small_business',
        autoAcceptBookings: true,
        bufferTimeBetweenBookings: 30,
        maxBookingsPerDay: 8,
        profileViews: 2156, totalBookings: 234, completedBookings: 218, cancelledBookings: 5,
        totalEarnings: 892000, averageRating: 4.9, totalReviews: 42,
        responseRate: 99, acceptanceRate: 97, lastLoginAt: new Date(),
      },
      category: clothing,
      services: [
        {
          name: 'Custom Saree Blouse \u2014 Stitching & Fitting',
          description: 'Custom-fitted saree blouse with your choice of design \u2014 padded, princess cut, backless, halter, or traditional. Includes measurement, cutting, stitching, and one fitting session. Fabric not included.',
          price: 1500, durationMinutes: 45, images: IMG.lakshmi.services[0],
        },
        {
          name: 'Hand Embroidery \u2014 Zardozi/Chikankari Work',
          description: 'Exquisite hand embroidery on your garment. Choose from zardozi (gold thread), chikankari (white thread), or mirror work. Price per panel/motif. Discuss design and timeline during consultation.',
          price: 3000, durationMinutes: 60, images: IMG.lakshmi.services[1],
        },
        {
          name: 'Lehenga / Sherwani \u2014 Full Custom',
          description: 'Complete custom lehenga choli or sherwani for weddings and special occasions. Includes design consultation, fabric selection guidance, 2 fitting sessions, and final stitching. Embroidery work quoted separately.',
          price: 8000, durationMinutes: 90, images: IMG.lakshmi.services[2],
        },
      ],
      availability: [
        { dayOfWeek: 0, slots: [{ startTime: '11:00', endTime: '15:00' }] },
        { dayOfWeek: 1, slots: [{ startTime: '10:00', endTime: '13:30' }, { startTime: '14:30', endTime: '19:00' }] },
        { dayOfWeek: 2, slots: [{ startTime: '10:00', endTime: '13:30' }, { startTime: '14:30', endTime: '19:00' }] },
        { dayOfWeek: 3, slots: [{ startTime: '10:00', endTime: '13:30' }, { startTime: '14:30', endTime: '19:00' }] },
        { dayOfWeek: 4, slots: [{ startTime: '10:00', endTime: '13:30' }, { startTime: '14:30', endTime: '19:00' }] },
        { dayOfWeek: 5, slots: [{ startTime: '10:00', endTime: '13:30' }, { startTime: '14:30', endTime: '19:00' }] },
        { dayOfWeek: 6, slots: [{ startTime: '10:00', endTime: '17:00' }] },
      ],
    },
  ];
}

// ──────────────────────────────────────────────
// Seed all artisans
// ──────────────────────────────────────────────
async function seedArtisans(categories) {
  const artisanProfiles = getArtisanProfiles(categories);
  const results = [];

  for (const def of artisanProfiles) {
    const artisan = await Artisan.create(def.profile);
    console.log(`  Created artisan: ${artisan.fullName} (${artisan.publicId})`);

    // Services
    const services = [];
    for (const svc of def.services) {
      const doc = await ArtisanService.create({
        artisan: artisan._id,
        category: def.category._id,
        categoryName: def.category.name,
        ...svc,
        isActive: true,
      });
      services.push(doc);
    }
    console.log(`    ${services.length} services`);

    // Availability
    await Availability.create({
      artisan: artisan._id,
      recurringSchedule: def.availability,
      exceptions: [],
      bufferTime: 30,
      advanceBookingDays: 30,
      minNoticeHours: def.profile.minimumBookingNotice || 2,
    });
    console.log('    availability schedule');

    results.push({ artisan, services, category: def.category });
  }

  return results;
}

// ──────────────────────────────────────────────
// Create customer user
// ──────────────────────────────────────────────
async function seedUser() {
  const user = await User.create({
    fullName: 'Rahul Deshmukh',
    email: USER_EMAIL,
    phoneNumber: '+919123456789',
    password: USER_PASSWORD,
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
    password: ADMIN_PASSWORD,
    role: 'super_admin',
    isActive: true,
  });
  console.log(`  Created admin: ${admin.fullName}`);
  return admin;
}

// ──────────────────────────────────────────────
// Create sample reviews for all artisans
// ──────────────────────────────────────────────
async function seedReviews(artisanResults, user) {
  // Reviewer pool
  const reviewerNames = [
    'Anita Kulkarni', 'Sneha Patil', 'Meera Joshi', 'Kavita Nair', 'Deepa Reddy',
    'Pooja Mehta', 'Sonal Gupta', 'Nisha Iyer', 'Aarti Bhat',
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

  // Reviews per artisan
  const allReviews = {
    // Priya (Mehendi)
    0: [
      { user: reviewers[0]._id, rating: 5, comment: 'Priya did my bridal mehndi and it was absolutely stunning! The designs were intricate and exactly what I wanted. The stain came out beautifully dark. Everyone at the wedding was asking who did my mehndi.', tags: ['Excellent Craftsmanship', 'Exceeded Expectations', 'Patient & Helpful'], isVerified: true, response: { text: 'Thank you so much Anita! It was a joy decorating your hands for your special day!', createdAt: new Date(Date.now() - 25 * 86400000) } },
      { user: reviewers[1]._id, rating: 5, comment: 'Booked Priya for my sister\'s baby shower and she was amazing. The baby-themed designs were so cute! Very professional and on time.', tags: ['On Time', 'Great Communication', 'Excellent Craftsmanship'], isVerified: true },
      { user: reviewers[2]._id, rating: 4, comment: 'Great Arabic mehndi design. Clean lines and beautiful patterns. The color lasted for almost two weeks!', tags: ['Excellent Craftsmanship', 'True to Photos'], isVerified: true },
    ],
    // Ravi (Potter)
    1: [
      { user: reviewers[3]._id, rating: 5, comment: 'Attended Ravi\'s pottery workshop with my family and we had the best time! He\'s incredibly patient and encouraging. My 10-year-old made a beautiful bowl. The studio vibe is warm and welcoming.', tags: ['Patient & Helpful', 'Exceeded Expectations', 'Great Communication'], isVerified: true, response: { text: 'So glad your family enjoyed it, Kavita! Your daughter is a natural \u2014 that bowl turned out fantastic!', createdAt: new Date(Date.now() - 18 * 86400000) } },
      { user: reviewers[4]._id, rating: 5, comment: 'Ordered custom planters for my balcony garden. The terracotta work is exquisite \u2014 you can feel the handmade quality. Ravi even suggested the perfect size for my plants. Delivered on time.', tags: ['Excellent Craftsmanship', 'On Time', 'True to Photos'], isVerified: true },
      { user: reviewers[5]._id, rating: 4, comment: 'Good workshop experience. Learned a lot about centering clay. The piece I made needed some fixing but Ravi helped me finish it. Would come back for the advanced session.', tags: ['Patient & Helpful', 'Clean Workshop'], isVerified: true },
    ],
    // Lakshmi (Tailor)
    2: [
      { user: reviewers[6]._id, rating: 5, comment: 'Lakshmi is a magician with fabric! Got my wedding lehenga custom-made and it fit like a dream. The zardozi work was museum-quality. She understood my vision perfectly from the first consultation.', tags: ['Excellent Craftsmanship', 'Exceeded Expectations', 'Great Communication'], isVerified: true, response: { text: 'Thank you Sonal! Your wedding lehenga was one of my favorite pieces to work on. Wishing you a beautiful married life!', createdAt: new Date(Date.now() - 12 * 86400000) } },
      { user: reviewers[7]._id, rating: 5, comment: 'Best blouse fitting I\'ve ever had. Lakshmi measures so precisely \u2014 no alterations needed after the first fitting. She also gave great suggestions for the neckline design. Very reasonable pricing.', tags: ['On Time', 'True to Photos', 'Excellent Craftsmanship'], isVerified: true },
      { user: reviewers[8]._id, rating: 5, comment: 'Got chikankari embroidery done on a kurta for my husband\'s birthday. The handwork is phenomenal \u2014 you can see each stitch is done with love. Took 3 weeks but absolutely worth the wait.', tags: ['Excellent Craftsmanship', 'Patient & Helpful'], isVerified: true },
    ],
  };

  let totalCreated = 0;
  for (const [idx, artisanData] of artisanResults.entries()) {
    const reviews = allReviews[idx] || [];
    for (let i = 0; i < reviews.length; i++) {
      await Review.create({
        artisan: artisanData.artisan._id,
        ...reviews[i],
        status: 'active',
        createdAt: new Date(Date.now() - (30 - i * 7) * 86400000),
      });
    }
    totalCreated += reviews.length;

    // Recalculate artisan stats
    const reviewStats = await Review.aggregate([
      { $match: { artisan: artisanData.artisan._id, status: 'active' } },
      { $group: { _id: '$artisan', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (reviewStats.length > 0) {
      await Artisan.findByIdAndUpdate(artisanData.artisan._id, {
        averageRating: Math.round(reviewStats[0].avg * 10) / 10,
        totalReviews: reviewStats[0].count
      });
    }
  }

  console.log(`  Created ${totalCreated} reviews across ${artisanResults.length} artisans`);
}

// ──────────────────────────────────────────────
// Create sample bookings for all artisans
// ──────────────────────────────────────────────
async function seedBookings(artisanResults, user) {
  const now = new Date();
  const day = 86400000;
  const dateAt = (offsetDays, hour, minute = 0) => {
    const d = new Date(now.getTime() + offsetDays * day);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  let totalCreated = 0;

  for (const { artisan, services, category } of artisanResults) {
    const svc0 = services[0]; // Primary service
    const svc1 = services[1]; // Secondary service

    const bookingsData = [
      // PENDING
      {
        service: svc0, start: dateAt(7, 10), end: dateAt(7, 10 + Math.ceil(svc0.durationMinutes / 60)),
        status: 'pending', notes: 'Looking forward to this!', price: svc0.price, createdAt: dateAt(-1, 14),
      },
      // CONFIRMED
      {
        service: svc1, start: dateAt(3, 15), end: dateAt(3, 16),
        status: 'confirmed', notes: '', price: svc1.price, respondedAt: dateAt(-2, 10), createdAt: dateAt(-3, 18),
      },
      // COMPLETED
      {
        service: svc0, start: dateAt(-10, 11), end: dateAt(-10, 14),
        status: 'completed', notes: '', price: svc0.price, respondedAt: dateAt(-12, 9), completedAt: dateAt(-10, 14), createdAt: dateAt(-14, 20),
      },
      // COMPLETED (older)
      {
        service: svc1, start: dateAt(-20, 10), end: dateAt(-20, 12),
        status: 'completed', notes: '', price: svc1.price, respondedAt: dateAt(-25, 11), completedAt: dateAt(-20, 12), createdAt: dateAt(-27, 16),
      },
      // CANCELLED
      {
        service: svc1, start: dateAt(-3, 16), end: dateAt(-3, 17),
        status: 'cancelled', notes: '', price: svc1.price, respondedAt: dateAt(-8, 10),
        cancellationReason: 'Schedule conflict', cancelledBy: user._id, createdAt: dateAt(-10, 12),
      },
      // REJECTED
      {
        service: svc0, start: dateAt(-15, 9), end: dateAt(-15, 12),
        status: 'rejected', notes: 'Urgent request', price: svc0.price, respondedAt: dateAt(-17, 8),
        rejectionReason: 'Sorry, I\'m fully booked that day. Please check my availability.', createdAt: dateAt(-18, 22),
      },
    ];

    for (const data of bookingsData) {
      const { service, ...rest } = data;
      await Booking.create({
        artisan: artisan._id,
        user: user._id,
        service: service._id,
        serviceName: service.name,
        categoryName: category.name,
        ...rest,
      });
    }
    totalCreated += bookingsData.length;
  }

  console.log(`  Created ${totalCreated} bookings across ${artisanResults.length} artisans`);
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
    const artisanResults = await seedArtisans(categories);
    const user = await seedUser();
    await seedAdmin();
    await seedReviews(artisanResults, user);
    await seedBookings(artisanResults, user);

    console.log('\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    console.log('');
    console.log('\u250C\u2500 Login Credentials \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    console.log('\u2502');
    for (const { artisan } of artisanResults) {
      console.log(`\u2502  ARTISAN  (${artisan.fullName} \u2014 ${artisan.craft})`);
      console.log(`\u2502    Email:    ${artisan.email}`);
      console.log(`\u2502    Password: ${ARTISAN_PASSWORD}`);
      console.log(`\u2502    Profile:  /${artisan.publicId}`);
      console.log('\u2502');
    }
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
