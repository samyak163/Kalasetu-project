// FILE: kalasetu-backend/scripts/seedArtisans.js
// Run this script to populate database with sample artisans in Pune
// Usage: node scripts/seedArtisans.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Pune locations with actual coordinates [longitude, latitude]
const puneLocations = [
  {
    name: 'MIT-WPU, Kothrud',
    coordinates: [73.8297, 18.5165],
    address: 'MIT World Peace University, Kothrud, Pune 411038'
  },
  {
    name: 'Kothrud',
    coordinates: [73.8077, 18.5074],
    address: 'Kothrud, Pune, Maharashtra 411038'
  },
  {
    name: 'Shivajinagar',
    coordinates: [73.8449, 18.5304],
    address: 'Shivajinagar, Pune, Maharashtra 411005'
  },
  {
    name: 'Aundh',
    coordinates: [73.8077, 18.5591],
    address: 'Aundh, Pune, Maharashtra 411007'
  },
  {
    name: 'Baner',
    coordinates: [73.7799, 18.5598],
    address: 'Baner, Pune, Maharashtra 411045'
  },
  {
    name: 'Kalyani Nagar',
    coordinates: [73.9056, 18.5489],
    address: 'Kalyani Nagar, Pune, Maharashtra 411006'
  },
  {
    name: 'Wakad',
    coordinates: [73.7549, 18.5978],
    address: 'Wakad, Pune, Maharashtra 411057'
  },
  {
    name: 'Pimple Saudagar',
    coordinates: [73.8013, 18.5946],
    address: 'Pimple Saudagar, Pune, Maharashtra 411027'
  },
  {
    name: 'Hinjewadi',
    coordinates: [73.7279, 18.5913],
    address: 'Hinjewadi, Pune, Maharashtra 411057'
  },
  {
    name: 'Viman Nagar',
    coordinates: [73.9151, 18.5678],
    address: 'Viman Nagar, Pune, Maharashtra 411014'
  },
  {
    name: 'Deccan Gymkhana',
    coordinates: [73.8389, 18.5203],
    address: 'Deccan Gymkhana, Pune, Maharashtra 411004'
  }
];

