import { useEffect, useState, useContext, useRef } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import {
  getArtisanProfile,
  updateArtisanProfile,
  uploadProfilePhoto,
} from '../../../lib/api/artisanProfile.js';
import { optimizeImage } from '../../../utils/cloudinary.js';
import { Avatar, Button, Input, Spinner, Card } from '../../ui';

const ArtisanProfileTab = () => {
  const { showToast } = useContext(ToastContext);
  const fileInputRef = useRef(null);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">Your Profile</h2>
        <p className="text-sm text-gray-500 mt-1">View and edit your artisan profile</p>
      </div>

      {/* Profile photo */}
      <Card hover={false}>
        <label className="block text-sm font-semibold text-gray-700 mb-4">Profile Picture</label>
        <div className="flex items-center gap-6">
          <Avatar
            name={formData.fullName}
            src={formData.profileImageUrl ? optimizeImage(formData.profileImageUrl, { width: 128, height: 128 }) : undefined}
            size="xl"
          />
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onUploadPhoto}
              disabled={uploading}
            />
            <p className="text-xs text-gray-400">JPG, PNG. Max 5 MB.</p>
          </div>
        </div>
      </Card>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name *"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          maxLength={50}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          disabled
          helperText="Email cannot be changed"
        />
        <Input
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          disabled
          helperText="Phone cannot be changed"
        />
      </div>

      <Input
        label="About Me"
        name="bio"
        as="textarea"
        value={formData.bio}
        onChange={handleInputChange}
        rows={4}
        placeholder="Tell customers about your experience..."
        maxLength={500}
        helperText={`${(formData.bio || '').length}/500 characters`}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button variant="ghost" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={loading}
          disabled={loading || uploading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default ArtisanProfileTab;
