import mongoose from 'mongoose';

const artisanSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    craft: { type: String, required: true },
    location: { type: String, required: true },
    bio: { type: String, default: 'A passionate local artisan.' },
    profileImageUrl: { type: String, default: 'https://placehold.co/100x100/A55233/FFFFFF?text=Profile' },
    coverImageUrl: { type: String, default: 'https://placehold.co/800x300/A55233/FFFFFF?text=KalaSetu' },
    portfolioImageUrls: { type: [String], default: [] },
}, { timestamps: true });

const Artisan = mongoose.model('Artisan', artisanSchema);
export default Artisan;