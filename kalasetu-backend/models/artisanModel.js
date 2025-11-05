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
    // Optional unique public slug (edit-once vanity URL)
    slug: { type: String, unique: true, sparse: true, index: true },
  // Optional link to Firebase Authentication user UID
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // sparse: true allows multiple null values
    phoneNumber: { type: String, unique: true, sparse: true }, // sparse: true allows multiple null values
    password: { type: String, required: true },
    craft: { type: String, default: '' },
  // Business/Profile Enhancements
  businessName: { type: String, default: '' },
  tagline: { type: String, default: '' },
    // Location info with GeoJSON point (backward compatible)
    location: {
      type: new mongoose.Schema({
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined }, // [lng, lat]
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        postalCode: { type: String, default: '' },
      }, { _id: false, strict: false }),
      default: undefined,
    },
    bio: { type: String, default: 'A passionate local artisan.' },
    profileImageUrl: { type: String, default: 'https://placehold.co/100x100/A55233/FFFFFF?text=Profile' },
    profileImagePublicId: { type: String, default: '' },
    coverImageUrl: { type: String, default: 'https://placehold.co/800x300/A55233/FFFFFF?text=KalaSetu' },
    portfolioImageUrls: { type: [String], default: [] },
    yearsOfExperience: { type: String, default: '' }, // e.g., '5-10 years'
    teamSize: { type: String, default: '' }, // e.g., 'solo', '2-5'
    languagesSpoken: { type: [String], default: [] },
    certifications: {
      type: [new mongoose.Schema({
        name: { type: String, required: true },
        issuingAuthority: { type: String, default: '' },
        certificateNumber: { type: String, default: '' },
        certificateUrl: { type: String, default: '' },
        issueDate: { type: Date },
        expiryDate: { type: Date },
      }, { _id: false })],
      default: []
    },
    // Contact Enhancements
    businessPhone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },

    // Work Preferences
    workingHours: {
      type: new mongoose.Schema({
        monday: { start: { type: String, default: '' }, end: { type: String, default: '' }, active: { type: Boolean, default: true } },
        tuesday: { start: { type: String, default: '' }, end: { type: String, default: '' }, active: { type: Boolean, default: true } },
        wednesday: { start: { type: String, default: '' }, end: { type: String, default: '' }, active: { type: Boolean, default: true } },
        thursday: { start: { type: String, default: '' }, end: { type: String, default: '' }, active: { type: Boolean, default: true } },
        friday: { start: { type: String, default: '' }, end: { type: String, default: '' }, active: { type: Boolean, default: true } },
        saturday: { start: { type: String, default: '' }, end: { type: String, default: '' }, active: { type: Boolean, default: true } },
        sunday: { start: { type: String, default: '' }, end: { type: String, default: '' }, active: { type: Boolean, default: false } },
      }, { _id: false }),
      default: undefined,
    },
    emergencyServices: { type: Boolean, default: false },
    serviceRadius: { type: Number, default: 0 }, // km
    minimumBookingNotice: { type: Number, default: 0 }, // hours

    // Verification Documents
    verificationDocuments: {
      type: new mongoose.Schema({
        aadhar: { url: { type: String, default: '' }, number: { type: String, default: '' }, verified: { type: Boolean, default: false }, verifiedAt: { type: Date } },
        pan: { url: { type: String, default: '' }, number: { type: String, default: '' }, verified: { type: Boolean, default: false }, verifiedAt: { type: Date } },
        policeVerification: { url: { type: String, default: '' }, verified: { type: Boolean, default: false }, verifiedAt: { type: Date } },
        businessLicense: { url: { type: String, default: '' }, number: { type: String, default: '' }, verified: { type: Boolean, default: false } },
        insurance: { url: { type: String, default: '' }, verified: { type: Boolean, default: false }, expiryDate: { type: Date } },
      }, { _id: false }),
      default: undefined,
    },

    // Bank Details (Sensitive fields can be encrypted in storage)
    bankDetails: {
      type: new mongoose.Schema({
        accountHolderName: { type: String, default: '' },
        accountNumber: { type: String, default: '' }, // may be encrypted
        ifscCode: { type: String, default: '' },
        bankName: { type: String, default: '' },
        branchName: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
      }, { _id: false }),
      default: undefined,
    },

    // Business & Compliance
    businessType: { type: String, enum: ['individual', 'small_business', 'company', ''], default: '' },
    gstNumber: { type: String, default: '' },
    gstVerified: { type: Boolean, default: false },

    // Stats / Metrics (basic)
    profileViews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },

    // Settings (minimal subset used by Profile Tab)
    autoAcceptBookings: { type: Boolean, default: false },
    bufferTimeBetweenBookings: { type: Number, default: 0 },
    maxBookingsPerDay: { type: Number, default: 0 },
    advancePaymentPercentage: { type: Number, default: 0 },

    // Notifications prefs (subset)
    notifications: {
      type: new mongoose.Schema({
        email: {
          newBooking: { type: Boolean, default: true },
          bookingConfirmation: { type: Boolean, default: true },
          paymentReceived: { type: Boolean, default: true },
          // Use alias to maintain backward compatibility with existing documents
          userMessage: { type: Boolean, default: true, alias: 'USERMessage' },
          newReview: { type: Boolean, default: true },
          promotional: { type: Boolean, default: false },
          weeklySummary: { type: Boolean, default: true },
        },
        sms: {
          urgentBooking: { type: Boolean, default: true },
          bookingReminder: { type: Boolean, default: true },
          marketing: { type: Boolean, default: false },
        },
        push: {
          enabled: { type: Boolean, default: true },
          sound: { type: Boolean, default: true },
          quietHoursStart: { type: String, default: '' },
          quietHoursEnd: { type: String, default: '' },
        }
      }, { _id: false }),
      default: undefined,
    },

    // Subscription / Presence / Vacation
    subscriptionPlan: { type: String, default: 'free' },
    subscriptionExpiresAt: { type: Date },
    lastLoginAt: { type: Date },
    isOnline: { type: Boolean, default: false },
    vacationMode: {
      type: new mongoose.Schema({
        enabled: { type: Boolean, default: false },
        startDate: { type: Date },
        endDate: { type: Date },
        autoMessage: { type: String, default: '' },
      }, { _id: false }),
      default: undefined,
    },

    // Security / Auth State
    lockUntil: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

  // Contact change verification (OTP flows)
  pendingEmail: { type: String, default: '' },
  emailVerificationCode: { type: String, default: '' },
  emailVerificationExpires: { type: Date },
  pendingPhoneNumber: { type: String, default: '' },
  phoneVerificationCode: { type: String, default: '' },
  phoneVerificationExpires: { type: Date },
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

// Geospatial index for proximity queries (index the GeoJSON field itself)
artisanSchema.index({ location: '2dsphere' });

// Additional useful indexes (email and phoneNumber already have unique: true in schema definition)
artisanSchema.index({ createdAt: -1 });
artisanSchema.index({ 'location.city': 1, 'location.state': 1 });

const Artisan = mongoose.model('Artisan', artisanSchema);
export default Artisan;