import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ProfileTab from '../components/profile/tabs/ProfileTab.jsx';
import RatingsTab from '../components/profile/tabs/RatingsTab.jsx';
import BookmarksTab from '../components/profile/tabs/BookmarksTab.jsx';
import OrderHistoryTab from '../components/profile/tabs/OrderHistoryTab.jsx';
import PreferencesTab from '../components/profile/tabs/PreferencesTab.jsx';
import AppearanceTab from '../components/profile/tabs/AppearanceTab.jsx';
import HelpSupportTab from '../components/profile/tabs/HelpSupportTab.jsx';
import {
  User,
  Star,
  Bookmark,
  ClipboardList,
  Bell,
  SunMoon,
  HelpCircle,
} from 'lucide-react';

const tabs = [
  { key: 'profile', label: 'Your Profile', icon: User },
  { key: 'ratings', label: 'Ratings & Reviews', icon: Star },
  { key: 'saved', label: 'Saved Artisans', icon: Bookmark },
  { key: 'orders', label: 'Order History', icon: ClipboardList },
  { key: 'notifications', label: 'Notifications & Preferences', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: SunMoon },
  { key: 'help', label: 'Help & Support', icon: HelpCircle },
];

export default function UserProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Account</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage your profile, preferences and orders</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Signed in as</div>
            <div className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100">{user?.fullName || 'User'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4 py-6">
        <aside className="md:col-span-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 md:p-4 h-fit">
          <div className="flex md:block overflow-x-auto gap-2 md:gap-0" role="tablist" aria-label="Account settings">
            {tabs.map(t => {
              const IconComp = t.icon;
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)} className={`
                  w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 whitespace-nowrap
                  ${activeTab === t.key ? 'bg-brand-50 dark:bg-brand-900 text-brand-500 dark:text-brand-300 shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                `} role="tab" aria-selected={activeTab === t.key}>
                  <IconComp className="h-5 w-5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="md:col-span-3 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6" role="tabpanel" id="main-content">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'ratings' && <RatingsTab user={user} />}
          {activeTab === 'saved' && <BookmarksTab user={user} />}
          {activeTab === 'orders' && <OrderHistoryTab user={user} />}
          {activeTab === 'notifications' && <PreferencesTab user={user} />}
          {activeTab === 'appearance' && <AppearanceTab user={user} />}
          {activeTab === 'help' && <HelpSupportTab user={user} />}
        </section>
      </div>
    </div>
  );
}

 