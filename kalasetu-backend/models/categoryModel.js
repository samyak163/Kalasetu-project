import mongoose from 'mongoose';

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


