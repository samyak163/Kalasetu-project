# Phase 10: User Dashboard Rebuild — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the user/customer dashboard (2 containers + 5 tabs) using the established design system, matching the quality and patterns set by Phase 9's artisan dashboard rebuild.

**Architecture:** Frontend-only rebuild. All backend APIs already exist. No new shared components needed — all design system primitives exist from Phases 1-9. UserProfilePage gets URL hash navigation. ProfileModal gets design token refresh. All 5 tabs swap raw HTML for design system components.

**Tech Stack:** React 18 (JSX), Tailwind CSS with design tokens, Lucide icons, existing design system from `components/ui/index.js`

**Design Doc:** `docs/plans/2026-02-21-user-dashboard-design.md`

**No test suite exists.** Quality gates: `npm run build` (frontend) + `npm run lint` (frontend) + manual browser verification.

**Design system components available:** Button, Card, Input, Badge, Avatar, Skeleton, Alert, EmptyState, LoadingState, Spinner, BottomSheet, FilterChips, StatusBadge, StarRating, ReviewCard, ImageCarousel, MultiImageUpload, TabBar

---

## Execution Strategy

**3 waves for agent team parallelization:**

| Wave | Tasks | Parallelizable? |
|------|-------|-----------------|
| Wave 1 | Task 1 (UserProfilePage) + Task 2 (ProfileModal) | Yes — independent containers |
| Wave 2 | Tasks 3-7 (ProfileTab, RatingsTab, BookmarksTab, OrderHistoryTab, PreferencesTab) | Yes — all independent tabs |
| Wave 3 | Task 8 (Final verification + code review) | Sequential — depends on all above |

---

## Task 1: Rebuild UserProfilePage container

**Files:**
- Modify: `kalasetu-frontend/src/pages/UserProfilePage.jsx`

**Context:** Current page uses `useState` for tab switching with Lucide icons. Needs URL hash navigation (`#profile`, `#ratings`, `#saved`, `#orders`, `#notifications`, `#appearance`, `#help`), mobile icon tab bar, desktop sidebar with brand accent bar. Pattern: copy ArtisanAccountPage structure exactly.

**Reference:** `kalasetu-frontend/src/pages/ArtisanAccountPage.jsx` — use the same hash nav pattern (`getHashTab()`, `hashchange` listener, `navigateTab` callback), same mobile tab bar structure, same desktop sidebar structure.

**Step 1: Rewrite UserProfilePage**

```jsx
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
```

**Step 2: Verify build**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/pages/UserProfilePage.jsx
git commit -m "feat(dashboard): rebuild UserProfilePage container

