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
  const artisan = await Artisan.findOne({ publicId }).select('_id');
  if (!artisan) {
    return res.status(404).json({ success: false, message: 'Artisan not found' });
  }
  const services = await ArtisanService.find({ artisan: artisan._id, isActive: true })
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
    Booking.countDocuments({ service: objectId, status: { $nin: ['cancelled'] } }),
    Review.aggregate([
      { $match: { service: objectId, status: 'active' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  const averageRating = reviewAgg.length ? Number(reviewAgg[0].avg.toFixed(1)) : 0;
  const reviewCount = reviewAgg.length ? reviewAgg[0].count : 0;

  res.json({ bookingCount, averageRating, reviewCount });
});
