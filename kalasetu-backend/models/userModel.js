import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: [true, 'Please provide your full name'] 
    },
    email: { 
        type: String, 
        required: [true, 'Please provide your email'], 
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    password: { 
        type: String, 
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // This will hide the password from default queries
    },
}, { timestamps: true });

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


const User = mongoose.model('User', userSchema);
export default User;
