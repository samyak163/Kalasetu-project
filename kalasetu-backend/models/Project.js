/**
 * @file Project.js — Artisan Portfolio Project Schema
 * @collection projects
 *
 * Portfolio items showcasing an artisan's past work. Each project is
 * a gallery entry with images, description, and engagement metrics.
 *
 * Note: This file uses legacy PascalCase naming (Project.js instead of
 * projectModel.js). Kept for backward compatibility with existing imports.
 *
 * Key fields:
 *  - artisan      — The artisan who created this portfolio item
 *  - title        — Project title (max 100 chars)
 *  - description  — Project description (max 500 chars)
 *  - category     — Freeform category string (not a Category ref)
 *  - images       — Array of Cloudinary URLs
 *  - coverImage   — Primary display image
 *  - isPublic     — Visibility toggle
 *  - views, likes — Engagement metrics
 *
 * @exports {Model} Project — Mongoose model
 *
 * @see controllers/portfolioController.js — Portfolio CRUD
 * @see kalasetu-frontend/src/components/profile/tabs/PortfolioTab.jsx — Portfolio UI
 */

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  coverImage: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

projectSchema.index({ artisan: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;

