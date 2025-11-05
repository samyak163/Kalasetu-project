import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '/src/context/AuthContext.jsx';
import { ToastContext } from '/src/context/ToastContext.jsx';
import ProfileTab from './tabs/ProfileTab.jsx';
import RatingsTab from './tabs/RatingsTab.jsx';
import BookmarksTab from './tabs/BookmarksTab.jsx';
import OrderHistoryTab from './tabs/OrderHistoryTab.jsx';
import PreferencesTab from './tabs/PreferencesTab.jsx';
import AppearanceTab from './tabs/AppearanceTab.jsx';
import HelpSupportTab from './tabs/HelpSupportTab.jsx';

const tabs = [
  { key: 'profile', label: 'Your Profile', icon: '👤' },
  { key: 'ratings', label: 'Your Rating', icon: '⭐' },
  { key: 'bookmarks', label: 'Collections', icon: '🔖' },
  { key: 'history', label: 'History', icon: '📋' },
  { key: 'preferences', label: 'Preferences', icon: '⚙️' },
  { key: 'appearance', label: 'Appearance', icon: '🎨' },
  { key: 'help', label: 'Help & Support', icon: '❓' },
];

const ProfileModal = () => {
  const { auth, logout } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const handleOpenProfile = (event) => {
      setIsOpen(true);
      // If event has a tab detail, use it, otherwise default to 'profile'
      const tab = event.detail?.tab || 'profile';
      setActiveTab(tab);
    };
    window.addEventListener('open-profile', handleOpenProfile);
    return () => window.removeEventListener('open-profile', handleOpenProfile);
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !auth.user || auth.userType !== 'user') return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSaveSuccess = () => {
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-7xl mx-4 mt-8 mb-8 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 id="profile-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Close profile modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] max-h-[800px]">
          {/* Sidebar Tabs - Desktop */}
          <aside className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex-col gap-2 overflow-y-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all
                  flex items-center gap-3
                  ${
                    activeTab === tab.key
                      ? 'bg-[#F3E9E5] dark:bg-[#2A1810] text-[#A55233] dark:text-[#D4A574] shadow-sm'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
                aria-pressed={activeTab === tab.key}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </aside>

          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="md:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
            <div className="flex gap-2 p-4 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    flex items-center gap-2
                    ${
                      activeTab === tab.key
                        ? 'bg-[#A55233] text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <section className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && <ProfileTab user={auth.user} onSave={handleSaveSuccess} />}
            {activeTab === 'ratings' && <RatingsTab user={auth.user} />}
            {activeTab === 'bookmarks' && <BookmarksTab user={auth.user} />}
            {activeTab === 'history' && <OrderHistoryTab user={auth.user} />}
            {activeTab === 'preferences' && <PreferencesTab user={auth.user} onSave={handleSaveSuccess} />}
            {activeTab === 'appearance' && <AppearanceTab user={auth.user} />}
            {activeTab === 'help' && <HelpSupportTab />}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
