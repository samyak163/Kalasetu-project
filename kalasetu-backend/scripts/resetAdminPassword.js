import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/adminModel.js';

dotenv.config();

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

  const adminEmail = 'showcase.admin@kalasetu.com';
    const newPassword = 'SuperAdmin@123';

    console.log(`🔍 Looking for admin: ${adminEmail}`);
    const admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      console.log('❌ Admin not found.');
      process.exit(1);
    }

    console.log('✅ Admin found!\n');
    console.log('🔐 Updating password...');
    
    // This will trigger the 'pre-save' hook in adminModel
    // to automatically hash the new password
    admin.password = newPassword;
    await admin.save();

    console.log(`✅ Successfully updated password for ${adminEmail}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

resetPassword();
