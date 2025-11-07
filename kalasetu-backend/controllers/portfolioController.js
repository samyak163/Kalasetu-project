import Project from '../models/Project.js';
import Artisan from '../models/artisanModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/artisan/portfolio/projects
export const getProjects = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;
  
  const projects = await Project.find({ artisan: artisanId })
    .sort('-createdAt');
  
  res.json({ success: true, data: projects });
});

// POST /api/artisan/portfolio/projects
export const createProject = asyncHandler(async (req, res) => {
  const artisanId = req.user._id;
  const { title, description, category, isPublic } = req.body;
  
  if (!title || !category) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and category are required' 
    });
  }
  
  const project = await Project.create({
    artisan: artisanId,
    title,
    description: description || '',
    category,
    isPublic: isPublic !== false,
    images: []
  });
  
  res.status(201).json({ success: true, data: project });
});

// POST /api/artisan/portfolio/projects/:id/images
export const addImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { images } = req.body;
  const artisanId = req.user._id;
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Images array is required' 
    });
  }
  
  const project = await Project.findOne({ _id: id, artisan: artisanId });
  
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  
  // Check total images limit (20 per project)
  if (project.images.length + images.length > 20) {
    return res.status(400).json({ 
      success: false, 
      error: 'Maximum 20 images per project' 
    });
  }
  
  project.images.push(...images);
  
  // Set first image as cover if no cover set
  if (!project.coverImage && images.length > 0) {
    project.coverImage = images[0];
  }
  
  await project.save();
  
  res.json({ success: true, data: project });
});

// DELETE /api/artisan/portfolio/projects/:id/images
export const deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  const artisanId = req.user._id;
  
  if (!imageUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'imageUrl is required' 
    });
  }
  
  const project = await Project.findOne({ _id: id, artisan: artisanId });
  
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  
  project.images = project.images.filter(img => img !== imageUrl);
  
  // Reset cover if deleted image was cover
  if (project.coverImage === imageUrl) {
    project.coverImage = project.images[0] || null;
  }
  
  await project.save();
  
  res.json({ success: true, data: project });
});

// PATCH /api/artisan/portfolio/projects/:id/cover
export const setCoverImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { coverImage } = req.body;
  const artisanId = req.user._id;
  
  if (!coverImage) {
    return res.status(400).json({ 
      success: false, 
      error: 'coverImage is required' 
    });
  }
  
  const project = await Project.findOne({ _id: id, artisan: artisanId });
  
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  
  // Verify coverImage is in project images
  if (!project.images.includes(coverImage)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Cover image must be one of the project images' 
    });
  }
  
  project.coverImage = coverImage;
  await project.save();
  
  res.json({ success: true, data: project });
});

// PATCH /api/artisan/portfolio/projects/:id/reorder
export const reorderImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { images } = req.body;
  const artisanId = req.user._id;
  
  if (!images || !Array.isArray(images)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Images array is required' 
    });
  }
  
  const project = await Project.findOne({ _id: id, artisan: artisanId });
  
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  
  project.images = images;
  await project.save();
  
  res.json({ success: true, data: project });
});

// PATCH /api/artisan/portfolio/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, isPublic } = req.body;
  const artisanId = req.user._id;
  
  const project = await Project.findOneAndUpdate(
    { _id: id, artisan: artisanId },
    { title, description, category, isPublic },
    { new: true, runValidators: true }
  );
  
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  
  res.json({ success: true, data: project });
});

// DELETE /api/artisan/portfolio/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artisanId = req.user._id;
  
  const project = await Project.findOneAndDelete({ _id: id, artisan: artisanId });
  
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  
  res.json({ success: true, message: 'Project deleted successfully' });
});

// GET /api/artisans/:publicId/portfolio - Public endpoint
export const getPublicPortfolio = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  
  const artisan = await Artisan.findOne({ publicId });
  if (!artisan) {
    return res.status(404).json({ success: false, error: 'Artisan not found' });
  }
  
  const projects = await Project.find({ 
    artisan: artisan._id, 
    isPublic: true 
  }).sort('-createdAt');
  
  res.json({ success: true, data: projects });
});

