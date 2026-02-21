import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { Card, Button } from '../../ui';

const PreferencesTab = ({ user, onSave }) => {
  const { showToast } = React.useContext(ToastContext);
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      orderUpdates: true,
      promotions: false,
      newArtisans: true,
    },
    smsNotifications: {
      bookingConfirmations: true,
      marketing: false,
    },
    pushNotifications: {
      orderStatus: true,
      messages: true,
    },
    language: 'en',
    currency: 'INR',
    privacy: {
      profileVisibility: 'public',
      showPhoneNumber: false,
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({
        ...prev,
        ...user.preferences,
      }));
    }
  }, [user]);

  const handleToggle = (category, key) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/api/users/profile', {
        preferences,
      });
      showToast('Preferences saved successfully!', 'success');
      onSave?.();
    } catch {
      showToast('Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications & Preferences
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your notification and privacy settings
        </p>
      </div>

      {/* Email Notifications */}
      <Card hover={false}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(preferences.emailNotifications).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleToggle('emailNotifications', key)}
                className="w-5 h-5 accent-brand-500 rounded"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* SMS Notifications */}
      <Card hover={false}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          SMS Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(preferences.smsNotifications).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleToggle('smsNotifications', key)}
                className="w-5 h-5 accent-brand-500 rounded"
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Note: SMS may incur charges
        </p>
      </Card>

      {/* Push Notifications */}
      <Card hover={false}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Push Notifications
        </h3>
        <div className="space-y-3">
          {Object.entries(preferences.pushNotifications).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleToggle('pushNotifications', key)}
                className="w-5 h-5 accent-brand-500 rounded"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* Language & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={preferences.language}
            onChange={e => handleChange('language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={preferences.currency}
            onChange={e => handleChange('currency', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Privacy Settings */}
      <Card hover={false}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Privacy Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={preferences.privacy.profileVisibility}
              onChange={e => handlePrivacyChange('profileVisibility', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900"
            >
              <option value="public">Public</option>
              <option value="artisans">Artisans Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300">
              Show phone number on profile
            </span>
            <input
              type="checkbox"
              checked={preferences.privacy.showPhoneNumber}
              onChange={() => handlePrivacyChange('showPhoneNumber', !preferences.privacy.showPhoneNumber)}
              className="w-5 h-5 accent-brand-500 rounded"
            />
          </label>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default PreferencesTab;
