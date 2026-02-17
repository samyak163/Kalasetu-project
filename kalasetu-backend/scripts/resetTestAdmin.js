// Create or reset TEST ADMIN account
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/adminModel.js';

dotenv.config();

const resetTestAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const email = 'admin@kalasetu.com';

        // Delete existing admin if exists
        const existing = await Admin.findOne({ email });
        if (existing) {
            await Admin.deleteOne({ email });
            console.log('🗑️  Deleted existing admin account\n');
        }

        // Create fresh admin account
        const admin = await Admin.create({
            fullName: 'KalaSetu Admin',
            email: email,
            password: 'Admin@123456',
            role: 'super_admin',
            phoneNumber: '+919876543212',
            emailVerified: true,
            isActive: true
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📧 Email:    admin@kalasetu.com');
        console.log('🔑 Password: Admin@123456');
        console.log('🌐 Login:    /admin/login');
        console.log('👑 Role:     Super Admin');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

resetTestAdmin();
