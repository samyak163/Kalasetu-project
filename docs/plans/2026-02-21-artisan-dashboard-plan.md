# Phase 9: Artisan Dashboard Rebuild — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the entire artisan dashboard (container + 9 tabs) using the established design system, add smart dashboard features (income chart, profile completion), and delete orphaned dead code.

**Architecture:** Frontend-only rebuild. All backend APIs already exist. New shared components (IncomeChart, ProfileCompletionCard) encapsulate reusable dashboard UI. Container gets URL hash navigation for deep-linking. Each tab swaps raw HTML for design system components (Button, Card, Input, etc.).

**Tech Stack:** React 18 (JSX), Tailwind CSS with design tokens, Lucide icons, existing design system from `components/ui/index.js`

**Design Doc:** `docs/plans/2026-02-21-artisan-dashboard-design.md`

**No test suite exists.** Quality gates: `npm run build` (frontend) + `npm run lint` (frontend) + `npm run dev` (backend) + manual browser verification.

**Design system components available:** Button, Card, Input, Badge, Avatar, Skeleton, Alert, EmptyState, LoadingState, Spinner, BottomSheet, FilterChips, StatusBadge, StarRating, ReviewCard, ImageCarousel, MultiImageUpload, TabBar, BookingCard

---

## Task 1: Delete orphaned tab files

**Files:**
- Delete: `kalasetu-frontend/src/components/profile/tabs/RatingsTab.jsx`
- Delete: `kalasetu-frontend/src/components/profile/tabs/PreferencesTab.jsx`
- Delete: `kalasetu-frontend/src/components/profile/tabs/USERsTab.jsx`
- Delete: `kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx`
- Delete: `kalasetu-frontend/src/components/profile/tabs/BookmarksTab.jsx`
- Delete: `kalasetu-frontend/src/components/profile/tabs/OrderHistoryTab.jsx`

These 6 files are never imported by `ArtisanAccountPage.jsx` or any other file. They are dead code.

**Step 1: Verify no imports exist**

Run: `grep -r "RatingsTab\|PreferencesTab\|USERsTab\|ProfileTab\|BookmarksTab\|OrderHistoryTab" kalasetu-frontend/src/ --include="*.jsx" --include="*.js" -l`

Expected: Only the tab files themselves appear (no other file imports them). If `ProfileTab` appears in imports, check it's `ArtisanProfileTab` not `ProfileTab`.

**Step 2: Delete the 6 files**

```bash
rm kalasetu-frontend/src/components/profile/tabs/RatingsTab.jsx
rm kalasetu-frontend/src/components/profile/tabs/PreferencesTab.jsx
rm kalasetu-frontend/src/components/profile/tabs/USERsTab.jsx
rm kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx
rm kalasetu-frontend/src/components/profile/tabs/BookmarksTab.jsx
rm kalasetu-frontend/src/components/profile/tabs/OrderHistoryTab.jsx
```

**Step 3: Verify build**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds with no import errors.

**Step 4: Commit**

```bash
git add -A kalasetu-frontend/src/components/profile/tabs/
git commit -m "chore: delete 6 orphaned artisan dashboard tab files

RatingsTab, PreferencesTab, USERsTab, ProfileTab, BookmarksTab,
OrderHistoryTab — never imported by ArtisanAccountPage or any other file."
```

---

## Task 2: Create IncomeChart shared component

**Files:**
- Create: `kalasetu-frontend/src/components/dashboard/IncomeChart.jsx`

**Context:** This is a pure CSS bar chart (no library dependency). Used by DashboardOverviewTab (6 months) and EarningsTab (12 months). Data comes from `GET /api/artisan/dashboard/income-report?period=monthly|weekly` which returns `{ periods: [{ label: "2026-01", amount: 10000 }], total: 22000 }`.

**Step 1: Create the component**

