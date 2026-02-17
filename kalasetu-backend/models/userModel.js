import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: [true, 'Please provide your full name'] 
    },
    email: { 
        type: String, 
        required: false,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
            'Please fill a valid email address'
        ]
    },
    phoneNumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        trim: true,
        match: [
            /^\+?[0-9\-\s]{10,20}$/,
            'Please provide a valid phone number (minimum 10 digits)'
        ]
    },
    password: { 
        type: String, 
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // This will hide the password from default queries
    },
    lockUntil: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    // Email verification
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    emailVerified: { type: Boolean, default: false },
    // OTP fields for verification
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' }],
}, { timestamps: true });

// Helpful indexes (email already has unique: true in schema definition)
userSchema.index({ createdAt: -1 });

userSchema.pre('validate', function (next) {
    if (!this.email && !this.phoneNumber) {
        this.invalidate('email', 'Either email or phone number is required');
        this.invalidate('phoneNumber', 'Either email or phone number is required');
    }
    next();
});

// --- Mongoose Middleware (Robust "pre-save" hook) ---
// This function runs automatically BEFORE a new user is saved.
// We use 'function' instead of an arrow fn to get the 'this' context.
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next();
    }

    // Hash the password with a salt of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Mongoose Model Method ---
// This adds a custom method to all user documents
// We can now call user.matchPassword(enteredPassword)
userSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' refers to the hashed password in the database
    return await bcrypt.compare(enteredPassword, this.password);
};

// Add helpers to model for login lockout
userSchema.methods.incLoginAttempts = async function () {
  // If the lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5 && !this.isLocked()) {
      this.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    }
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};


const User = mongoose.model('User', userSchema);
export default User;
