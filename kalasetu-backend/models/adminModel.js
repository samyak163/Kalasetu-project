import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['super_admin', 'admin', 'moderator', 'support'], default: 'admin' },
  permissions: {
    users: {
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      verify: { type: Boolean, default: false }
    },
    artisans: {
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
      verify: { type: Boolean, default: true },
      suspend: { type: Boolean, default: true }
    },
    bookings: {
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      cancel: { type: Boolean, default: true },
      refund: { type: Boolean, default: false }
    },
    payments: {
      view: { type: Boolean, default: true },
      process: { type: Boolean, default: false },
      refund: { type: Boolean, default: false }
    },
    reviews: {
      view: { type: Boolean, default: true },
      moderate: { type: Boolean, default: true },
      delete: { type: Boolean, default: true }
    },
    analytics: {
      view: { type: Boolean, default: true },
      export: { type: Boolean, default: false }
    },
    settings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false }
    }
  },
  profileImage: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }],
  activityLog: [{
    action: String,
    target: String,
    targetId: mongoose.Schema.Types.ObjectId,
    details: Object,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: 'admin', permissions: this.permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

adminSchema.methods.logActivity = async function(action, target, targetId, details) {
  this.activityLog.push({ action, target, targetId, details, timestamp: new Date() });
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  await this.save();
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;