// Sample artisan data with diverse crafts (matching current schema)
const sampleArtisans = [
  {
    fullName: 'Rajesh Patil',
    email: 'rajesh.patil@demo.kalasetu.com',
    phoneNumber: '+919876543210',
    password: 'Password123',
    craft: 'Pottery & Ceramics',
    businessName: 'Patil Pottery Studio',
    tagline: 'Traditional Pottery Since 2008',
    bio: 'Master potter with 15 years of experience in traditional Maharashtrian pottery. Specialized in terracotta and clay sculptures.',
    yearsOfExperience: '15+ years',
    teamSize: '2-5 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 15,
  },
  {
    fullName: 'Priya Sharma',
    email: 'priya.sharma@demo.kalasetu.com',
    phoneNumber: '+919876543211',
    password: 'Password123',
    craft: 'Textiles & Weaving',
    businessName: 'Sharma Handloom Creations',
    tagline: 'Authentic Handloom Textiles',
    bio: 'Expert handloom weaver creating authentic Paithani and traditional Indian textiles. 20+ years of weaving experience.',
    yearsOfExperience: '20+ years',
    teamSize: '5-10 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 20,
  },
  {
    fullName: 'Amit Kulkarni',
    email: 'amit.kulkarni@demo.kalasetu.com',
    phoneNumber: '+919876543212',
    password: 'Password123',
    craft: 'Woodwork',
    businessName: 'Kulkarni Wood Crafts',
    tagline: 'Custom Wooden Furniture & Carvings',
    bio: 'Skilled wood artisan specializing in intricate carvings and handcrafted furniture. Traditional and modern designs.',
    yearsOfExperience: '12 years',
    teamSize: '2-5 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 18,
  },
  {
    fullName: 'Sneha Deshmukh',
    email: 'sneha.deshmukh@demo.kalasetu.com',
    phoneNumber: '+919876543213',
    password: 'Password123',
    craft: 'Jewelry & Metalwork',
    businessName: 'Deshmukh Silver Arts',
    tagline: 'Exquisite Silver Jewelry Designs',
    bio: 'Traditional jewelry maker creating exquisite silver and oxidized jewelry. Expert in Maharashtrian ornamental designs.',
    yearsOfExperience: '10 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 12,
  },
  {
    fullName: 'Vikram Pawar',
    email: 'vikram.pawar@demo.kalasetu.com',
    phoneNumber: '+919876543214',
    password: 'Password123',
    craft: 'Leather Craft',
    businessName: 'Pawar Leather Works',
    tagline: 'Premium Handcrafted Leather Products',
    bio: 'Artisan leatherworker creating handcrafted bags, belts, and traditional footwear. Premium quality leather products.',
    yearsOfExperience: '8 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 10,
  },
  {
    fullName: 'Anita Joshi',
    email: 'anita.joshi@demo.kalasetu.com',
    phoneNumber: '+919876543215',
    password: 'Password123',
    craft: 'Painting & Art',
    businessName: 'Joshi Art Studio',
    tagline: 'Traditional Warli Art & Paintings',
    bio: 'Traditional Warli art painter preserving ancient tribal art forms. Creates stunning wall paintings and canvas art.',
    yearsOfExperience: '18 years',
    teamSize: '2-5 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 16,
  },
  {
    fullName: 'Suresh Bhosale',
    email: 'suresh.bhosale@demo.kalasetu.com',
    phoneNumber: '+919876543216',
    password: 'Password123',
    craft: 'Metal Craft',
    businessName: 'Bhosale Brass Works',
    tagline: 'Traditional Brass & Copper Artifacts',
    bio: 'Master metalworker specializing in brass and copper utensils, decorative items, and traditional artifacts.',
    yearsOfExperience: '22 years',
    teamSize: '5-10 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 20,
  },
  {
    fullName: 'Meera Kale',
    email: 'meera.kale@demo.kalasetu.com',
    phoneNumber: '+919876543217',
    password: 'Password123',
    craft: 'Embroidery & Stitching',
    businessName: 'Kale Embroidery Works',
    tagline: 'Traditional Hand Embroidery & Zari Work',
    bio: 'Expert in traditional Indian embroidery including Zari, Gota Patti, and intricate hand stitching work.',
    yearsOfExperience: '14 years',
    teamSize: '2-5 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 14,
  },
  {
    fullName: 'Ganesh Jadhav',
    email: 'ganesh.jadhav@demo.kalasetu.com',
    phoneNumber: '+919876543218',
    password: 'Password123',
    craft: 'Stone Work',
    businessName: 'Jadhav Stone Sculptures',
    tagline: 'Artistic Stone Carvings & Sculptures',
    bio: 'Stone carving specialist creating beautiful sculptures and architectural elements. Traditional temple art expertise.',
    yearsOfExperience: '25 years',
    teamSize: '5-10 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 25,
  },
  {
    fullName: 'Kavita Thorat',
    email: 'kavita.thorat@demo.kalasetu.com',
    phoneNumber: '+919876543219',
    password: 'Password123',
    craft: 'Bamboo Craft',
    businessName: 'Thorat Bamboo Art',
    tagline: 'Eco-Friendly Bamboo & Basket Weaving',
    bio: 'Bamboo artisan creating eco-friendly baskets, furniture, and decorative items. Sustainable and traditional craft.',
    yearsOfExperience: '11 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 10,
  },
  {
    fullName: 'Rahul Shinde',
    email: 'rahul.shinde@demo.kalasetu.com',
    phoneNumber: '+919876543220',
    password: 'Password123',
    craft: 'Toys & Puppets',
    businessName: 'Shinde Folk Art',
    tagline: 'Traditional Puppet Making & Folk Art',
    bio: 'Traditional puppet maker and folk artist. Creates beautiful handmade puppets and traditional Indian toys.',
    yearsOfExperience: '9 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 8,
  },
  {
    fullName: 'Pooja Mahajan',
    email: 'pooja.mahajan@demo.kalasetu.com',
    phoneNumber: '+919876543221',
    password: 'Password123',
    craft: 'Block Printing',
    businessName: 'Mahajan Block Prints',
    tagline: 'Traditional Hand-Block Printing',
    bio: 'Block printing expert creating stunning fabric designs. Traditional hand-block printing on cotton and silk.',
    yearsOfExperience: '13 years',
    teamSize: '2-5 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 12,
  },
  {
    fullName: 'Anil Mane',
    email: 'anil.mane@demo.kalasetu.com',
    phoneNumber: '+919876543222',
    password: 'Password123',
    craft: 'Glass Art',
    businessName: 'Mane Stained Glass Studio',
    tagline: 'Artistic Stained Glass & Glass Painting',
    bio: 'Glass artist specializing in stained glass windows, decorative items, and traditional glass painting techniques.',
    yearsOfExperience: '16 years',
    teamSize: '2-5 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 15,
  },
  {
    fullName: 'Sunita Rane',
    email: 'sunita.rane@demo.kalasetu.com',
    phoneNumber: '+919876543223',
    password: 'Password123',
    craft: 'Paper Craft',
    businessName: 'Rane Paper Arts',
    tagline: 'Paper Mache & Decorative Paper Art',
    bio: 'Paper craft specialist creating beautiful paper mache items, decorative pieces, and traditional paper art.',
    yearsOfExperience: '7 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 8,
  },
  {
    fullName: 'Deepak Gaikwad',
    email: 'deepak.gaikwad@demo.kalasetu.com',
    phoneNumber: '+919876543224',
    password: 'Password123',
    craft: 'Cane & Rattan',
    businessName: 'Gaikwad Rattan Furniture',
    tagline: 'Handcrafted Cane & Rattan Furniture',
    bio: 'Cane and rattan furniture maker. Expert in creating durable and beautiful traditional wicker furniture.',
    yearsOfExperience: '19 years',
    teamSize: '5-10 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 18,
  },
  {
    fullName: 'Lata Patwardhan',
    email: 'lata.patwardhan@demo.kalasetu.com',
    phoneNumber: '+919876543225',
    password: 'Password123',
    craft: 'Folk Painting',
    businessName: 'Patwardhan Madhubani Art',
    tagline: 'Madhubani & Traditional Folk Art',
    bio: 'Madhubani art specialist preserving traditional Bihar folk art. Creates vibrant paintings on canvas and walls.',
    yearsOfExperience: '17 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 12,
  },
  {
    fullName: 'Sachin Nikam',
    email: 'sachin.nikam@demo.kalasetu.com',
    phoneNumber: '+919876543226',
    password: 'Password123',
    craft: 'Natural Materials',
    businessName: 'Nikam Eco Crafts',
    tagline: 'Eco-Friendly Natural Material Crafts',
    bio: 'Artisan specializing in coconut shell crafts. Creates eco-friendly products and decorative items from natural materials.',
    yearsOfExperience: '6 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 10,
  },
  {
    fullName: 'Vaishali Sawant',
    email: 'vaishali.sawant@demo.kalasetu.com',
    phoneNumber: '+919876543227',
    password: 'Password123',
    craft: 'Decorative Art',
    businessName: 'Sawant Rangoli Art',
    tagline: 'Professional Rangoli & Floor Decoration',
    bio: 'Professional Rangoli artist creating stunning floor art for festivals, weddings, and special occasions.',
    yearsOfExperience: '10 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 15,
  },
  {
    fullName: 'Mangesh Kadam',
    email: 'mangesh.kadam@demo.kalasetu.com',
    phoneNumber: '+919876543228',
    password: 'Password123',
    craft: 'Metal Casting',
    businessName: 'Kadam Dhokra Art',
    tagline: 'Traditional Dhokra & Bronze Casting',
    bio: 'Dhokra metal casting expert. Traditional lost-wax technique for creating unique bronze figurines and artifacts.',
    yearsOfExperience: '21 years',
    teamSize: '2-5 people',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'small_business',
    serviceRadius: 20,
  },
  {
    fullName: 'Asha Deshpande',
    email: 'asha.deshpande@demo.kalasetu.com',
    phoneNumber: '+919876543229',
    password: 'Password123',
    craft: 'Paper Quilling',
    businessName: 'Deshpande Quilling Studio',
    tagline: 'Intricate Paper Quilling Art',
    bio: 'Paper quilling specialist creating intricate designs, greeting cards, and decorative wall art.',
    yearsOfExperience: '5 years',
    teamSize: 'Solo',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    businessType: 'individual',
    serviceRadius: 8,
  }
];

