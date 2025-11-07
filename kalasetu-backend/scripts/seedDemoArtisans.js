// Script to seed 3 demo artisans per category (all in Pune)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import connectDB from '../config/db.js';

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
  const hash = await bcrypt.hash(demoPassword, 10);

  let created = 0;
  for (const category of categories) {
    for (let i = 1; i <= 3; i++) {
      const loc = puneLocations[(created + i) % puneLocations.length];
      const email = `${category.toLowerCase().replace(/\s+/g, '')}${i}@demo.kalasetu.com`;
      const exists = await Artisan.findOne({ email });
      if (exists) continue;
        await Artisan.create({
          fullName: `${category} Demo Artisan ${i}`,
          email: `${category.toLowerCase().replace(/\s+/g, '')}${i}@demo.kalasetu.com`,
          password: 'Demo@1234',
          craft: category,
          location: {
            type: 'Point',
            coordinates: [73.8567, 18.5204], // Pune
            address: 'Pune, Maharashtra, India',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            postalCode: '411001',
          },
          bio: 'Sample demo artisan for category.',
          profileImageUrl: 'https://placehold.co/100x100/A55233/FFFFFF?text=Artisan',
          yearsOfExperience: '5-10 years',
          teamSize: 'solo',
          languagesSpoken: ['English', 'Hindi', 'Marathi'],
          emailVerified: true,
          // Ensure all accounts are verified and not suspended
          isActive: true,
          isSuspended: false,
          allowed: true,
          // Add more fields as needed
      });
      created++;
    }
  }
  console.log(`Seeded ${created} demo artisans.`);
  mongoose.connection.close();
}

seedDemoArtisans().catch(e => { console.error(e); mongoose.connection.close(); });
