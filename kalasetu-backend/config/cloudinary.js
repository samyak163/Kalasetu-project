import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG } from './env.config.js';

// Configure Cloudinary with server-side credentials
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
});

export default cloudinary;
