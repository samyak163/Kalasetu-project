// Script to seed 3 demo artisans per category (all in Pune)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import connectDB from '../config/db.js';
import { indexArtisan } from '../utils/algolia.js';

dotenv.config();

const categories = [
  'Handicrafts',
  'Home Services',
  'Food & Catering',
  'Clothing & Tailoring',
  'Wellness & Beauty',
];

const puneLocations = [
  { address: 'Kothrud, Pune', city: 'Pune', coordinates: [73.8077, 18.5074] },
  { address: 'Koregaon Park, Pune', city: 'Pune', coordinates: [73.9007, 18.5362] },
  { address: 'Deccan Gymkhana, Pune', city: 'Pune', coordinates: [73.8415, 18.5167] },
  { address: 'Baner, Pune', city: 'Pune', coordinates: [73.7806, 18.5590] },
  { address: 'Viman Nagar, Pune', city: 'Pune', coordinates: [73.9112, 18.5679] },
  { address: 'Aundh, Pune', city: 'Pune', coordinates: [73.8037, 18.5603] },
];

const demoPassword = 'DemoArtisan123';

async function seedDemoArtisans() {
  await connectDB();
  let created = 0;
  for (const category of categories) {
    for (let i = 1; i <= 3; i++) {
      const loc = puneLocations[(created + i) % puneLocations.length];
      const email = `${category.toLowerCase().replace(/\s+/g, '')}${i}@demo.kalasetu.com`;
      const exists = await Artisan.findOne({ email });
      if (exists) continue;
        const artisan = await Artisan.create({
          fullName: `${category} Demo Artisan ${i}`,
          email: `${category.toLowerCase().replace(/\s+/g, '')}${i}@demo.kalasetu.com`,
          password: demoPassword,
          craft: category,
          location: {
            type: 'Point',
            coordinates: loc.coordinates,
            address: loc.address,
            city: loc.city,
            state: 'Maharashtra',
            country: 'India',
            postalCode: '411001',
          },
          bio: 'Sample demo artisan for category.',
          profileImageUrl: 'https://placehold.co/100x100/A55233/FFFFFF?text=Artisan',
          portfolioImageUrls: [
            'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&q=80',
            'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80'
          ],
          languagesSpoken: ['English', 'Hindi', 'Marathi'],
          yearsOfExperience: '5-10 years',
          teamSize: 'solo',
          emailVerified: true,
          isVerified: true,
          // Ensure all accounts are verified and not suspended
          isActive: true,
          averageRating: 4.8,
          totalReviews: 25,
          totalBookings: 120,
          totalEarnings: 150000,
      });
      try {
        await indexArtisan(artisan);
      } catch (error) {
        console.warn(`Algolia indexing skipped for ${artisan.fullName}:`, error.message);
      }
      created++;
    }
  }
  console.log(`Seeded ${created} demo artisans.`);
  mongoose.connection.close();
}

seedDemoArtisans().catch(e => { console.error(e); mongoose.connection.close(); });
