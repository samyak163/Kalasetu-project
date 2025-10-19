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
}, { timestamps: true });

const Artisan = mongoose.model('Artisan', artisanSchema);
export default Artisan;