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

