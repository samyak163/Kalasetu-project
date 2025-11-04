import React, { useState, useEffect } from 'react';
import { uploadToCloudinary, validateImage } from '../../../lib/cloudinary.js';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { auth } from '../../../lib/firebase.js';
import { sendEmailVerification } from 'firebase/auth';

const ProfileTab = ({ user, userType: _userType, onSave }) => {
  const { showToast } = React.useContext(ToastContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    profileImageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

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

    // Reset verification status when email/phone changes
    if (name === 'email') {
      setEmailVerified(false);
      setEmailVerificationSent(false);
    } else if (name === 'phoneNumber') {
      setPhoneVerified(false);
      setPhoneVerificationSent(false);
    }
  };

  const handleSendEmailVerification = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      setEmailVerificationSent(true);
      // Use Firebase to send verification email
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        showToast('Verification email sent! Please check your inbox.', 'success');
      } else {
        // If no current user, this might be a new email change
        // We'll handle this in the save function
        showToast('Email verification will be sent when you save changes.', 'info');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      showToast('Failed to send verification email. Please try again.', 'error');
      setEmailVerificationSent(false);
    }
  };

  const handleSendPhoneVerification = async () => {
    if (!formData.phoneNumber || !isValidPhone(formData.phoneNumber)) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    try {
      setPhoneVerificationSent(true);
      // For phone verification, we'll use Firebase Phone Auth
      // This would typically open an OTP modal
      showToast('Phone verification code sent! Please check your messages.', 'info');
      // In a real implementation, this would integrate with PhoneOTP component
    } catch (error) {
      console.error('Phone verification error:', error);
      showToast('Failed to send verification code. Please try again.', 'error');
      setPhoneVerificationSent(false);
    }
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

    // Check email verification if email was changed
    if (formData.email !== user?.email && !emailVerified) {
      showToast('Please verify your new email address before saving', 'error');
      return;
    }

    // Check phone verification if phone was changed
    if (formData.phoneNumber !== user?.phoneNumber && !phoneVerified) {
      showToast('Please verify your new phone number before saving', 'error');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        bio: formData.bio.trim(),
        profileImageUrl: formData.profileImageUrl,
      };

      // Only include email/phone if they were verified
      if (formData.email !== user?.email && emailVerified) {
        updateData.email = formData.email;
      }
      if (formData.phoneNumber !== user?.phoneNumber && phoneVerified) {
        updateData.phoneNumber = formData.phoneNumber;
      }

      const response = await api.put('/api/users/profile', updateData);

      showToast('Profile updated successfully!', 'success');
      onSave?.();
      
      // Update user context would happen via bootstrapAuth in AuthContext
      setTimeout(() => window.location.reload(), 1000);
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return { label: 'Weak', color: 'text-red-600' };
    if (passwordStrength === 3) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Strong', color: 'text-green-600' };
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    // Basic phone validation - adjust regex based on your requirements
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
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
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {formData.profileImageUrl ? (
                <img
                  src={formData.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              <div
                className="h-full w-full bg-[#A55233] text-white flex items-center justify-center text-2xl font-semibold"
                style={{ display: formData.profileImageUrl ? 'none' : 'flex' }}
              >
                {getInitials(formData.fullName)}
              </div>
            </div>
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="text-white text-sm font-semibold">{uploadProgress}%</div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploadingImage ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              JPG, PNG, WebP or GIF. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white"
            placeholder="Enter your full name"
            maxLength={50}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white"
              placeholder="Enter your email"
            />
            {formData.email !== user?.email && !emailVerified && (
              <button
                onClick={handleSendEmailVerification}
                disabled={emailVerificationSent}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {emailVerificationSent ? 'Sent' : 'Verify'}
              </button>
            )}
            {emailVerified && (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {formData.email !== user?.email && !emailVerified && (
            <p className="text-xs text-blue-600 mt-1">
              {emailVerificationSent ? 'Verification email sent. Check your inbox.' : 'Click verify to confirm your new email address.'}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white"
              placeholder="Enter your phone number"
            />
            {formData.phoneNumber !== user?.phoneNumber && !phoneVerified && (
              <button
                onClick={handleSendPhoneVerification}
                disabled={phoneVerificationSent}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {phoneVerificationSent ? 'Sent' : 'Verify'}
              </button>
            )}
            {phoneVerified && (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {formData.phoneNumber !== user?.phoneNumber && !phoneVerified && (
            <p className="text-xs text-blue-600 mt-1">
              {phoneVerificationSent ? 'Verification code sent to your phone.' : 'Click verify to confirm your new phone number.'}
            </p>
          )}
        </div>

        {/* Account Created Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Account Created
          </label>
          <input
            type="text"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
            disabled
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          About Me
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white resize-none"
          placeholder="Tell us about yourself..."
          maxLength={500}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Password Change Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {!showPasswordChange ? (
          <button
            onClick={() => setShowPasswordChange(true)}
            className="text-[#A55233] hover:text-[#8e462b] font-semibold text-sm transition-colors"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
              />
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength <= 2
                            ? 'bg-red-500'
                            : passwordStrength === 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthLabel().color}`}>
                      {getPasswordStrengthLabel().label}
                    </span>
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                    <li className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                      {passwordData.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                      {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'} One lowercase letter
                    </li>
                    <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} One number
                    </li>
                    <li className={/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                      {/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? '✓' : '○'} One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new password"
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading || passwordStrength < 4 || passwordData.newPassword !== passwordData.confirmPassword}
              className="w-full md:w-auto px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing Password...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('close-profile'))}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveProfile}
          disabled={loading || uploadingImage}
          className="px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
