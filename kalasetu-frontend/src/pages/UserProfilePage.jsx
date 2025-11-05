import React, { useState } from 'react';
import ProfileTab from '../components/profile/tabs/ProfileTab.jsx';
import RatingsTab from '../components/profile/tabs/RatingsTab.jsx';
import BookmarksTab from '../components/profile/tabs/BookmarksTab.jsx';
import OrderHistoryTab from '../components/profile/tabs/OrderHistoryTab.jsx';
import PreferencesTab from '../components/profile/tabs/PreferencesTab.jsx';
import AppearanceTab from '../components/profile/tabs/AppearanceTab.jsx';
import HelpSupportTab from '../components/profile/tabs/HelpSupportTab.jsx';

const tabs = [
  { key: 'profile', label: 'Your Profile', icon: 'ðŸ‘¤' },
  { key: 'ratings', label: 'Ratings & Reviews', icon: 'â­' },
  { key: 'saved', label: 'Saved Artisans', icon: 'ðŸ”–' },
  { key: 'orders', label: 'Order History', icon: 'ðŸ“‹' },
  { key: 'notifications', label: 'Notifications & Preferences', icon: 'ðŸ””' },
  { key: 'appearance', label: 'Appearance', icon: 'ðŸŽ¨' },
  { key: 'help', label: 'Help & Support', icon: 'â“' },
];

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Account</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage your profile, preferences and orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4 py-6">
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

        <section className="md:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'ratings' && <RatingsTab />}
          {activeTab === 'saved' && <BookmarksTab />}
          {activeTab === 'orders' && <OrderHistoryTab />}
          {activeTab === 'notifications' && <PreferencesTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'help' && <HelpSupportTab />}
        </section>
      </div>
    </div>
  );
}

 