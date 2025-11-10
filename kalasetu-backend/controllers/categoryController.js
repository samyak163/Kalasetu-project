import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/categoryModel.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ name: 1 }).lean();
  res.json({ success: true, data: categories });
});

export const getCategoryServices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id).lean();
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category.suggestedServices || [] });
});

export const getServiceSuggestions = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .select('name slug suggestedServices active')
    .sort({ active: -1, name: 1 })
    .lean();

  const primary = categories.filter((c) => c.active);
  const extras = categories
    .filter((c) => !c.active)
    .flatMap((c) => (c.suggestedServices || []).map((s) => s.name))
    .filter(Boolean);

  res.json({
    success: true,
    categories: primary,
    extraServices: extras,
  });
});


