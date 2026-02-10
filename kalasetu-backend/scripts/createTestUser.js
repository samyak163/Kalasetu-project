// Create or reset TEST USER account
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const email = 'user@test.com';

        // Delete existing user if exists
        const existing = await User.findOne({ email });
        if (existing) {
            await User.deleteOne({ email });
            console.log('🗑️  Deleted existing test user\n');
        }

        // Create fresh user account
        const user = await User.create({
            fullName: 'Test User',
            email: email,
            password: 'Test@123456',
            phoneNumber: '+919876543210',
            emailVerified: true,
            phoneVerified: true,
            role: 'user'
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ TEST USER CREATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📧 Email:    user@test.com');
        console.log('🔑 Password: Test@123456');
        console.log('🌐 Login:    /user/login');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestUser();