```jsx
import { useState, useEffect } from 'react';
import { Card, FilterChips, Skeleton } from '../ui';
import { TrendingUp } from 'lucide-react';
import api from '../../lib/axios.js';

/**
 * Pure CSS bar chart for income visualization.
 * Fetches data from /api/artisan/dashboard/income-report.
 *
 * @param {number} months - Number of months to show (6 or 12)
 * @param {string} className - Additional classes
 */
export default function IncomeChart({ months = 6, className = '' }) {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/artisan/dashboard/income-report?period=${period}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch {
      setData({ periods: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const periods = data?.periods?.slice(-months) || [];
  const maxAmount = Math.max(...periods.map(p => p.amount), 1);

  const formatLabel = (label) => {
    if (period === 'monthly') {
      // "2026-02" -> "Feb"
      const [, month] = label.split('-');
      return new Date(2026, parseInt(month) - 1).toLocaleString('en-IN', { month: 'short' });
    }
    // "2026-W08" -> "W8"
    return label.replace(/^\d{4}-W0?/, 'W');
  };

  const chips = [
    { key: 'monthly', label: 'Monthly', active: period === 'monthly', onClick: () => setPeriod('monthly') },
    { key: 'weekly', label: 'Weekly', active: period === 'weekly', onClick: () => setPeriod('weekly') },
  ];

  if (loading) {
    return (
      <Card className={className}>
        <Skeleton variant="rect" height="200px" />
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success-600" />
          <h3 className="text-sm font-semibold text-gray-900">Income Overview</h3>
        </div>
        <FilterChips chips={chips} size="sm" />
      </div>

      {data?.total > 0 && (
        <p className="text-2xl font-bold text-gray-900 mb-4">
          ₹{data.total.toLocaleString('en-IN')}
        </p>
      )}

      {periods.length > 0 ? (
        <div className="flex items-end gap-1 h-32">
          {periods.map((p) => (
            <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 font-medium">
                {p.amount > 0 ? `₹${(p.amount / 1000).toFixed(0)}k` : ''}
              </span>
              <div
                className="w-full bg-brand-100 rounded-t-sm transition-all duration-300 min-h-[4px]"
                style={{ height: `${Math.max((p.amount / maxAmount) * 100, 3)}%` }}
              >
                <div
                  className="w-full h-full bg-brand-500 rounded-t-sm"
                  style={{ opacity: p.amount > 0 ? 1 : 0.3 }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{formatLabel(p.label)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">No income data yet</p>
      )}
    </Card>
  );
}
```

**Step 2: Verify build**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds (component is not yet imported anywhere).

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/dashboard/IncomeChart.jsx
git commit -m "feat(dashboard): add IncomeChart shared component

