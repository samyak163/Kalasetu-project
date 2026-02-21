/**
 * @file categoryModel.js — Service Category Schema
 * @collection categories
 *
 * Defines the top-level service categories that organize artisan offerings
 * (e.g., Mehndi, Carpentry, Pottery, Tailoring, Painting).
 *
 * Categories are seeded via `npm run seed:core` and rarely change at runtime.
 * They serve as:
 *  - Filter options on the search/browse page
 *  - Parent category for ArtisanService documents
 *  - Source of suggestedServices templates (shown when artisans create new services)
 *
 * Key fields:
 *  - name              — Display name (unique)
 *  - slug              — URL-friendly identifier (unique, used in frontend routes)
 *  - image             — Category icon/illustration URL
 *  - suggestedServices — Pre-defined service templates artisans can choose from
 *  - active            — Soft-delete flag
 *
 * @exports {Model} Category — Mongoose model
 *
 * @see scripts/seedCoreData.js — Seeds initial categories
 * @see models/artisanServiceModel.js — Services belong to a category
 * @see controllers/categoryController.js — Category CRUD
 */

import mongoose from 'mongoose';

/** Sub-schema for suggested service templates within a category */
const serviceTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
}, { _id: false });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  image: { type: String, default: '' },
  suggestedServices: { type: [serviceTemplateSchema], default: [] },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Note: name field already has unique: true which creates an index automatically
// No need for additional index declaration

const Category = mongoose.model('Category', categorySchema);
export default Category;