// Function to create sample artisans
const seedArtisans = async () => {
  try {
    console.log('\n🌱 Starting to seed artisans...\n');
    console.log('📊 Total artisans to create: ' + sampleArtisans.length);
    console.log('📍 All artisans will be located in Pune\n');
    console.log('─'.repeat(70));

    let createdCount = 0;
    let skippedCount = 0;

    // Create artisans
    for (let i = 0; i < sampleArtisans.length; i++) {
      const artisanData = sampleArtisans[i];
      const location = puneLocations[i % puneLocations.length];

      // Check if artisan already exists
      const existingArtisan = await Artisan.findOne({ email: artisanData.email });
      if (existingArtisan) {
        console.log(`⏭️  Skipping ${artisanData.fullName} - already exists`);
        skippedCount++;
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(artisanData.password, salt);

      // Create artisan object (matching current schema structure)
      const newArtisan = new Artisan({
        fullName: artisanData.fullName,
        email: artisanData.email,
        phoneNumber: artisanData.phoneNumber,
        password: hashedPassword,
        craft: artisanData.craft,
        businessName: artisanData.businessName,
        tagline: artisanData.tagline,
        bio: artisanData.bio,
        yearsOfExperience: artisanData.yearsOfExperience,
        teamSize: artisanData.teamSize,
        languagesSpoken: artisanData.languagesSpoken,
        businessType: artisanData.businessType,
        serviceRadius: artisanData.serviceRadius,
        location: {
          type: 'Point',
          coordinates: location.coordinates, // [longitude, latitude]
          address: location.address,
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '411038'
        },
        profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(artisanData.fullName)}&size=400&background=random&rounded=true`,
        businessPhone: artisanData.phoneNumber,
        whatsappNumber: artisanData.phoneNumber,
        workingHours: {
          monday: { start: '09:00', end: '18:00', active: true },
          tuesday: { start: '09:00', end: '18:00', active: true },
          wednesday: { start: '09:00', end: '18:00', active: true },
          thursday: { start: '09:00', end: '18:00', active: true },
          friday: { start: '09:00', end: '18:00', active: true },
          saturday: { start: '09:00', end: '15:00', active: true },
          sunday: { start: '', end: '', active: false }
        },
        emergencyServices: false,
        minimumBookingNotice: 24,
        // Stats/Metrics
        profileViews: Math.floor(Math.random() * 100) + 10,
        totalBookings: Math.floor(Math.random() * 50) + 5,
        completedBookings: Math.floor(Math.random() * 48) + 5,
        cancelledBookings: Math.floor(Math.random() * 3),
        totalEarnings: Math.floor(Math.random() * 50000) + 10000,
        averageRating: parseFloat((Math.random() * 1 + 4).toFixed(1)), // 4.0-5.0
        totalReviews: Math.floor(Math.random() * 30) + 5,
        responseRate: 90 + Math.floor(Math.random() * 10),
        acceptanceRate: 85 + Math.floor(Math.random() * 15),
        // Auth Settings
        subscriptionPlan: 'free',
        autoAcceptBookings: false,
        bufferTimeBetweenBookings: 2,
        maxBookingsPerDay: 5,
        advancePaymentPercentage: 20,
      });

      await newArtisan.save();
      console.log(`✅ Created: ${artisanData.fullName.padEnd(20)} | ${artisanData.craft.padEnd(20)} | ${location.name}`);
      createdCount++;
    }

    console.log('─'.repeat(70));
    console.log('\n🎉 Seeding complete!\n');
    console.log(`✅ Created: ${createdCount} artisans`);
    console.log(`⏭️  Skipped: ${skippedCount} artisans (already exist)`);
    console.log(`📊 Total in database: ${await Artisan.countDocuments()}`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('─'.repeat(70));
    console.log('Email:    rajesh.patil@demo.kalasetu.com');
    console.log('Password: Password123');
    console.log('\n(All demo artisans use the same password: Password123)');
    console.log('─'.repeat(70));

    console.log('\n📍 Artisan Locations in Pune:');
    sampleArtisans.forEach((artisan, idx) => {
      const location = puneLocations[idx % puneLocations.length];
      console.log(`   ${(idx + 1).toString().padStart(2)}. ${artisan.fullName.padEnd(20)} → ${location.name}`);
    });

    console.log('\n✨ Demo Features:');
    console.log('  ✓ Search Nearby - All artisans scattered across Pune (2-25 km range)');
    console.log('  ✓ Search by Craft - 20 different craft categories');
    console.log('  ✓ View Profiles - Complete profiles with ratings & reviews');
    console.log('  ✓ Map Integration - Real coordinates for Google Maps');
    console.log('  ✓ Booking System - Ready for demo bookings');

    console.log('\n🚀 Next Steps:');
    console.log('  1. Start your app: npm run dev');
    console.log('  2. Try searching for artisans nearby');
    console.log('  3. Filter by craft category');
    console.log('  4. View detailed artisan profiles');
    console.log('  5. (Optional) Index to Algolia: node scripts/indexArtisans.js\n');
    
  } catch (error) {
    console.error('❌ Error seeding artisans:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await seedArtisans();
};

run();