Pure CSS bar chart — no charting library. Fetches from
/api/artisan/dashboard/income-report. Monthly/weekly toggle.
Used by DashboardOverviewTab and EarningsTab."
```

---

## Task 3: Create ProfileCompletionCard shared component

**Files:**
- Create: `kalasetu-frontend/src/components/dashboard/ProfileCompletionCard.jsx`

**Context:** Fetches from `GET /api/artisan/dashboard/verification-status` which returns `{ steps: [{ name: 'hasProfilePhoto', completed: true }], completedCount: 3, totalCount: 5, isFullyVerified: false }`. Shown only when profile is incomplete. Dismissible via localStorage.

**Step 1: Create the component**

```jsx
import { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import api from '../../lib/axios.js';

const DISMISS_KEY = 'ks_profile_completion_dismissed';

const STEP_LABELS = {
  hasProfilePhoto: { label: 'Add a profile photo', tab: 'profile' },
  hasBio: { label: 'Write your bio (at least 10 characters)', tab: 'profile' },
  hasService: { label: 'Add at least one service', tab: 'services' },
  hasPortfolio: { label: 'Create a portfolio project', tab: 'portfolio' },
  emailVerified: { label: 'Verify your email address', tab: 'profile' },
};

/**
 * Profile completion progress card. Only renders when profile is incomplete.
 * Dismissible — stores preference in localStorage.
 *
 * @param {function} onNavigateTab - (tabKey) => void, navigates to a dashboard tab
 */
export default function ProfileCompletionCard({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    if (dismissed) return;
    api.get('/api/artisan/dashboard/verification-status')
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => {});
  }, [dismissed]);

  if (dismissed || !data || data.isFullyVerified) return null;

  const percentage = Math.round((data.completedCount / data.totalCount) * 100);
  const nextStep = data.steps.find(s => !s.completed);
  const nextStepInfo = nextStep ? STEP_LABELS[nextStep.name] : null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch {}
  };

  return (
    <Card className="border border-brand-100 bg-brand-50/30">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Complete your profile</h3>
          <p className="text-xs text-gray-500 mt-0.5">{percentage}% complete — {data.completedCount}/{data.totalCount} steps done</p>
        </div>
        <button onClick={handleDismiss} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step checklist */}
      <div className="space-y-1.5 mb-3">
        {data.steps.map(step => {
          const info = STEP_LABELS[step.name] || { label: step.name, tab: 'profile' };
          return (
            <div key={step.name} className="flex items-center gap-2 text-sm">
              {step.completed ? (
                <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 shrink-0" />
              )}
              <span className={step.completed ? 'text-gray-400 line-through' : 'text-gray-700'}>
                {info.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next action CTA */}
      {nextStepInfo && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateTab?.(nextStepInfo.tab)}
          className="w-full justify-between"
        >
          {nextStepInfo.label}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}
```

**Step 2: Verify build**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/dashboard/ProfileCompletionCard.jsx
git commit -m "feat(dashboard): add ProfileCompletionCard shared component

Shows profile completion progress with step checklist. Fetches from
/api/artisan/dashboard/verification-status. Dismissible via localStorage.
Only renders when profile is incomplete."
```

---

## Task 4: Rebuild ArtisanAccountPage container

**Files:**
- Modify: `kalasetu-frontend/src/pages/ArtisanAccountPage.jsx`

**Context:** Current page uses `useState` for tab switching. Redesign adds URL hash navigation (`#dashboard`, `#earnings`, etc.), mobile `TabBar` (horizontal scroll), and design token refresh on desktop sidebar. The `TabBar` component from `components/ui/TabBar.jsx` supports `tabs`, `activeTab`, `onTabChange`.

**Step 1: Rewrite ArtisanAccountPage**

```jsx
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
```

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`
Expected: Both pass. Minor lint warnings acceptable (continue-on-error in CI).

**Step 3: Manual verification**

Open browser at `http://localhost:5173/artisan/account`. Verify:
- Desktop: sidebar with active accent bar, all 11 tabs switch correctly
- Mobile: horizontal tab bar with icons, selected tab shows label
- URL changes to `#dashboard`, `#earnings`, etc. on tab click
- Back button navigates between tabs

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/pages/ArtisanAccountPage.jsx
git commit -m "feat(dashboard): rebuild ArtisanAccountPage container

- URL hash navigation for deep-linking (#dashboard, #earnings, etc.)
- Mobile: horizontal icon tab bar with active label
- Desktop: sidebar with brand accent bar, sticky nav
- Design system Avatar in header, semantic tokens throughout
- Passes navigateTab to DashboardOverviewTab for cross-tab links"
```

---

## Task 5: Rebuild DashboardOverviewTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx`

**Context:** Smart dashboard with welcome banner, profile completion card, stats cards, income chart, pending actions, and recent bookings. Uses `Card`, `StarRating`, `Skeleton`, `Alert`, `Button` from design system plus new `IncomeChart` and `ProfileCompletionCard` components. Receives `onNavigateTab` prop from container for cross-tab linking. Existing API: `GET /api/artisan/dashboard/stats`.

**Step 1: Rewrite DashboardOverviewTab**

Key structure (implement the full component):

```jsx
import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../lib/axios.js';
import { Card, Button, Skeleton, StarRating, Alert } from '../../ui';
import BookingCard from '../../booking/BookingCard.jsx';
import IncomeChart from '../../dashboard/IncomeChart.jsx';
import ProfileCompletionCard from '../../dashboard/ProfileCompletionCard.jsx';
import {
  CalendarDays, CheckCircle, IndianRupee, Star, TrendingUp,
  ArrowRight, MessageSquare, Clock,
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const DashboardOverviewTab = ({ onNavigateTab }) => {
  const { showToast } = useContext(ToastContext);
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/artisan/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data.stats || {});
        setRecentBookings(res.data.data.recentBookings || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load dashboard', 'error');
      setStats({});
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" height="60px" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rect" height="88px" />)}
        </div>
        <Skeleton variant="rect" height="200px" />
      </div>
    );
  }

  const hasPending = stats?.pendingActions?.newRequests > 0 || stats?.pendingActions?.unreadMessages > 0;

  const statCards = [
    { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: CalendarDays, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: 'Completed', value: stats?.completedBookings || 0, icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Total Earned', value: `₹${(stats?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Rating', value: stats?.rating || 0, icon: Star, color: 'text-warning-500', bg: 'bg-warning-50', isRating: true, reviewCount: stats?.reviewCount || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">
          {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Artisan'}!
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {hasPending
            ? `You have ${stats.pendingActions.newRequests || 0} pending request${stats.pendingActions.newRequests !== 1 ? 's' : ''}`
            : 'All caught up! Here\'s your dashboard overview.'
          }
        </p>
      </div>

      {/* Profile completion */}
      <ProfileCompletionCard onNavigateTab={onNavigateTab} />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, isRating, reviewCount }) => (
          <Card key={label} hover={false} compact>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {isRating ? (
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold text-gray-900">{Number(value).toFixed(1)}</span>
                    <StarRating value={Math.round(Number(value))} size="sm" readOnly />
                  </div>
                ) : (
                  <p className={`text-2xl font-bold mt-1 ${label.includes('Earned') ? color : 'text-gray-900'}`}>
                    {value}
                  </p>
                )}
                {isRating && <p className="text-xs text-gray-400 mt-0.5">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>}
                {stats?.weeklyGrowth !== 0 && label === 'Active Bookings' && (
                  <p className={`text-xs mt-0.5 flex items-center gap-0.5 ${stats.weeklyGrowth > 0 ? 'text-success-600' : 'text-error-600'}`}>
                    <TrendingUp className="h-3 w-3" />
                    {stats.weeklyGrowth > 0 ? '+' : ''}{stats.weeklyGrowth}% this week
                  </p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Income chart */}
      <IncomeChart months={6} />

      {/* Pending actions */}
      {hasPending && (
        <Alert variant="warning">
          <div className="space-y-2">
            {stats.pendingActions.newRequests > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{stats.pendingActions.newRequests} new booking request{stats.pendingActions.newRequests !== 1 ? 's' : ''}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.('bookings')}>
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {stats.pendingActions.unreadMessages > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{stats.pendingActions.unreadMessages} unread message{stats.pendingActions.unreadMessages !== 1 ? 's' : ''}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.('clients')}>
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Bookings</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.('bookings')}>
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {recentBookings.length > 0 ? (
          <div className="space-y-2">
            {recentBookings.slice(0, 3).map(booking => (
              <BookingCard
                key={booking._id}
                booking={booking}
                perspective="artisan"
                expanded={false}
                onToggle={() => {}}
                actions={[]}
              />
            ))}
          </div>
        ) : (
          <Card hover={false}>
            <p className="text-sm text-gray-400 text-center py-4">No bookings yet. Share your profile to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardOverviewTab;
```

**Step 2: Check the StarRating component API**

Read `components/ui/StarRating.jsx` to verify it accepts `value`, `size`, and `readOnly` props. Adjust usage if different.

**Step 3: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 4: Manual verification**

Open `http://localhost:5173/artisan/account#dashboard`:
- Greeting matches time of day
- Profile completion card shows (if profile incomplete), dismiss works
- Stats cards show real data with icons
- Income chart loads with monthly bars
- Pending actions link to other tabs via hash
- Recent bookings show top 3

**Step 5: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx
git commit -m "feat(dashboard): rebuild DashboardOverviewTab with smart features

- Time-based welcome greeting
- ProfileCompletionCard with step checklist (dismissible)
- Stats cards with Card component, Lucide icons, StarRating
- IncomeChart (6-month, shared component)
- Pending actions with cross-tab navigation
- Recent bookings using BookingCard (compact)
- Full Skeleton loading state"
```

---

## Task 6: Rebuild EarningsTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/EarningsTab.jsx`

**Context:** Balance cards, 12-month income chart, transaction history. API: `GET /api/payments/artisan/earnings` returns `{ summary: { availableBalance, pendingAmount, totalEarned, lastWithdrawal, thisMonth }, transactions: [...] }`.

**Step 1: Rewrite EarningsTab**

Key structure:

```jsx
import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { Card, Skeleton, EmptyState } from '../../ui';
import IncomeChart from '../../dashboard/IncomeChart.jsx';
import { Wallet, Clock, TrendingUp, ArrowDownLeft, ArrowUpRight, Banknote } from 'lucide-react';

const EarningsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEarnings(); }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/payments/artisan/earnings');
      if (res.data.success) {
        setEarnings(res.data.data.summary || {});
        setTransactions(res.data.data.transactions || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load earnings', 'error');
      setEarnings({});
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" height="28px" width="200px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} variant="rect" height="100px" />)}
        </div>
        <Skeleton variant="rect" height="200px" />
      </div>
    );
  }

  const balanceCards = [
    { label: 'Available Balance', value: earnings?.availableBalance, icon: Wallet, color: 'text-success-600', bg: 'bg-success-50', subtitle: null },
    { label: 'Pending Amount', value: earnings?.pendingAmount, icon: Clock, color: 'text-warning-600', bg: 'bg-warning-50', subtitle: 'Available in 2-3 days' },
    { label: 'This Month', value: earnings?.thisMonth, icon: TrendingUp, color: 'text-brand-500', bg: 'bg-brand-50', subtitle: null },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">Earnings & Payouts</h2>
        <p className="text-sm text-gray-500 mt-1">Track your income and payment history</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balanceCards.map(({ label, value, icon: Icon, color, bg, subtitle }) => (
          <Card key={label} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{(value || 0).toLocaleString('en-IN')}
                </p>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
              </div>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Total earned summary */}
      <Card hover={false}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Earned (Lifetime)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₹{(earnings?.totalEarned || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-success-50 rounded-lg">
            <Banknote className="h-6 w-6 text-success-600" />
          </div>
        </div>
      </Card>

      {/* Income chart — 12 months */}
      <IncomeChart months={12} />

      {/* Transaction history */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction History</h3>
        {transactions.length > 0 ? (
          <Card hover={false} padding={false}>
            <div className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <div key={tx._id || tx.paymentId} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'credit' || tx.status === 'captured' ? 'bg-success-50' : 'bg-error-50'}`}>
                      {tx.type === 'credit' || tx.status === 'captured'
                        ? <ArrowDownLeft className="h-4 w-4 text-success-600" />
                        : <ArrowUpRight className="h-4 w-4 text-error-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.description || 'Payment received'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'credit' || tx.status === 'captured' ? 'text-success-600' : 'text-error-600'}`}>
                    {tx.type === 'credit' || tx.status === 'captured' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={<Banknote className="h-12 w-12" />}
            title="No transactions yet"
            description="Completed bookings will appear here as payments"
          />
        )}
      </div>

      {/* Info note */}
      <p className="text-xs text-gray-400 text-center">
        Payments are processed via Razorpay and deposited to your linked account.
      </p>
    </div>
  );
};

export default EarningsTab;
```

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/EarningsTab.jsx
git commit -m "feat(dashboard): rebuild EarningsTab with design system

- Balance cards with Card component and Lucide icons
- IncomeChart (12-month view, shared component)
- Transaction history with directional icons
- EmptyState for no transactions
- Skeleton loading state
- Removed fake 'Withdraw Now' button"
```

---

## Task 7: Rebuild ReviewsTab (artisan view)

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/ReviewsTab.jsx`

**Context:** Uses `ReviewCard` (from Phase 7), `StarRating`, `FilterChips`, `Card`, `Button`, `Input`. Fetches reviews from `GET /api/reviews/artisan/:id` and tags from `GET /api/reviews/artisan/:id/tags`. The tag endpoint returns `[{ tag, count, sentiment }]`.

**Step 1: Rewrite ReviewsTab**

The component needs:
- Rating overview with `StarRating` and breakdown bars
- Tag summary from `/tags` endpoint
- Review list using `ReviewCard` component
- Reply form using `Input` + `Button`
- Filter/sort using `FilterChips`: Recent | Highest | Lowest | Needs Reply
- Pagination (existing API supports `page` + `limit`)

Implement the full component. Key patterns:
- Fetch reviews and tags in parallel with `Promise.all`
- `ReviewCard` already renders user info, tags, rating badge, photos, and artisan response
- For "Needs Reply" filter: `reviews.filter(r => !r.response?.text)`
- Reply form is inline below review (keep current pattern but with design system Input/Button)
- Stats computed client-side from reviews (same as current, but could also be read from artisan model's `averageRating`)

**Step 2: Verify build + lint**

**Step 3: Manual verification**

Open `http://localhost:5173/artisan/account#reviews`:
- Rating overview shows StarRating (not emoji stars)
- Tag summary shows top tags with counts
- Reviews render via ReviewCard with proper tag display
- Reply form works (Input + Button, not raw textarea)
- Filter chips switch between views

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/ReviewsTab.jsx
git commit -m "feat(dashboard): rebuild ReviewsTab with design system

- StarRating component replaces emoji stars
- ReviewCard for each review (tags, photos, response displayed)
- Tag summary from /api/reviews/artisan/:id/tags endpoint
- FilterChips for sort (Recent, Highest, Lowest, Needs Reply)
- Reply form with Input + Button components
- Rating breakdown with design tokens"
```

---

## Task 8: Rebuild ArtisanProfileTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/ArtisanProfileTab.jsx`

**Context:** Swap raw HTML inputs to `Input` component, raw buttons to `Button` component, raw image display to `Avatar` component. Same API calls, just new UI. Uses `getArtisanProfile`, `updateArtisanProfile`, `uploadProfilePhoto` from `lib/api/artisanProfile.js`.

**Step 1: Rewrite ArtisanProfileTab**

- Import `Input`, `Button`, `Avatar`, `Spinner`, `Card` from `../../ui`
- Profile photo section: `Avatar` size="xl" + `Button variant="secondary"` for upload
- Form grid: `Input` components for all fields (fullName, email disabled, phoneNumber disabled, bio as textarea)
- Character counter for bio: `helperText` prop on Input
- Actions: `Button variant="primary"` for save, `Button variant="ghost"` for cancel
- Keep all existing logic (handleSave, onUploadPhoto, form state)

**Step 2: Verify build + lint**

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/ArtisanProfileTab.jsx
git commit -m "feat(dashboard): rebuild ArtisanProfileTab with design system

- Avatar component for profile photo display
- Input component for all form fields
- Button component for save/cancel/upload actions
- Spinner during photo upload
- Same API integration, new UI"
```

---

## Task 9: Rebuild PortfolioTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/PortfolioTab.jsx`

**Context:** Replace raw modal (`AddProjectModal`) with `BottomSheet`. Replace raw spinner with `Skeleton`. Replace `confirm()` with confirmation `BottomSheet`. Replace raw file input hack with `MultiImageUpload` (if it fits) or at minimum use `Button` for triggers. Use `Card`, `Button`, `Input`, `EmptyState` from design system. Keep drag-and-drop reorder logic (works well).

**Step 1: Rewrite PortfolioTab**

Key changes:
- `AddProjectModal` becomes a `BottomSheet` with `Input` components
- Loading state: `Skeleton` grid instead of raw spinner
- Empty state: `EmptyState` component
- Project cards: `Card` component
- Delete confirmation: `BottomSheet` instead of `confirm()`
- Image upload button: `Button variant="secondary"` instead of raw `createElement`
- Category field: `Input as="select"` with `options` prop
- All buttons: `Button` component
- Keep all existing API logic and drag-and-drop handlers unchanged

**Step 2: Verify build + lint**

**Step 3: Manual verification**

Open `http://localhost:5173/artisan/account#portfolio`:
- "Add Project" opens BottomSheet (not a fixed modal)
- Form uses Input components
- Project cards use Card component
- Delete shows confirmation BottomSheet
- Drag and drop still works
- Image upload works

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/PortfolioTab.jsx
git commit -m "feat(dashboard): rebuild PortfolioTab with design system

- BottomSheet replaces raw fixed modal for project creation
- Card component for project display
- Skeleton loading, EmptyState for empty
- Button/Input for all interactive elements
- Confirmation BottomSheet for delete (replaces confirm())
- Drag-and-drop reorder preserved"
```

---

## Task 10: Rebuild AvailabilityTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/AvailabilityTab.jsx`

**Context:** Keep calendar layout (unique and useful). Swap design tokens: `border-[#A55233]` → `border-brand-500`, etc. Use `Card`, `Button`, `Input`, `Badge`, `Skeleton` from design system. Replace raw buttons with `Button` components, raw inputs with `Input` components.

**Step 1: Rewrite AvailabilityTab**

Key changes:
- Week calendar: `Card` wrapper, `Badge` for booking indicators, design tokens for today highlight
- Navigation: `Button variant="ghost"` for Prev/Today/Next
- Schedule editor: each day row in a `Card`, time inputs use `Input`, remove/add buttons use `Button`
- Settings: `Input type="number"` with labels
- Save: `Button variant="primary"`
- Loading: `Skeleton` instead of `LoadingState`

**Step 2: Verify build + lint**

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/AvailabilityTab.jsx
git commit -m "feat(dashboard): rebuild AvailabilityTab with design system

- Card/Badge/Button/Input components throughout
- Design tokens replace hardcoded #A55233
- Calendar uses Badge for booking indicators
- Skeleton loading state
- Keep existing schedule logic and calendar view"
```

---

## Task 11: Polish MyClientsTab, AppearanceTab, HelpSupportTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/MyClientsTab.jsx`
- Modify: `kalasetu-frontend/src/components/profile/tabs/AppearanceTab.jsx`
- Modify: `kalasetu-frontend/src/components/profile/tabs/HelpSupportTab.jsx`

### MyClientsTab

Already uses `Avatar`, `EmptyState`, `LoadingState` from design system. Changes:
- Replace raw `<input>` search bar (line 52-60) with `Input` component: `<Input label="" placeholder="Search clients..." value={searchTerm} onChange={...} />`
- Add a search icon inside Input via a wrapper or keep the current icon approach
- Replace raw `<button>` elements (lines 138-148) with `Button` component
- Replace `rounded-card`, `shadow-card` (custom tokens) with `Card` component wrapper if not already

### AppearanceTab

- Replace hardcoded `text-[#A55233]` and `focus:ring-[#A55233]` with `text-brand-500` and `focus:ring-brand-500` across radio buttons and checkboxes
- Replace `bg-[#A55233]` sample button with `bg-brand-500`
- Replace `#A55233` circle in preview with `bg-brand-500`
- Wrap theme/font sections in `Card` component instead of raw `bg-gray-50 rounded-lg p-6`

### HelpSupportTab

- Replace raw `<input>` and `<textarea>` in support form (lines 317-346) with `Input` component
- Replace raw `<button>` submit (line 349-356) with `Button variant="primary"`
- Replace raw `<select>` in report form (line 409-418) with `Input as="select"` with options
- Replace raw `<textarea>` in report form with `Input as="textarea"`
- Replace raw submit button with `Button`

**Step 1: Apply all three sets of changes**

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 3: Manual verification**

Quick check each tab renders correctly:
- MyClientsTab: search works, buttons styled
- AppearanceTab: no `#A55233` visible in code, brand colors used
- HelpSupportTab: forms use Input, buttons use Button

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/MyClientsTab.jsx kalasetu-frontend/src/components/profile/tabs/AppearanceTab.jsx kalasetu-frontend/src/components/profile/tabs/HelpSupportTab.jsx
git commit -m "feat(dashboard): polish MyClientsTab, AppearanceTab, HelpSupportTab

- MyClientsTab: Input for search, Button for actions
- AppearanceTab: brand-500 tokens replace hardcoded #A55233, Card wrappers
- HelpSupportTab: Input/Button for forms, Input as='select' for dropdowns
- All three now use design system components consistently"
```

---

## Task 12: Final verification and build check

**Step 1: Full build check**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds, no errors.

**Step 2: Lint check**

Run: `cd kalasetu-frontend && npm run lint`
Expected: No new errors. Existing warnings acceptable.

**Step 3: Grep for remaining hardcoded values**

Run: `grep -r "#A55233\|#8e462b\|#8a4329" kalasetu-frontend/src/components/profile/tabs/ kalasetu-frontend/src/pages/ArtisanAccountPage.jsx`
Expected: No results. All hardcoded brand colors should be replaced with design tokens.

Run: `grep -r "⭐\|💰\|🏦\|📊\|⚠️\|💡" kalasetu-frontend/src/components/profile/tabs/ kalasetu-frontend/src/pages/ArtisanAccountPage.jsx`
Expected: No results. All emojis should be replaced with Lucide icons or design system components.

**Step 4: Backend verification**

Run: `cd kalasetu-backend && npm run dev`
Expected: Server starts clean on port 5000. No errors.

**Step 5: Manual smoke test**

Open browser, login as artisan (`priya@kalasetu.demo` / `Demo@1234`):
1. Navigate to artisan dashboard
2. Click through all 11 tabs via sidebar
3. Verify mobile view (resize browser to 375px width)
4. Test URL hash navigation: type `#earnings` in URL bar
5. Test back button navigation between tabs
6. Verify profile completion card appears (if applicable)
7. Verify income chart loads

**Step 6: Run code review**

Use `/review-code` on changed files:
- `kalasetu-frontend/src/pages/ArtisanAccountPage.jsx`
- `kalasetu-frontend/src/components/dashboard/IncomeChart.jsx`
- `kalasetu-frontend/src/components/dashboard/ProfileCompletionCard.jsx`
- `kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx`
- `kalasetu-frontend/src/components/profile/tabs/EarningsTab.jsx`
- `kalasetu-frontend/src/components/profile/tabs/ReviewsTab.jsx`

Fix any CRITICAL or HIGH issues before final commit.

---

## Summary

| Task | Scope | Commit Message Prefix |
|------|-------|-----------------------|
| 1 | Delete 6 orphaned files | `chore:` |
| 2 | IncomeChart component | `feat(dashboard):` |
| 3 | ProfileCompletionCard component | `feat(dashboard):` |
| 4 | ArtisanAccountPage container | `feat(dashboard):` |
| 5 | DashboardOverviewTab | `feat(dashboard):` |
| 6 | EarningsTab | `feat(dashboard):` |
| 7 | ReviewsTab | `feat(dashboard):` |
| 8 | ArtisanProfileTab | `feat(dashboard):` |
| 9 | PortfolioTab | `feat(dashboard):` |
| 10 | AvailabilityTab | `feat(dashboard):` |
| 11 | Polish 3 tabs | `feat(dashboard):` |
| 12 | Final verification | no commit (verification only) |

**Dependencies:** Task 2 and 3 must complete before Task 5 (DashboardOverviewTab uses both). Task 4 must complete before Task 5 (container passes `onNavigateTab`). Tasks 6-11 are independent of each other. Task 12 runs after all others.

**Backend changes:** None. All APIs already exist including the tag aggregation endpoint.
