// Check artisan account status
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artisan from '../models/artisanModel.js';

dotenv.config();

const checkArtisan = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const artisan = await Artisan.findOne({ email: 'artisan@test.com' });

        if (!artisan) {
            console.log('❌ Artisan account NOT FOUND');
            process.exit(1);
        }

        console.log('📊 ARTISAN ACCOUNT STATUS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:           ${artisan.email}`);
        console.log(`Full Name:       ${artisan.fullName}`);
        console.log(`Business Name:   ${artisan.businessName || 'N/A'}`);
        console.log(`Email Verified:  ${artisan.emailVerified ? '✅' : '❌'}`);
        console.log(`Phone Verified:  ${artisan.phoneVerified ? '✅' : '❌'}`);
        console.log(`Is Verified:     ${artisan.isVerified ? '✅' : '❌'}`);
        console.log(`Is Active:       ${artisan.isActive ? '✅' : '❌'}`);
        console.log(`Account Locked:  ${artisan.isLocked ? '🔒 YES' : '✅ NO'}`);
        console.log(`Login Attempts:  ${artisan.loginAttempts || 0}`);
        console.log(`Created:         ${artisan.createdAt}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkArtisan();
