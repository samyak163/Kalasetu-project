import { useContext, useEffect, useMemo, useState } from 'react';
import ImageUpload from '../../components/ImageUpload.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { ToastContext } from '../../context/ToastContext.jsx';

const AdminProfile = () => {
  const { admin, updateProfile, changePassword } = useAdminAuth();
  const { showToast } = useContext(ToastContext);

  const [fullName, setFullName] = useState(admin?.fullName || '');
  const [profileImage, setProfileImage] = useState(admin?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const initialProfile = useMemo(() => ({
    fullName: admin?.fullName || '',
    profileImage: admin?.profileImage || '',
  }), [admin]);

  useEffect(() => {
    setFullName(initialProfile.fullName);
    setProfileImage(initialProfile.profileImage);
  }, [initialProfile.fullName, initialProfile.profileImage]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!admin) return;

    const updates = {};
    if (fullName && fullName.trim() && fullName.trim() !== admin.fullName) {
      updates.fullName = fullName.trim();
    }
    if ((profileImage || '') !== (admin.profileImage || '')) {
      updates.profileImage = profileImage || '';
    }

    if (Object.keys(updates).length === 0) {
      showToast('Nothing to update', 'info');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await updateProfile(updates);
      if (response?.success) {
        showToast('Profile updated successfully', 'success');
      } else {
        showToast(response?.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      showToast(message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      showToast('Please fill all password fields', 'warning');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (response?.success) {
        showToast('Password updated successfully', 'success');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(response?.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      showToast(message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!admin) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <p className="text-sm text-gray-600">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-2">
          Update your personal details and profile picture.
        </p>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile photo</label>
            <ImageUpload
              currentImage={profileImage}
              onUploadSuccess={(url) => setProfileImage(url)}
              folder="admin/profiles"
            />
            {profileImage && (
              <button
                type="button"
                onClick={() => setProfileImage('')}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFullName(initialProfile.fullName);
                setProfileImage(initialProfile.profileImage);
              }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500 mt-2">
          Use a strong password that you haven’t used elsewhere.
        </p>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminProfile;