- URL hash navigation (#profile, #ratings, #saved, #orders, etc.)
- Mobile: horizontal icon tab bar with active label
- Desktop: sidebar with brand accent bar, sticky nav
- Avatar component in header
- Matches ArtisanAccountPage container pattern"
```

---

## Task 2: Rebuild ProfileModal

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/ProfileModal.jsx`

**Context:** Current modal uses emoji icons (👤, ⭐, etc.) and hardcoded `#A55233`/`#F3E9E5`/`#2A1810` colors. Keep the custom event system (`open-profile`), keep body scroll lock, keep all tab rendering logic. Only swap visual elements.

**Step 1: Rewrite ProfileModal**

```jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ToastContext } from '../../context/ToastContext.jsx';
import ProfileTab from './tabs/ProfileTab.jsx';
import RatingsTab from './tabs/RatingsTab.jsx';
import BookmarksTab from './tabs/BookmarksTab.jsx';
import OrderHistoryTab from './tabs/OrderHistoryTab.jsx';
import PreferencesTab from './tabs/PreferencesTab.jsx';
import AppearanceTab from './tabs/AppearanceTab.jsx';
import HelpSupportTab from './tabs/HelpSupportTab.jsx';
import {
  User, Star, Bookmark, ClipboardList,
  Bell, SunMoon, HelpCircle, X,
} from 'lucide-react';

const tabs = [
  { key: 'profile', label: 'Your Profile', icon: User },
  { key: 'ratings', label: 'Your Rating', icon: Star },
  { key: 'bookmarks', label: 'Collections', icon: Bookmark },
  { key: 'history', label: 'History', icon: ClipboardList },
  { key: 'preferences', label: 'Preferences', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: SunMoon },
  { key: 'help', label: 'Help & Support', icon: HelpCircle },
];

const ProfileModal = () => {
  const { auth, logout } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const handleOpenProfile = (event) => {
      setIsOpen(true);
      const tab = event.detail?.tab || 'profile';
      setActiveTab(tab);
    };
    globalThis.addEventListener('open-profile', handleOpenProfile);
    return () => globalThis.removeEventListener('open-profile', handleOpenProfile);
  }, []);

  useEffect(() => {
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
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] max-h-[800px]">
          {/* Sidebar Tabs - Desktop */}
          <aside className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex-col gap-2 overflow-y-auto">
            {tabs.map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all
                    flex items-center gap-3
                    ${
                      activeTab === tab.key
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  aria-pressed={activeTab === tab.key}
                >
                  <IconComp className="h-5 w-5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="md:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
            <div className="flex gap-2 p-4 min-w-max">
              {tabs.map(tab => {
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                      flex items-center gap-2
                      ${
                        activeTab === tab.key
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <IconComp className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
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
```

**Key changes:**
- Emoji icons → Lucide icons (User, Star, Bookmark, ClipboardList, Bell, SunMoon, HelpCircle, X)
- Hardcoded `#A55233` / `#F3E9E5` / `#2A1810` → `brand-50` / `brand-500` / `brand-600` / `brand-900/30` tokens
- Close button SVG → Lucide `X` component
- All tab button active states use `brand-*` tokens

**Step 2: Verify build**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/ProfileModal.jsx
git commit -m "feat(dashboard): rebuild ProfileModal with design tokens

- Lucide icons replace emoji icons (User, Star, Bookmark, etc.)
- brand-50/brand-500/brand-600 tokens replace hardcoded #A55233
- X component replaces inline SVG for close button
- Keep custom event system and body scroll lock"
```

---

## Task 3: Rebuild ProfileTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx`

**Context:** 479-line profile editing tab. Avatar upload via Cloudinary, form fields, password change with strength meter. All hardcoded `#A55233`, raw `<input>`, `<button>`, `<textarea>`. Swap to `Input`, `Button`, `Avatar`, `Spinner`, `Card` from design system. **Keep ALL logic identical** — only change the JSX rendering.

**Step 1: Rewrite ProfileTab**

Key component swaps:
- `<input ... className="... focus:ring-[#A55233] ...">` → `<Input label="Full Name" ... />`
- `<textarea ... className="... focus:ring-[#A55233] ...">` → `<Input as="textarea" label="About Me" ... />`
- `<button ... className="... bg-[#A55233] ...">` → `<Button variant="primary">...</Button>`
- Profile photo circle → `Avatar size="xl"` with `src={formData.profileImageUrl}` and `name={formData.fullName}`
- Upload button → `<Button variant="secondary" as="label">` wrapping hidden file input
- Upload overlay → `Spinner` component inside absolute positioned div
- Password section toggle → `<Button variant="ghost">` with Lock icon
- Password strength colors: `bg-red-500` / `bg-yellow-500` / `bg-green-500` → `bg-error-500` / `bg-warning-500` / `bg-success-500`
- All `text-[#A55233]` → `text-brand-500`
- All `bg-[#A55233]` → `bg-brand-500`
- All `hover:bg-[#8e462b]` → `hover:bg-brand-600`

**Imports to add:**
```jsx
import { Button, Card, Input, Avatar, Spinner } from '../../ui';
import { Lock, Camera } from 'lucide-react';
```

**Preserve unchanged:**
- All `useState` declarations and handlers
- `handleImageUpload` (Cloudinary upload flow)
- `handleSaveProfile` (API call)
- `handleChangePassword` (API call)
- `calculatePasswordStrength` function
- `getInitials` function
- `useEffect` hooks for user data and password strength
- Form validation logic
- `bootstrapAuth()` call after profile save

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 3: Grep for remaining hardcoded values**

Run: `grep -n "#A55233\|#8e462b" kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx`
Expected: No results.

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx
git commit -m "feat(dashboard): rebuild ProfileTab with design system

- Avatar component for profile photo
- Input component for all form fields (name, email, phone, bio)
- Button component for save/upload/password actions
- Spinner during image upload
- brand-500 tokens replace hardcoded #A55233
- Password strength uses semantic colors (error/warning/success)
- All logic preserved — only JSX changed"
```

---

## Task 4: Rebuild RatingsTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/RatingsTab.jsx`

**Context:** 159-line tab showing user ratings from artisans. Text stars (★/☆), hardcoded `#A55233`/`#D4A574` colors, rating breakdown bars. Swap to `StarRating`, `Card`, `Badge`, `Alert`, `EmptyState`, `Skeleton` from design system.

**Step 1: Rewrite RatingsTab**

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import { Card, Badge, Alert, EmptyState, Skeleton, StarRating } from '../../ui';
import { Star, Info } from 'lucide-react';

const RatingsTab = ({ user }) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await api.get('/api/users/ratings');
      setRatings(res.data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" height="28px" width="200px" />
        <Skeleton variant="rect" height="160px" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rect" height="64px" />)}
        </div>
      </div>
    );
  }

  const overallRating = ratings?.overallRating || 0;
  const ratingsCount = ratings?.ratingsCount || 0;

  const categories = [
    { key: 'punctuality', label: 'Punctuality' },
    { key: 'courtesy', label: 'Courtesy & Behavior' },
    { key: 'generosity', label: 'Generosity' },
    { key: 'communication', label: 'Communication' },
    { key: 'propertyCare', label: 'Property Care' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Your Rating</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          See how artisans rate your interactions
        </p>
      </div>

      {/* Overall Rating */}
      <Card className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-gray-800 dark:to-gray-700 border-brand-100">
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-brand-600 dark:text-white mb-2">
            {overallRating > 0 ? overallRating.toFixed(1) : '—'}
          </div>
          {overallRating > 0 && (
            <StarRating value={Math.round(overallRating)} size="lg" readOnly />
          )}
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Based on {ratingsCount} {ratingsCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </Card>

      {/* Rating Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Rating Breakdown
        </h3>
        <div className="space-y-3">
          {categories.map(category => {
            const rating = ratings?.categories?.[category.key] || 0;
            return (
              <Card key={category.key} hover={false} compact>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.label}
                  </span>
                  <Badge variant={rating >= 4 ? 'success' : rating >= 3 ? 'warning' : rating > 0 ? 'error' : 'default'}>
                    {rating > 0 ? rating.toFixed(1) : '—'}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-brand-500 dark:bg-brand-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(rating / 5) * 100}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Understanding Your Rating */}
      <Alert variant="info" icon={<Info className="h-5 w-5" />}>
        <h3 className="font-semibold mb-2">Understanding Your Rating</h3>
        <ul className="space-y-1 text-sm">
          <li>Your rating is based on feedback from artisans you've hired</li>
          <li>Each category is weighted equally</li>
          <li>Minimum 3 completed bookings required for accurate rating</li>
          <li>Recent reviews (last 6 months) have more weight</li>
          <li>Ratings are updated after each completed service</li>
        </ul>
      </Alert>

      {/* Recent Reviews */}
      {ratings?.recentReviews && ratings.recentReviews.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Recent Reviews
          </h3>
          <div className="space-y-3">
            {ratings.recentReviews.map((review, idx) => (
              <Card key={idx} hover={false}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {review.artisanName || 'Artisan'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <StarRating value={review.rating} size="sm" readOnly />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Star className="h-12 w-12" />}
          title="No ratings yet"
          description="Complete your first booking to receive ratings from artisans!"
        />
      )}
    </div>
  );
};

export default RatingsTab;
```

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 3: Grep for remaining hardcoded values**

Run: `grep -n "#A55233\|#D4A574\|★\|☆" kalasetu-frontend/src/components/profile/tabs/RatingsTab.jsx`
Expected: No results.

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/RatingsTab.jsx
git commit -m "feat(dashboard): rebuild RatingsTab with design system

- StarRating component replaces text stars
- Card for rating categories and reviews
- Badge for rating values with semantic variants
- Alert for 'Understanding Your Rating' info box
- EmptyState for no ratings
- Skeleton loading state
- brand-500 tokens replace hardcoded #A55233/#D4A574"
```

---

## Task 5: Rebuild BookmarksTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/BookmarksTab.jsx`

**Context:** 183-line saved artisans tab with search/filter/sort and artisan card grid. Partially uses `brand-500` already. Needs: `Input` for search, `Card` for artisan cards, `Avatar` for photos, `Badge` for ratings, `Button` for actions, `EmptyState` for empty, `Skeleton` for loading. Replace raw SVG heart with Lucide `Heart` icon.

**Step 1: Rewrite BookmarksTab**

Key component swaps:
- Search `<input>` → `<Input placeholder="Search by name or specialty..." ... />`
- Sort/filter `<select>` elements → keep as styled selects (no Input as="select" needed for filters that are inline)
- Artisan `<img>` photo → `<Avatar src={...} name={...} size="lg" />`
- Heart SVG → `<Heart className="h-5 w-5" fill="currentColor" />` from Lucide
- View Profile `<Link>` → keep as Link but style with `Button` classes or wrap in `Button as="a"`
- Contact `<button>` → `<Button variant="secondary" size="sm">`
- "No saved artisans" div → `<EmptyState icon={<Bookmark />} title="..." description="..." />`
- Loading div → `<Skeleton>` grid (3 card placeholders)
- Card container → `<Card>` component

**Imports to add:**
```jsx
import { Card, Avatar, Badge, Button, Input, EmptyState, Skeleton } from '../../ui';
import { Heart, Bookmark, Search } from 'lucide-react';
```

**Preserve unchanged:**
- All state and handlers (`fetchBookmarks`, `handleRemoveBookmark`, `filteredAndSorted`, sort/filter logic)
- `useNavigate` for Contact button
- Link to artisan profile via `publicId`

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/BookmarksTab.jsx
git commit -m "feat(dashboard): rebuild BookmarksTab with design system

- Card component for artisan cards
- Avatar for artisan photos
- Badge for rating display
- Button for View Profile and Contact actions
- Input for search field
- Lucide Heart icon replaces raw SVG
- EmptyState for no bookmarks
- Skeleton loading grid"
```

---

## Task 6: Rebuild OrderHistoryTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/OrderHistoryTab.jsx`

**Context:** 443-line largest tab. Stats cards, order list with expandable details, refund request modal. Key change: refund modal → `BottomSheet`. Also swap to `Card`, `Input`, `Button`, `StatusBadge`, `Badge`, `Avatar`, `EmptyState`, `Skeleton`.

**Step 1: Rewrite OrderHistoryTab**

Key component swaps:
- Stats cards `<div className="bg-gray-50 ...">` → `<Card hover={false} compact>`
- Search `<input>` → `<Input placeholder="Search by service or artisan..." />`
- Status filter `<select>` → keep as styled select
- Order card `<div className="bg-white ...">` → `<Card>`
- Artisan `<img>` → `<Avatar src={...} name={...} size="md" />`
- Status span → `<StatusBadge status={order.status} />`
- Refund status → `<Badge variant={...}>`
- Action buttons → `<Button variant="primary|secondary|ghost" size="sm">`
- Refund modal `<div className="fixed inset-0 ...">` → `<BottomSheet open={showRefundModal} onClose={closeRefundModal} title="Request Refund">`
- Refund form fields → `<Input>` components
- Refund reason select → styled select inside BottomSheet
- Loading → `<Skeleton>` components
- Empty → `<EmptyState>`

**Imports to add:**
```jsx
import { Card, Avatar, Badge, Button, Input, StatusBadge, BottomSheet, EmptyState, Skeleton } from '../../ui';
import { ShoppingBag, IndianRupee, Calculator, Star } from 'lucide-react';
```

**Remove:**
- `import { X } from 'lucide-react'` — BottomSheet handles its own close button

**Preserve unchanged:**
- All state management (orders, refunds, search, filter, expanded)
- `fetchOrders`, `fetchRefundRequests`, `filteredOrders` logic
- `handleRateReview`, `handleViewDetails`, `handleRebook` handlers
- `openRefundModal`, `closeRefundModal`, `handleSubmitRefund` — logic stays, only wrapper changes
- `getStatusColor`, `getRefundStatusColor` — can be simplified since StatusBadge/Badge handle colors

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/OrderHistoryTab.jsx
git commit -m "feat(dashboard): rebuild OrderHistoryTab with design system

- Card for stats and order items
- Avatar for artisan photos
- StatusBadge for order status
- Badge for refund status
- BottomSheet replaces fixed modal for refund requests
- Button for all actions (Rate, Refund, Details, Rebook)
- Input for search and refund form fields
- Skeleton loading, EmptyState for no orders"
```

---

## Task 7: Rebuild PreferencesTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/PreferencesTab.jsx`

**Context:** 250-line preferences tab with notification toggles, language/currency selects, privacy settings. All hardcoded `#A55233`, raw checkboxes. Swap to `Card`, `Button`, `Input` from design system. Use styled Tailwind checkboxes with `accent-brand-500`.

**Step 1: Rewrite PreferencesTab**

Key component swaps:
- Each section `<div className="bg-gray-50 ...">` → `<Card hover={false}>`
- Toggle checkboxes `<input type="checkbox" className="... text-[#A55233] ... focus:ring-[#A55233]">` → `<input type="checkbox" className="w-5 h-5 accent-brand-500 rounded" />`
- Language/Currency `<select className="... focus:ring-[#A55233] ...">` → styled selects with brand focus ring: `focus:ring-brand-500`
- Privacy select → same treatment
- Privacy checkbox → same `accent-brand-500` treatment
- Save button `<button className="... bg-[#A55233] hover:bg-[#8e462b] ...">` → `<Button variant="primary">`

**Imports to add:**
```jsx
import { Card, Button } from '../../ui';
```

**Preserve unchanged:**
- All state (`preferences` object, `loading`)
- All handlers (`handleToggle`, `handleChange`, `handlePrivacyChange`, `handleSave`)
- API call to `PUT /api/users/profile`
- `useEffect` for initial preferences from user

**Step 2: Verify build + lint**

Run: `cd kalasetu-frontend && npm run build && npm run lint`

**Step 3: Grep for remaining hardcoded values**

Run: `grep -n "#A55233\|#8e462b" kalasetu-frontend/src/components/profile/tabs/PreferencesTab.jsx`
Expected: No results.

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/PreferencesTab.jsx
git commit -m "feat(dashboard): rebuild PreferencesTab with design system

- Card for each notification/privacy section
- Button for save action
- accent-brand-500 for toggle checkboxes
- focus:ring-brand-500 for selects
- All hardcoded #A55233 removed"
```

---

## Task 8: Final verification and code review

**Depends on:** All tasks 1-7 complete.

**Step 1: Full build check**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds with no errors.

**Step 2: Lint check**

Run: `cd kalasetu-frontend && npm run lint`
Expected: No new errors.

**Step 3: Grep for remaining hardcoded values across ALL Phase 10 files**

```bash
grep -rn "#A55233\|#8e462b\|#D4A574\|#F3E9E5\|#2A1810" \
  kalasetu-frontend/src/pages/UserProfilePage.jsx \
  kalasetu-frontend/src/components/profile/ProfileModal.jsx \
  kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx \
  kalasetu-frontend/src/components/profile/tabs/RatingsTab.jsx \
  kalasetu-frontend/src/components/profile/tabs/BookmarksTab.jsx \
  kalasetu-frontend/src/components/profile/tabs/OrderHistoryTab.jsx \
  kalasetu-frontend/src/components/profile/tabs/PreferencesTab.jsx
```
Expected: No results.

**Step 4: Grep for remaining emoji icons in ProfileModal**

```bash
grep -n "👤\|⭐\|🔖\|📋\|⚙️\|🎨\|❓" kalasetu-frontend/src/components/profile/ProfileModal.jsx
```
Expected: No results.

**Step 5: Run code review**

Use `/review-code` on all changed files:
- `kalasetu-frontend/src/pages/UserProfilePage.jsx`
- `kalasetu-frontend/src/components/profile/ProfileModal.jsx`
- `kalasetu-frontend/src/components/profile/tabs/ProfileTab.jsx`
- `kalasetu-frontend/src/components/profile/tabs/RatingsTab.jsx`
- `kalasetu-frontend/src/components/profile/tabs/BookmarksTab.jsx`
- `kalasetu-frontend/src/components/profile/tabs/OrderHistoryTab.jsx`
- `kalasetu-frontend/src/components/profile/tabs/PreferencesTab.jsx`

Fix any CRITICAL or HIGH issues before proceeding.

---

## Summary

| Task | File | Commit Prefix | Wave |
|------|------|---------------|------|
| 1 | UserProfilePage.jsx | `feat(dashboard):` | 1 (parallel) |
| 2 | ProfileModal.jsx | `feat(dashboard):` | 1 (parallel) |
| 3 | ProfileTab.jsx | `feat(dashboard):` | 2 (parallel) |
| 4 | RatingsTab.jsx | `feat(dashboard):` | 2 (parallel) |
| 5 | BookmarksTab.jsx | `feat(dashboard):` | 2 (parallel) |
| 6 | OrderHistoryTab.jsx | `feat(dashboard):` | 2 (parallel) |
| 7 | PreferencesTab.jsx | `feat(dashboard):` | 2 (parallel) |
| 8 | Verification + review | no commit | 3 (sequential) |

**Dependencies:**
- Tasks 1-2 can run in parallel (independent containers)
- Tasks 3-7 can run in parallel (independent tabs, no shared state)
- Task 8 requires all 1-7 complete

**Backend changes:** None.
**New components:** None.
**Total estimated commits:** 7 implementation + 1-2 review fix commits
