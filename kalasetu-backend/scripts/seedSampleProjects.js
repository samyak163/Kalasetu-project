// Script to add sample projects for demo artisans
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';
import Project from '../models/Project.js';
import connectDB from '../config/db.js';

dotenv.config();

const sampleProjects = [
  {
    title: 'Handcrafted Pottery',
    description: 'A beautiful set of hand-thrown pottery made in Pune.',
    category: 'Pottery',
    images: ['https://placehold.co/400x300/8B5C2A/FFFFFF?text=Pottery'],
  },
  {
    title: 'Traditional Warli Painting',
    description: 'A vibrant Warli painting on canvas.',
    category: 'Painting',
    images: ['https://placehold.co/400x300/2A5C8B/FFFFFF?text=Warli+Art'],
  },
  {
    title: 'Handwoven Basket',
    description: 'Eco-friendly handwoven basket by Pune artisan.',
    category: 'Basketry',
    images: ['https://placehold.co/400x300/5C8B2A/FFFFFF?text=Basket'],
  },
];

async function seedSampleProjects() {
  await connectDB();
  const demoArtisans = await Artisan.find({ email: /@demo.kalasetu.com$/ });
  if (!demoArtisans.length) {
    console.log('No demo artisans found. Run seedDemoArtisans.js first.');
    mongoose.connection.close();
    return;
  }
  for (const artisan of demoArtisans) {
    for (const proj of sampleProjects) {
      await Project.create({
        artisan: artisan._id,
        title: proj.title,
        description: proj.description,
        category: proj.category,
        images: proj.images,
        isPublic: true,
      });
    }
    console.log(`Added sample projects to artisan: ${artisan.email}`);
  }
  mongoose.connection.close();
}

seedSampleProjects().catch(e => { console.error(e); mongoose.connection.close(); });
