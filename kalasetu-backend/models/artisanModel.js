import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

// We create a generator for short, URL-friendly, unique IDs (like YouTube's).
// This will generate an 8-character ID using numbers and lowercase letters.
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

const artisanSchema = new mongoose.Schema({
    // THE UPGRADE: Add the publicId field.
    publicId: {
        type: String,
        default: () => `ks_${nanoid()}`, // It will automatically generate an ID like "ks_a1b2c3d4"
        unique: true, // Guarantees no two artisans have the same public ID
        index: true, // Makes searching by this ID very fast
    },
  // Optional link to Firebase Authentication user UID
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // sparse: true allows multiple null values
    phoneNumber: { type: String, unique: true, sparse: true }, // sparse: true allows multiple null values
    password: { type: String, required: true },
    craft: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: 'A passionate local artisan.' },
    profileImageUrl: { type: String, default: 'https://placehold.co/100x100/A55233/FFFFFF?text=Profile' },
    coverImageUrl: { type: String, default: 'https://placehold.co/800x300/A55233/FFFFFF?text=KalaSetu' },
    portfolioImageUrls: { type: [String], default: [] },
    lockUntil: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true });

// Add helpers to model for login lockout
artisanSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5 && !this.isLocked()) {
      this.lockUntil = Date.now() + 15 * 60 * 1000;
    }
  }
  await this.save({ validateBeforeSave: false });
};

artisanSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save({ validateBeforeSave: false });
};

artisanSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const Artisan = mongoose.model('Artisan', artisanSchema);
export default Artisan;