import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ArtisanProfileTab from '../components/profile/tabs/ArtisanProfileTab.jsx';
import AppearanceTab from '../components/profile/tabs/AppearanceTab.jsx';
import HelpSupportTab from '../components/profile/tabs/HelpSupportTab.jsx';

const tabs = [
  { key: 'profile', label: 'Your Profile', icon: '👤' },
  { key: 'appearance', label: 'Appearance', icon: '🎨' },
  { key: 'help', label: 'Help & Support', icon: '❓' },
];

const ArtisanAccountPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage your artisan account and preferences</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Signed in as</div>
            <div className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100">{user?.fullName || 'Artisan'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="md:col-span-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 md:p-4 h-fit">
          <div className="flex md:block overflow-x-auto gap-2 md:gap-0">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`
                w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 whitespace-nowrap
                ${activeTab === t.key ? 'bg-[#F3E9E5] dark:bg-[#2A1810] text-[#A55233] dark:text-[#D4A574] shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `} aria-pressed={activeTab === t.key}>
                <span className="text-lg">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <section className="md:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
          {activeTab === 'profile' && <ArtisanProfileTab />}
          {activeTab === 'appearance' && <AppearanceTab user={user} />}
          {activeTab === 'help' && <HelpSupportTab />}
        </section>
      </div>
    </div>
  );
};

export default ArtisanAccountPage;
