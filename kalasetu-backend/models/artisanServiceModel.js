/**
 * @file artisanServiceModel.js — Artisan Service Offering Schema
 * @collection artisanservices
 *
 * Individual services offered by an artisan (e.g., "Traditional Mehndi - Bridal",
 * "Wood Carving - Custom Furniture"). Each artisan can have multiple services.
 *
 * Key fields:
 *  - artisan       — Reference to the Artisan who offers this service
 *  - category      — Reference to the Category (e.g., Mehndi, Carpentry)
 *  - categoryName  — Denormalized for search/filter without joining Category
 *  - name          — Service title
 *  - price         — Base price in INR
 *  - durationMinutes — Expected service duration
 *  - images        — Cloudinary URLs showcasing this specific service
 *  - isActive      — Soft-delete flag (inactive services hidden from search)
 *
 * Text index:
 *  - Full-text search across name, description, categoryName
 *    (used by MongoDB $text queries, complementing Algolia for backend-only search)
 *
 * @exports {Model} ArtisanService — Mongoose model
 *
 * @see controllers/artisanServiceController.js — Service CRUD
 * @see models/bookingModel.js — Bookings reference a specific service
 * @see models/categoryModel.js — Parent category with suggested service templates
 */

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


