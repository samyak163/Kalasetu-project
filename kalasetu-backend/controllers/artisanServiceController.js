import asyncHandler from '../utils/asyncHandler.js';
import ArtisanService from '../models/artisanServiceModel.js';
import Category from '../models/categoryModel.js';
import Artisan from '../models/artisanModel.js';

export const listServices = asyncHandler(async (req, res) => {
  const { category, q, artisan, limit = 20, page = 1 } = req.query;
  const filter = { isActive: true };
  if (category) filter.categoryName = category;
  if (artisan) filter.artisan = artisan;
  if (q) filter.$text = { $search: q };
  const docs = await ArtisanService.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(100, parseInt(limit)))
    .skip((Math.max(1, parseInt(page)) - 1) * parseInt(limit))
    .lean();
  res.json({ success: true, data: docs });
});

export const createService = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  if (!artisanId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { categoryId, name, description, price = 0, durationMinutes = 60, images = [] } = req.body || {};
  if (!categoryId || !name) return res.status(400).json({ success: false, message: 'categoryId and name are required' });
  const category = await Category.findById(categoryId).lean();
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const doc = await ArtisanService.create({
    artisan: artisanId,
    category: category._id,
    categoryName: category.name,
    name,
    description: description || '',
    price,
    durationMinutes,
    images,
  });
  res.status(201).json({ success: true, data: doc });
});

export const updateService = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const doc = await ArtisanService.findById(id);
  if (!doc) return res.status(404).json({ success: false, message: 'Service not found' });
  if (String(doc.artisan) !== String(artisanId)) return res.status(403).json({ success: false, message: 'Forbidden' });
  const updates = {};
  ['name', 'description', 'price', 'durationMinutes', 'images', 'isActive'].forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  Object.assign(doc, updates);
  await doc.save();
  res.json({ success: true, data: doc });
});

export const deleteService = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const doc = await ArtisanService.findById(id);
  if (!doc) return res.status(404).json({ success: false, message: 'Service not found' });
  if (String(doc.artisan) !== String(artisanId)) return res.status(403).json({ success: false, message: 'Forbidden' });
  await doc.deleteOne();
  res.json({ success: true, data: { id } });
});

export const getServicesByArtisanPublicId = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const Artisan = (await import('../models/artisanModel.js')).default;
  const artisan = await Artisan.findOne({ publicId }).select('_id');
  if (!artisan) {
    return res.status(404).json({ success: false, message: 'Artisan not found' });
  }
  const services = await ArtisanService.find({ artisan: artisan._id, isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: services });
});


