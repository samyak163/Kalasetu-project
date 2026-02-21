import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from '../components/ui';
import ProfileTab from '../components/profile/tabs/ProfileTab.jsx';
import RatingsTab from '../components/profile/tabs/RatingsTab.jsx';
import BookmarksTab from '../components/profile/tabs/BookmarksTab.jsx';
import OrderHistoryTab from '../components/profile/tabs/OrderHistoryTab.jsx';
import PreferencesTab from '../components/profile/tabs/PreferencesTab.jsx';
import AppearanceTab from '../components/profile/tabs/AppearanceTab.jsx';
import HelpSupportTab from '../components/profile/tabs/HelpSupportTab.jsx';
import {
  User, Star, Bookmark, ClipboardList,
  Bell, SunMoon, HelpCircle,
} from 'lucide-react';

const TABS = [
  { key: 'profile', label: 'Your Profile', icon: User },
  { key: 'ratings', label: 'Ratings & Reviews', icon: Star },
  { key: 'saved', label: 'Saved Artisans', icon: Bookmark },
  { key: 'orders', label: 'Order History', icon: ClipboardList },
  { key: 'notifications', label: 'Preferences', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: SunMoon },
  { key: 'help', label: 'Help & Support', icon: HelpCircle },
];

const TAB_KEYS = new Set(TABS.map(t => t.key));

function getHashTab() {
  const hash = window.location.hash.slice(1);
  return TAB_KEYS.has(hash) ? hash : 'profile';
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(getHashTab);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getHashTab());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTab = useCallback((key) => {
    setActiveTab(key);
    window.location.hash = key;
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab user={user} />;
      case 'ratings': return <RatingsTab user={user} />;
      case 'saved': return <BookmarksTab user={user} />;
      case 'orders': return <OrderHistoryTab user={user} />;
      case 'notifications': return <PreferencesTab user={user} />;
      case 'appearance': return <AppearanceTab user={user} />;
      case 'help': return <HelpSupportTab user={user} />;
      default: return <ProfileTab user={user} />;
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.fullName} src={user?.profileImageUrl} size="md" />
            <div>
              <h1 className="text-lg font-bold font-display text-gray-900">{user?.fullName || 'User'}</h1>
              <p className="text-xs text-gray-500">Your Account</p>
            </div>
          </div>
          <button
            onClick={() => navigateTab('orders')}
            className="hidden md:inline-flex text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            View Bookings →
          </button>
        </div>
      </div>

      {/* Mobile: horizontal tab bar */}
      <div className="md:hidden sticky top-0 z-sticky bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex" role="tablist">
          {TABS.map(t => {
            const IconComp = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => navigateTab(t.key)}
                role="tab"
                aria-selected={activeTab === t.key}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 min-w-[64px] text-xs whitespace-nowrap transition-colors ${
                  activeTab === t.key ? 'text-brand-500' : 'text-gray-400'
                }`}
              >
                <IconComp className="h-5 w-5" />
                {activeTab === t.key && <span className="font-medium">{t.label}</span>}
                {activeTab === t.key && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 py-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block">
          <nav className="sticky top-6 bg-white rounded-card shadow-card p-2 space-y-0.5" role="tablist" aria-label="Account navigation">
            {TABS.map(t => {
              const IconComp = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => navigateTab(t.key)}
                  role="tab"
                  aria-selected={isActive}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && <span className="w-0.5 h-5 bg-brand-500 rounded-full shrink-0" />}
                  <IconComp className="h-4.5 w-4.5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab content */}
        <main role="tabpanel" className="min-w-0">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
