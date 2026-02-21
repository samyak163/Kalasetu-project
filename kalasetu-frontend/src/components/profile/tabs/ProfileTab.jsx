import React, { useState, useEffect } from 'react';
import { uploadToCloudinary, validateImage } from '../../../lib/cloudinary.js';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { Button, Card, Input, Avatar, Spinner } from '../../ui';
import { Lock, Camera } from 'lucide-react';

const ProfileTab = ({ user, onSave }) => {
  const { showToast } = React.useContext(ToastContext);
  const { bootstrapAuth } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    profileImageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [, setUploadProgress] = useState(0);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        profileImageUrl: user.profileImageUrl || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (passwordData.newPassword) {
      calculatePasswordStrength(passwordData.newPassword);
    } else {
      setPasswordStrength(0);
    }
  }, [passwordData.newPassword]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      // Create a progress indicator
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadToCloudinary(file, null, 'kalasetu/profile-pictures');

      clearInterval(progressInterval);
      setUploadProgress(100);

      setFormData(prev => ({ ...prev, profileImageUrl: result.url }));
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }

    if (formData.fullName.length < 2 || formData.fullName.length > 50) {
      showToast('Name must be between 2 and 50 characters', 'error');
      return;
    }

    if (formData.bio && formData.bio.length > 500) {
      showToast('Bio must be 500 characters or less', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/users/profile', {
        fullName: formData.fullName.trim(),
        bio: formData.bio.trim(),
        profileImageUrl: formData.profileImageUrl,
      });

      showToast('Profile updated successfully!', 'success');
      onSave?.();

      // Re-fetch auth state to update user context without full page reload
      await bootstrapAuth();
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Failed to update profile',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('All password fields are required', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordStrength < 4) {
      showToast('Password is too weak. Please use a stronger password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      showToast('Password changed successfully!', 'success');
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Failed to change password',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return { label: 'Weak', color: 'text-error-600' };
    if (passwordStrength === 3) return { label: 'Medium', color: 'text-warning-600' };
    return { label: 'Strong', color: 'text-success-600' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View and edit your profile information
        </p>
      </div>

      {/* Profile Picture Section */}
      <Card hover={false}>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              src={formData.profileImageUrl}
              name={formData.fullName}
              size="xl"
            />
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Spinner className="text-white" size="md" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Button variant="secondary" className="relative">
              <Camera className="h-4 w-4" />
              {uploadingImage ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              JPG, PNG, WebP or GIF. Max 5MB.
            </p>
          </div>
        </div>
      </Card>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <Input
          label="Full Name *"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          maxLength={50}
          required
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          disabled
          helperText="Email cannot be changed from here"
        />

        {/* Phone Number */}
        <Input
          label="Phone Number"
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          disabled
          helperText="Phone number cannot be changed from here"
        />

        {/* Account Created Date */}
        <Input
          label="Account Created"
          type="text"
          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'N/A'}
          disabled
        />
      </div>

      {/* Bio */}
      <Input
        as="textarea"
        label="About Me"
        name="bio"
        value={formData.bio}
        onChange={handleInputChange}
        rows={4}
        placeholder="Tell us about yourself..."
        maxLength={500}
        helperText={`${formData.bio.length}/500 characters`}
      />

      {/* Password Change Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {!showPasswordChange ? (
          <Button
            variant="ghost"
            onClick={() => setShowPasswordChange(true)}
          >
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        ) : (
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                label="Current Password *"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />

              <div>
                <Input
                  label="New Password *"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength <= 2
                              ? 'bg-error-500'
                              : passwordStrength === 3
                              ? 'bg-warning-500'
                              : 'bg-success-500'
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getPasswordStrengthLabel().color}`}>
                        {getPasswordStrengthLabel().label}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                      <li className={passwordData.newPassword.length >= 8 ? 'text-success-600' : ''}>
                        {passwordData.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-success-600' : ''}>
                        {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'} One lowercase letter
                      </li>
                      <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-success-600' : ''}>
                        {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-success-600' : ''}>
                        {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} One number
                      </li>
                      <li className={/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? 'text-success-600' : ''}>
                        {/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? '✓' : '○'} One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Input
                label="Confirm New Password *"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'Passwords do not match' : undefined}
              />

              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={loading || passwordStrength < 4 || passwordData.newPassword !== passwordData.confirmPassword}
                loading={loading && showPasswordChange}
              >
                {loading ? 'Changing Password...' : 'Update Password'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSaveProfile}
          disabled={loading || uploadingImage}
          loading={loading && !showPasswordChange}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
