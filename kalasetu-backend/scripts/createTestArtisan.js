// Create or reset TEST ARTISAN account
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';

dotenv.config();

const createTestArtisan = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const email = 'artisan@test.com';

        // Delete existing artisan if exists
        const existing = await Artisan.findOne({ email });
        if (existing) {
            await Artisan.deleteOne({ email });
            console.log('🗑️  Deleted existing test artisan (including locked account)\n');
        }

        // Create fresh artisan account - FULLY VERIFIED AND UNLOCKED
        const artisan = await Artisan.create({
            fullName: 'Test Artisan',
            email: email,
            password: 'Test@123456',
            phoneNumber: '+919876543211',
            emailVerified: true,
            phoneVerified: true,
            isVerified: true,
            isActive: true,
            isLocked: false,
            loginAttempts: 0,
            craft: 'Pottery',
            businessName: 'Test Artisan Pottery',
            tagline: 'Handcrafted Traditional Pottery',
            bio: 'This is a verified test artisan account for development and testing.',
            yearsOfExperience: '5+ years',
            teamSize: 'Solo',
            languagesSpoken: ['English', 'Hindi'],
            location: {
                type: 'Point',
                coordinates: [73.8567, 18.5204], // Pune
                address: 'Pune, Maharashtra',
                city: 'Pune',
                state: 'Maharashtra',
                country: 'India',
                postalCode: '411001'
            }
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ TEST ARTISAN CREATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📧 Email:         artisan@test.com');
        console.log('🔑 Password:      Test@123456');
        console.log('🌐 Login:         /artisan/login');
        console.log('✅ Verified:      YES');
        console.log('✅ Active:        YES');
        console.log('🔓 Unlocked:      YES');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestArtisan();
