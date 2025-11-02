/**
 * Script to bulk index existing artisans to Algolia
 * Run with: node scripts/indexArtisans.js
 */

import mongoose from 'mongoose';
import { config } from '../config/env.config.js';
import Artisan from '../models/artisanModel.js';
import { bulkIndexArtisans, configureAlgoliaIndex } from '../utils/algolia.js';

const indexAllArtisans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, config.options);
    console.log('✅ Connected to MongoDB');

    // Configure Algolia index settings
    console.log('📝 Configuring Algolia index...');
    await configureAlgoliaIndex();

    // Fetch all artisans
    console.log('📦 Fetching artisans from database...');
    const artisans = await Artisan.find({}).select('-password');
    console.log(`Found ${artisans.length} artisans`);

    if (artisans.length === 0) {
      console.log('⚠️ No artisans found to index');
      process.exit(0);
    }

    // Bulk index them
    console.log('🚀 Indexing artisans to Algolia...');
    await bulkIndexArtisans(artisans);

    console.log('✅ Successfully indexed all artisans');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

indexAllArtisans();

