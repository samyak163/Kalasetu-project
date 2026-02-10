import mongoose from 'mongoose';

const artisanServiceSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  categoryName: { type: String, required: true, trim: true }, // denormalized for search
  name: { type: String, required: true, trim: true }, // index handled by composite indexes below
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  durationMinutes: { type: Number, default: 60 },
  images: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

artisanServiceSchema.index({ name: 'text', description: 'text', categoryName: 'text' });
artisanServiceSchema.index({ categoryName: 1, name: 1 });

const ArtisanService = mongoose.model('ArtisanService', artisanServiceSchema);
export default ArtisanService;


