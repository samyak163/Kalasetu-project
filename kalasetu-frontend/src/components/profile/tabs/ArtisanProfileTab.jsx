import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import {
  getArtisanProfile,
  updateArtisanProfile,
  uploadProfilePhoto,
} from '../../../lib/api/artisanProfile.js';
import { optimizeImage } from '../../../utils/cloudinary.js';

const ArtisanProfileTab = () => {
  const { showToast } = useContext(ToastContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    profileImageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getArtisanProfile();
        setFormData({
          fullName: p.fullName || '',
          email: p.email || '',
          phoneNumber: p.phoneNumber || '',
          bio: p.bio || '',
          profileImageUrl: p.profileImageUrl || '',
        });
      } catch (e) {
        showToast(e.response?.data?.message || 'Failed to load profile', 'error');
      }
    })();
  }, [showToast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }
    if (formData.bio && formData.bio.length > 500) {
      showToast('Bio must be 500 characters or less', 'error');
      return;
    }
    setLoading(true);
    try {
      const updated = await updateArtisanProfile({
        fullName: formData.fullName.trim(),
        bio: formData.bio.trim(),
      });
      setFormData(prev => ({ ...prev, fullName: updated.fullName || prev.fullName, bio: updated.bio || prev.bio }));
      showToast('Profile updated successfully!', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resp = await uploadProfilePhoto(file);
      setFormData(prev => ({ ...prev, profileImageUrl: resp.profileImageUrl }));
      showToast('Photo updated', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and edit your artisan profile</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Profile Picture</label>
        <div className="flex items-center gap-6">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {formData.profileImageUrl ? (
              <img src={optimizeImage(formData.profileImageUrl, { width: 128, height: 128 })} loading="lazy" alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-[#A55233] text-white flex items-center justify-center text-2xl font-semibold">
                {getInitials(formData.fullName)}
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors">
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" className="hidden" accept="image/*" onChange={onUploadPhoto} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name <span className="text-red-500">*</span></label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-white dark:text-gray-900" placeholder="Enter your full name" maxLength={50} required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input type="email" name="email" value={formData.email} disabled className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input type="tel" name="phoneNumber" value={formData.phoneNumber} disabled className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">About Me</label>
        <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white resize-none" placeholder="Tell customers about your experience..." maxLength={500} />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(formData.bio || '').length}/500 characters</p>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => window.history.back()} className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={loading || uploading} className="px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );
};

export default ArtisanProfileTab;
