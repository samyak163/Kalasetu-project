import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function ImageUpload({ onUploadSuccess, currentImage, folder = 'artisan/profiles' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  useEffect(() => {
    setPreview(currentImage || '');
  }, [currentImage]);

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      // 1) Get signed params from backend
      const sigRes = await fetch(`/api/uploads/signature?folder=${encodeURIComponent(folder)}`, {
        credentials: 'include',
      });
      const { timestamp, signature, api_key, cloud_name, folder: uploadFolder, allowed_formats } = await sigRes.json();

      // 2) Upload directly to Cloudinary with signature
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', uploadFolder);
      if (allowed_formats) formData.append('allowed_formats', allowed_formats);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setPreview(data.secure_url);
        onUploadSuccess?.(data.secure_url);
      } else {
        console.error('Cloudinary response:', data);
        alert('Upload failed');
      }
    } catch (e) {
      console.error('Upload error:', e);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return alert('Max file size 5MB');
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    uploadImage(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {preview && (
          <img src={preview} alt="Profile" loading="lazy" className="w-24 h-24 rounded-full object-cover" />
        )}
        <div>
          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {uploading ? 'Uploading...' : 'Choose Photo'}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          </label>
          <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
        </div>
      </div>
    </div>
  );
}

ImageUpload.propTypes = {
  onUploadSuccess: PropTypes.func,
  currentImage: PropTypes.string,
  folder: PropTypes.string,
};