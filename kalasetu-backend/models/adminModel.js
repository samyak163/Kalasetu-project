/**
 * @file adminModel.js — Admin Account Schema
 * @collection admins
 *
 * Platform administrators who manage artisans, users, bookings, payments,
 * reviews, and platform settings through the admin panel.
 *
 * Separate from User and Artisan models — admins have their own:
 *  - Collection (admins)
 *  - Cookie (admin_token, not ks_auth)
 *  - JWT payload (includes role + permissions)
 *  - Auth middleware (protectAdmin)
 *
 * Role hierarchy:
 *  - super_admin — Full access to all resources
 *  - admin       — Configurable permissions per resource
 *  - moderator   — Typically reviews + artisan management
 *  - support     — Typically view-only + support tickets
 *
 * Granular permissions (per resource × action):
 *  users, artisans, bookings, payments, reviews, analytics, settings
 *  Each has specific actions (view, edit, delete, verify, suspend, etc.)
 *
 * Instance methods:
 *  - matchPassword(entered)  — Compare password against bcrypt hash
 *  - getSignedJwtToken()     — Generate JWT with role + permissions in payload
 *  - logActivity(action, target, targetId, details) — Append to audit trail (capped at 100)
 *
 * @exports {Model} Admin — Mongoose model
 *
 * @see middleware/authMiddleware.js — `protectAdmin` reads admin_token cookie
 * @see middleware/authMiddleware.js — `checkPermission(resource, action)` for granular checks
 * @see controllers/adminAuthController.js — Admin login
 * @see controllers/adminDashboardController.js — Admin analytics
 */

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
  // Cap loginHistory to prevent unbounded document growth
  if (this.loginHistory && this.loginHistory.length > 20) {
    this.loginHistory = this.loginHistory.slice(-20);
  }
  await this.save();
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;


