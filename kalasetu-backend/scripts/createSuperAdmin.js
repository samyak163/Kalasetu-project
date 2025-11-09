import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/adminModel.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const createSuperAdmin = async () => {
  try {
    console.log('🔐 Creating Super Admin...\n');
    
    // Delete ALL existing admins
    console.log('🗑️  Deleting existing admin(s)...');
    const deleteResult = await Admin.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} admin(s)\n`);
    const superAdminData = {
      fullName: 'Super Admin',
  email: 'showcase.admin@kalasetu.com',
      password: 'SuperAdmin@123',
      role: 'super_admin',
      permissions: {
        users: { view: true, edit: true, delete: true, verify: true },
        artisans: { view: true, edit: true, delete: true, verify: true, suspend: true },
        bookings: { view: true, edit: true, cancel: true, refund: true },
        payments: { view: true, process: true, refund: true },
        reviews: { view: true, moderate: true, delete: true },
        analytics: { view: true, export: true },
        settings: { view: true, edit: true }
      },
      isActive: true
    };
    const admin = await Admin.create(superAdminData);
    console.log('✅ Super Admin Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', 'SuperAdmin@123');
    console.log('👤 Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!\n');
    console.log('🌐 Login at: http://localhost:5173/admin/login\n');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

const run = async () => {
  await connectDB();
  await createSuperAdmin();
};

run();


