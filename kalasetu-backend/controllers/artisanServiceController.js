/**
 * @file artisanServiceController.js — Artisan Service CRUD
 *
 * Manages the services an artisan offers (e.g., "Bridal Mehndi — Rs 5000").
 * Artisans create/update/delete their own services; public users can list services.
 *
 * Endpoints:
 *  GET    /api/services              — List services (filter by category, artisan, search)
 *  GET    /api/services/artisan/:publicId — Get services by artisan publicId
 *  POST   /api/artisan/services      — Create a new service (requires `protect`)
 *  PUT    /api/artisan/services/:id  — Update a service (owner only)
 *  DELETE /api/artisan/services/:id  — Delete a service (owner only)
 *
 * Ownership: createService/updateService/deleteService verify that the authenticated
 * artisan owns the service document before allowing modifications.
 *
 * @see models/artisanServiceModel.js — Service schema
 * @see models/categoryModel.js — Category lookup for denormalized categoryName
 */

import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ArtisanService from '../models/artisanServiceModel.js';
import Category from '../models/categoryModel.js';
import Artisan from '../models/artisanModel.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';

export const listServices = asyncHandler(async (req, res) => {
  const { category, q, artisan, limit = 20, page = 1 } = req.query;
  const filter = { isActive: true };
  // String() prevents NoSQL injection via Express 4's qs parser
  // (e.g., ?artisan[$ne]=null would otherwise inject a MongoDB operator)
  if (category) filter.categoryName = String(category);
  if (artisan) filter.artisan = String(artisan);
  if (q) filter.$text = { $search: String(q) };
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const pageNum = Math.max(1, parseInt(page) || 1);
  const docs = await ArtisanService.find(filter)
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .lean();
  res.json({ success: true, data: docs });
});

export const createService = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  if (!artisanId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { categoryId, categoryName, name, description, price = 0, durationMinutes = 60, images = [] } = req.body || {};
  if ((!categoryId && !categoryName) || !name) return res.status(400).json({ success: false, message: 'categoryId (or categoryName) and name are required' });
  const parsedPrice = Number(price);
  const parsedDuration = Number(durationMinutes);
  if (isNaN(parsedPrice) || parsedPrice < 0) return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
  if (isNaN(parsedDuration) || parsedDuration < 1 || parsedDuration > 1440) return res.status(400).json({ success: false, message: 'Duration must be between 1 and 1440 minutes' });
  // Support lookup by categoryId or by categoryName (for onboarding wizard)
  const category = categoryId
    ? await Category.findById(categoryId).lean()
    : await Category.findOne({ name: categoryName }).lean();
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const doc = await ArtisanService.create({
    artisan: artisanId,
    category: category._id,
    categoryName: category.name,
    name,
    description: description || '',
    price: parsedPrice,
    durationMinutes: parsedDuration,
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

  // Handle category change — look up by ID and update both fields
  if (req.body.categoryId && String(req.body.categoryId) !== String(doc.category)) {
    const newCat = await Category.findById(String(req.body.categoryId)).lean();
    if (!newCat) return res.status(404).json({ success: false, message: 'Category not found' });
    updates.category = newCat._id;
    updates.categoryName = newCat.name;
  }

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
  const artisan = await Artisan.findOne({ publicId }).select('_id');
  if (!artisan) {
    return res.status(404).json({ success: false, message: 'Artisan not found' });
  }
  const services = await ArtisanService.find({ artisan: artisan._id, isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: services });
});

// GET /api/services/mine — Artisan's own services (includes archived/inactive)
// Uses `protect` middleware — only the owning artisan can see their full list
export const listMyServices = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const services = await ArtisanService.find({ artisan: artisanId })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: services });
});

// GET /api/services/:serviceId/stats — per-service booking count + review stats
export const getServiceStats = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: 'Invalid service ID' });
  }

  const objectId = new mongoose.Types.ObjectId(serviceId);

  // Run both queries in parallel
  const [bookingCount, reviewAgg] = await Promise.all([
    // Only count bookings that actually happened (not rejected/pending/cancelled)
    Booking.countDocuments({ service: objectId, status: { $in: ['confirmed', 'completed'] } }),
    Review.aggregate([
      { $match: { service: objectId, status: 'active' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  const averageRating = reviewAgg.length ? Number(reviewAgg[0].avg.toFixed(1)) : 0;
  const reviewCount = reviewAgg.length ? reviewAgg[0].count : 0;

  res.json({ success: true, data: { bookingCount, averageRating, reviewCount } });
});
