import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from '../components/ui';
import DashboardOverviewTab from '../components/profile/tabs/DashboardOverviewTab.jsx';
import ArtisanProfileTab from '../components/profile/tabs/ArtisanProfileTab.jsx';
import ServicesTab from '../components/profile/tabs/ServicesTab.jsx';
import PortfolioTab from '../components/profile/tabs/PortfolioTab.jsx';
import BookingsTab from '../components/profile/tabs/BookingsTab.jsx';
import EarningsTab from '../components/profile/tabs/EarningsTab.jsx';
import ReviewsTab from '../components/profile/tabs/ReviewsTab.jsx';
import MyClientsTab from '../components/profile/tabs/MyClientsTab.jsx';
import AppearanceTab from '../components/profile/tabs/AppearanceTab.jsx';
import HelpSupportTab from '../components/profile/tabs/HelpSupportTab.jsx';
import AvailabilityTab from '../components/profile/tabs/AvailabilityTab.jsx';
import {
  LayoutDashboard, User, Wrench, Palette, CalendarDays,
  Clock, Wallet, Star, Users, SunMoon, HelpCircle,
} from 'lucide-react';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'profile', label: 'Your Profile', icon: User },
  { key: 'services', label: 'Services', icon: Wrench },
  { key: 'portfolio', label: 'Portfolio', icon: Palette },
  { key: 'bookings', label: 'Bookings', icon: CalendarDays },
  { key: 'availability', label: 'Availability', icon: Clock },
  { key: 'earnings', label: 'Earnings', icon: Wallet },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'clients', label: 'My Clients', icon: Users },
  { key: 'appearance', label: 'Appearance', icon: SunMoon },
  { key: 'help', label: 'Help & Support', icon: HelpCircle },
];

const TAB_KEYS = new Set(TABS.map(t => t.key));

function getHashTab() {
  const hash = window.location.hash.slice(1);
  return TAB_KEYS.has(hash) ? hash : 'dashboard';
}

const ArtisanAccountPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(getHashTab);

  // Sync hash -> state on popstate (back/forward button)
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
      case 'dashboard': return <DashboardOverviewTab onNavigateTab={navigateTab} />;
      case 'profile': return <ArtisanProfileTab user={user} />;
      case 'services': return <ServicesTab user={user} />;
      case 'portfolio': return <PortfolioTab user={user} />;
      case 'bookings': return <BookingsTab user={user} />;
      case 'availability': return <AvailabilityTab user={user} />;
      case 'earnings': return <EarningsTab user={user} />;
      case 'reviews': return <ReviewsTab user={user} />;
      case 'clients': return <MyClientsTab user={user} />;
      case 'appearance': return <AppearanceTab user={user} />;
      case 'help': return <HelpSupportTab user={user} />;
      default: return <DashboardOverviewTab onNavigateTab={navigateTab} />;
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
              <h1 className="text-lg font-bold font-display text-gray-900">{user?.fullName || 'Artisan'}</h1>
              <p className="text-xs text-gray-500">Artisan Dashboard</p>
            </div>
          </div>
          <a
            href={user?.publicId ? `/artisan/${user.publicId}` : '#'}
            className="hidden md:inline-flex text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            View public profile →
          </a>
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
          <nav className="sticky top-6 bg-white rounded-card shadow-card p-2 space-y-0.5" role="tablist" aria-label="Dashboard navigation">
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
};

export default ArtisanAccountPage;
