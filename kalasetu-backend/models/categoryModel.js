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

categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;


