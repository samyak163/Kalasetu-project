// Generate Database Schema Documentation for Report
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import all models
import Admin from '../models/adminModel.js';
import Artisan from '../models/artisanModel.js';
import ArtisanService from '../models/artisanServiceModel.js';
import Availability from '../models/availabilityModel.js';
import Booking from '../models/bookingModel.js';
import CallHistory from '../models/callHistoryModel.js';
import Category from '../models/categoryModel.js';
import Notification from '../models/notificationModel.js';
import Payment from '../models/paymentModel.js';
import Review from '../models/reviewModel.js';
import User from '../models/userModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateDatabaseDoc = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const collections = [
      { name: 'Admin', model: Admin, description: 'Admin users who manage the platform' },
      { name: 'Artisan', model: Artisan, description: 'Service providers (artisans) registered on the platform' },
      { name: 'User', model: User, description: 'End users who book services' },
      { name: 'Category', model: Category, description: 'Service categories (Handicrafts, Home Services, etc.)' },
      { name: 'ArtisanService', model: ArtisanService, description: 'Services offered by artisans' },
      { name: 'Booking', model: Booking, description: 'Service booking requests and appointments' },
      { name: 'Review', model: Review, description: 'Customer reviews and ratings for artisans' },
      { name: 'Payment', model: Payment, description: 'Payment transactions via Razorpay' },
      { name: 'Notification', model: Notification, description: 'Push notifications sent to users' },
      { name: 'Availability', model: Availability, description: 'Artisan availability schedules' },
      { name: 'CallHistory', model: CallHistory, description: 'Video call history records' }
    ];

    let reportContent = '';
    let textContent = '';
    
    // Markdown header
    reportContent += '# KalaSetu Database Schema Documentation\n\n';
    reportContent += `**Generated on:** ${new Date().toLocaleString()}\n\n`;
    reportContent += '**Database:** MongoDB Atlas\n\n';
    reportContent += '---\n\n';

    // Text version header
    textContent += '═══════════════════════════════════════════════════════════════\n';
    textContent += '        KALASETU DATABASE SCHEMA DOCUMENTATION\n';
    textContent += '═══════════════════════════════════════════════════════════════\n\n';
    textContent += `Generated on: ${new Date().toLocaleString()}\n`;
    textContent += `Database Type: MongoDB Atlas (NoSQL)\n`;
    textContent += `Total Collections: ${collections.length}\n\n`;
    textContent += '═══════════════════════════════════════════════════════════════\n\n';

    // Get actual data counts
    console.log('\n📊 Fetching collection statistics...\n');

    for (const collection of collections) {
      const count = await collection.model.countDocuments();
      const schema = collection.model.schema.obj;
      const indexes = collection.model.schema.indexes();

      console.log(`✓ ${collection.name}: ${count} documents`);

      // Markdown format
      reportContent += `## ${collection.name} Collection\n\n`;
      reportContent += `**Description:** ${collection.description}\n\n`;
      reportContent += `**Documents Count:** ${count}\n\n`;
      reportContent += '### Fields (Schema)\n\n';
      reportContent += '| Field Name | Data Type | Required | Description |\n';
      reportContent += '|------------|-----------|----------|-------------|\n';

      // Text format
      textContent += `${'─'.repeat(63)}\n`;
      textContent += `COLLECTION: ${collection.name.toUpperCase()}\n`;
      textContent += `${'─'.repeat(63)}\n`;
      textContent += `Description: ${collection.description}\n`;
      textContent += `Total Records: ${count}\n\n`;
      textContent += 'FIELDS:\n';

      // Extract fields
      const fields = extractFields(schema);
      fields.forEach(field => {
        // Markdown
        reportContent += `| ${field.name} | ${field.type} | ${field.required ? '✓' : '-'} | ${field.description || '-'} |\n`;
        
        // Text
        textContent += `  • ${field.name}\n`;
        textContent += `    Type: ${field.type}\n`;
        textContent += `    Required: ${field.required ? 'Yes' : 'No'}\n`;
        if (field.description) textContent += `    Description: ${field.description}\n`;
        textContent += '\n';
      });

      // Indexes
      if (indexes.length > 0) {
        reportContent += '\n### Indexes\n\n';
        textContent += 'INDEXES:\n';
        indexes.forEach((index, i) => {
          const indexFields = Object.keys(index[0]).join(', ');
          reportContent += `- ${indexFields}\n`;
          textContent += `  ${i + 1}. ${indexFields}\n`;
        });
      }

      reportContent += '\n---\n\n';
      textContent += '\n';
    }

    // Summary section
    reportContent += '## Database Summary\n\n';
    reportContent += '| Collection | Documents | Purpose |\n';
    reportContent += '|------------|-----------|----------|\n';
    
    textContent += '═══════════════════════════════════════════════════════════════\n';
    textContent += '                    DATABASE SUMMARY\n';
    textContent += '═══════════════════════════════════════════════════════════════\n\n';

    for (const collection of collections) {
      const count = await collection.model.countDocuments();
      reportContent += `| ${collection.name} | ${count} | ${collection.description} |\n`;
      textContent += `${collection.name.padEnd(20)} : ${String(count).padEnd(8)} documents\n`;
    }

    textContent += '\n═══════════════════════════════════════════════════════════════\n';

    // Write files
    const outputDir = path.join(__dirname, '../docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const mdFilePath = path.join(outputDir, 'DATABASE_SCHEMA.md');
    const txtFilePath = path.join(outputDir, 'DATABASE_SCHEMA.txt');

    fs.writeFileSync(mdFilePath, reportContent);
    fs.writeFileSync(txtFilePath, textContent);

    console.log('\n✅ Documentation generated successfully!\n');
    console.log(`📄 Markdown: ${mdFilePath}`);
    console.log(`📄 Text: ${txtFilePath}`);
    console.log('\n💡 You can copy either file to your report!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

function extractFields(schema, prefix = '') {
  const fields = [];

  for (const [key, value] of Object.entries(schema)) {
    const fieldName = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object') {
      if (value.type) {
        // Simple field with type
        const typeName = getTypeName(value.type);
        fields.push({
          name: fieldName,
          type: typeName,
          required: value.required || false,
          description: getFieldDescription(key, typeName)
        });
      } else if (value.constructor && value.constructor.name === 'Schema') {
        // Nested schema
        const nestedFields = extractFields(value.obj, fieldName);
        fields.push(...nestedFields);
      } else if (!key.startsWith('_')) {
        // Nested object
        const nestedFields = extractFields(value, fieldName);
        fields.push(...nestedFields);
      }
    }
  }

  return fields;
}

function getTypeName(type) {
  if (Array.isArray(type)) {
    return `Array<${getTypeName(type[0])}>`;
  }
  if (typeof type === 'function') {
    return type.name;
  }
  if (type && type.name) {
    return type.name;
  }
  return 'Mixed';
}

function getFieldDescription(fieldName, typeName) {
  const descriptions = {
    _id: 'Unique MongoDB identifier',
    email: 'Email address',
    password: 'Encrypted password',
    fullName: 'Full name of the user',
    phoneNumber: 'Contact phone number',
    createdAt: 'Record creation timestamp',
    updatedAt: 'Last update timestamp',
    isActive: 'Account active status',
    isVerified: 'Verification status',
    rating: 'Rating score',
    location: 'Geographic location data',
    price: 'Price in INR',
    status: 'Current status',
    description: 'Detailed description'
  };
  return descriptions[fieldName] || '';
}

generateDatabaseDoc();
