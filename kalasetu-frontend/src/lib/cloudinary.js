/**
 * Cloudinary upload service using unsigned preset
 */
export const uploadToCloudinary = async (file, preset, folder = 'kalasetu/profile-pictures') => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || preset;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Please check environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Failed to upload image');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Validate image file before upload
 */
export const validateImage = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, WebP, and GIF images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  return { valid: true };
};

/**
 * Get optimized image URL from Cloudinary
 */
export const getOptimizedImageUrl = (url, width = 300, height = 300) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url; // Return original if not Cloudinary URL
  }

  // Insert transformation parameters
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transformations = `w_${width},h_${height},c_fill,f_auto,q_auto`;
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};
