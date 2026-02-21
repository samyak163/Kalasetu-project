# KalaSetu UI/UX Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild KalaSetu's entire frontend with a consistent design system, fix broken flows (booking, payment, chat), and add missing basics (reviews tags, notifications, error states) — inspired by Urban Company, Zomato, and Swiggy.

**Architecture:** Design System First — build 11 upgraded + 11 new UI components, upgrade Tailwind tokens, then rebuild every screen using only these components. Backend fixes are scoped to booking atomicity, availability API, review tags, and trending search.

**Tech Stack:** React 18 (JSX, no TypeScript), Tailwind CSS, Vite, Node.js/Express, MongoDB/Mongoose (ES modules), Razorpay, Stream Chat, Daily.co, OneSignal, Cloudinary

**Design Doc:** `docs/plans/2026-02-18-kalasetu-ui-overhaul-design.md`

**Coordination:** The offering redesign plan (`docs/plans/2026-02-18-artisan-offering-redesign-plan.md`) handles schema changes, new offering API endpoints, and offering-specific wizards. This plan handles EVERYTHING ELSE — design system, page layouts, flow fixes, and integration repairs. Where both plans touch the same file (HomePage, ArtisanProfilePage, SearchResults), this plan owns the full page rebuild and integrates offering components.

**Note:** No backend test suite exists (V2 priority). Steps reference manual verification via `npm run dev` and browser testing.

---

## Phase 1: Design System Foundation

Upgrade existing components, build new ones, update Tailwind config. Every subsequent phase depends on this.

---

### Task 1: Upgrade Tailwind config with design tokens

**Files:**
- Modify: `kalasetu-frontend/tailwind.config.js`

**Step 1: Add semantic color aliases, spacing tokens, z-index scale, and container**

```javascript
// In tailwind.config.js, update theme.extend:
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ... existing brand, success, warning, error colors stay ...
        // ADD semantic aliases
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F9FAFB',
          muted: '#F3F4F6',
        },
        'text-primary': '#111827',
        'text-secondary': '#4B5563',
        'text-muted': '#9CA3AF',
        'border-default': '#E5E7EB',
      },
      // ... existing fontFamily, boxShadow, borderRadius stay ...
      zIndex: {
        sticky: '40',
        modal: '50',
        toast: '60',
      },
      maxWidth: {
        container: '1280px',
      },
      // ... existing keyframes, animation stay ...
    },
  },
  plugins: [],
}
```

**Step 2: Verify frontend builds**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds, no Tailwind errors.

**Step 3: Commit**

```bash
git add kalasetu-frontend/tailwind.config.js
git commit -m "feat(design): add semantic color aliases, z-index scale, and container tokens to Tailwind config"
```

---

### Task 2: Upgrade Button component — add outline variant and icon-only mode

**Files:**
- Modify: `kalasetu-frontend/src/components/ui/Button.jsx`

**Step 1: Add outline variant and icon-only support**

```jsx
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
  outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-500 bg-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const iconOnlySizes = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconOnly = false,
  children,
  className = '',
  ...props
}) {
  const sizeClass = iconOnly ? iconOnlySizes[size] : sizes[size];
  return (
    <button
      className={`btn-press inline-flex items-center justify-center gap-2 font-medium rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
```

**Step 2: Verify in browser**

Run: `cd kalasetu-frontend && npm run dev`
Open any page using Button — should render identically (backward compat).

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/ui/Button.jsx
git commit -m "feat(ui): add outline variant and icon-only mode to Button component"
```

---

### Task 3: Upgrade Card component — add interactive and compact variants

**Files:**
- Modify: `kalasetu-frontend/src/components/ui/Card.jsx`

**Step 1: Add interactive (hover lift) and compact variants**

```jsx
export default function Card({
  children,
  className = '',
  hover = true,
  padding = true,
  interactive = false,
  compact = false,
  onClick,
}) {
  const padClass = compact ? 'p-3' : padding ? 'p-6' : '';
  const hoverClass = interactive
    ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200'
    : hover ? 'card-hover' : '';

  return (
    <div
      className={`bg-white rounded-card shadow-card ${hoverClass} ${padClass} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/Card.jsx
git commit -m "feat(ui): add interactive and compact variants to Card component"
```

---

### Task 4: Upgrade Badge — add rating variant (Zomato color-coded)

**Files:**
- Modify: `kalasetu-frontend/src/components/ui/Badge.jsx`

**Step 1: Add rating variant with color-coded logic**

```jsx
import { Star } from 'lucide-react';

const statusStyles = {
  pending: 'bg-warning-50 text-warning-700 border-warning-500/20',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-500/20',
  completed: 'bg-success-50 text-success-700 border-success-500/20',
  cancelled: 'bg-error-50 text-error-700 border-error-500/20',
  rejected: 'bg-gray-100 text-gray-700 border-gray-300/50',
};

function getRatingColor(rating) {
  if (rating >= 4) return 'bg-success-500 text-white';
  if (rating >= 3) return 'bg-warning-500 text-white';
  return 'bg-error-500 text-white';
}

export default function Badge({ status, variant, rating, count, children, className = '' }) {
  // Rating variant — Zomato-style color-coded badge
  if (variant === 'rating' && rating != null) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${getRatingColor(rating)} ${className}`}>
        <Star className="h-3 w-3 fill-current" />
        {rating.toFixed(1)}
        {count != null && <span className="font-normal opacity-80">({count})</span>}
      </span>
    );
  }

  // Status variant — existing behavior
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-300/50';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {children || status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/Badge.jsx
git commit -m "feat(ui): add Zomato-style color-coded rating variant to Badge component"
```

---

### Task 5: Upgrade Input — add textarea and select variants

**Files:**
- Modify: `kalasetu-frontend/src/components/ui/Input.jsx`

**Step 1: Add as prop for rendering textarea or select**

```jsx
export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  as = 'input',
  options = [],
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const baseClass = `w-full px-3 py-2 rounded-input border ${
    error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 focus:ring-brand-500'
  } focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors text-sm`;

  let element;
  if (as === 'textarea') {
    element = (
      <textarea
        id={inputId}
        className={`${baseClass} resize-y min-h-[80px]`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
    );
  } else if (as === 'select') {
    element = (
      <select
        id={inputId}
        className={`${baseClass} appearance-none bg-white`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  } else {
    element = (
      <input
        id={inputId}
        className={baseClass}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
    );
  }

  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {element}
      {error && <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600">{error}</p>}
      {!error && helperText && <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/Input.jsx
git commit -m "feat(ui): add textarea and select variants to Input component"
```

---

### Task 6: Build BottomSheet component (Swiggy/UC pattern)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/BottomSheet.jsx`

**Step 1: Build the BottomSheet**

```jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Slide-up panel for mobile interactions (Swiggy/UC pattern).
 * On desktop (md+), renders as a centered modal. On mobile, slides up from bottom.
 */
export default function BottomSheet({ open, onClose, title, children, className = '' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-modal flex items-end md:items-center justify-center bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bottomsheet-title"
    >
      <div className={`w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-card shadow-dropdown max-h-[90vh] flex flex-col animate-slide-up md:animate-scale-in ${className}`}>
        {/* Handle bar (mobile) */}
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 id="bottomsheet-title" className="text-lg font-semibold font-display">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

**Step 2: Add slide-up animation to Tailwind config**

In `kalasetu-frontend/tailwind.config.js`, add to keyframes and animation:

```javascript
// keyframes
slideUp: {
  '0%': { opacity: '0', transform: 'translateY(100%)' },
  '100%': { opacity: '1', transform: 'translateY(0)' },
},
// animation
'slide-up': 'slideUp 0.3s ease-out',
```

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/ui/BottomSheet.jsx kalasetu-frontend/tailwind.config.js
git commit -m "feat(ui): add BottomSheet component with slide-up mobile animation"
```

---

### Task 7: Build FilterChips component (Zomato/Swiggy pattern)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/FilterChips.jsx`

**Step 1: Build horizontal scrollable filter chips**

```jsx
/**
 * Horizontal scrollable filter pills (Zomato/Swiggy pattern).
 * Active chips get brand-color fill. Inactive chips are outlined.
 *
 * @param {Array} chips - [{ key, label, active, onClick }]
 */
export default function FilterChips({ chips = [], className = '' }) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {chips.map(({ key, label, active, onClick }) => (
        <button
          key={key}
          onClick={onClick}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 ${
            active
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-brand-300 hover:text-brand-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Add scrollbar-hide utility**

In `kalasetu-frontend/src/index.css` (or global CSS), add:

```css
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/ui/FilterChips.jsx kalasetu-frontend/src/index.css
git commit -m "feat(ui): add FilterChips component with horizontal scroll and active state"
```

---

### Task 8: Build StickyBottomCTA component

**Files:**
- Create: `kalasetu-frontend/src/components/ui/StickyBottomCTA.jsx`

**Step 1: Build the sticky bottom bar**

```jsx
/**
 * Persistent bottom bar visible on scroll (UC/Swiggy pattern).
 * Used for "Book Now — Rs.1,299" on artisan profiles.
 */
export default function StickyBottomCTA({ children, className = '' }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-sticky bg-white border-t border-gray-200 shadow-dropdown px-4 py-3 md:hidden ${className}`}>
      {children}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/StickyBottomCTA.jsx
git commit -m "feat(ui): add StickyBottomCTA component for mobile persistent actions"
```

---

### Task 9: Build TabBar component (sticky horizontal tabs)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/TabBar.jsx`

**Step 1: Build sticky tab bar with underline indicator**

```jsx
/**
 * Sticky horizontal tabs with underline indicator (Zomato/UC pattern).
 * Sticks to top when scrolled past. Content swaps below.
 *
 * @param {Array} tabs - [{ key, label, count? }]
 * @param {string} activeTab - Currently active tab key
 * @param {function} onTabChange - (key) => void
 */
export default function TabBar({ tabs = [], activeTab, onTabChange, className = '' }) {
  return (
    <div className={`sticky top-0 z-sticky bg-white border-b border-gray-200 ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === key
                ? 'text-brand-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            {count != null && (
              <span className="ml-1 text-xs text-gray-400">({count})</span>
            )}
            {/* Underline indicator */}
            {activeTab === key && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/TabBar.jsx
git commit -m "feat(ui): add TabBar component with sticky positioning and underline indicator"
```

---

### Task 10: Build StatusBadge component (booking states)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/StatusBadge.jsx`

**Step 1: Build color-coded booking status badge**

```jsx
import { Clock, CheckCircle, XCircle, AlertCircle, Ban } from 'lucide-react';

const config = {
  pending: { icon: Clock, bg: 'bg-warning-50', text: 'text-warning-700', label: 'Pending' },
  confirmed: { icon: CheckCircle, bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
  completed: { icon: CheckCircle, bg: 'bg-success-50', text: 'text-success-700', label: 'Completed' },
  cancelled: { icon: Ban, bg: 'bg-error-50', text: 'text-error-700', label: 'Cancelled' },
  rejected: { icon: XCircle, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Rejected' },
};

export default function StatusBadge({ status, className = '' }) {
  const { icon: Icon, bg, text, label } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/StatusBadge.jsx
git commit -m "feat(ui): add StatusBadge component with icons and color-coded booking states"
```

---

### Task 11: Build ArtisanCard component (standardized listing card)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/ArtisanCard.jsx`

**Step 1: Build the artisan card**

```jsx
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle } from 'lucide-react';
import Badge from './Badge';
import Avatar from './Avatar';

/**
 * Standardized artisan listing card for search, homepage, and category browse.
 * Shows: avatar, name, craft, location, rating, verified badge.
 */
export default function ArtisanCard({ artisan, className = '' }) {
  const { publicId, fullName, craft, profileImageUrl, averageRating, totalReviews, location, isVerified } = artisan;

  return (
    <Link
      to={`/artisan/${publicId}`}
      className={`block bg-white rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Portfolio image or avatar */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={fullName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar name={fullName} size="lg" />
          </div>
        )}
      </div>

      <div className="p-3">
        {/* Name + verified */}
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{fullName}</h3>
          {isVerified && <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />}
        </div>

        {/* Craft */}
        {craft && <p className="text-xs text-gray-500 mt-0.5 truncate">{craft}</p>}

        {/* Rating + Location row */}
        <div className="flex items-center justify-between mt-2">
          {averageRating > 0 && (
            <Badge variant="rating" rating={averageRating} count={totalReviews} />
          )}
          {location?.city && (
            <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {location.city}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/ArtisanCard.jsx
git commit -m "feat(ui): add standardized ArtisanCard component for listings"
```

---

### Task 12: Build ReviewCard component (Zomato pattern)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/ReviewCard.jsx`

**Step 1: Build the review card with tags, photos, artisan response**

```jsx
import { ThumbsUp } from 'lucide-react';
import Badge from './Badge';
import Avatar from './Avatar';

/**
 * Individual review display (Zomato pattern).
 * Shows: user info, rating, tags, text, photos, artisan response, helpful vote.
 */
export default function ReviewCard({
  review,
  onHelpful,
  isHelpful = false,
  className = '',
}) {
  const { user, rating, comment, tags = [], images = [], response, helpfulVotes = [], createdAt } = review;
  const date = new Date(createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className={`py-4 border-b border-gray-100 last:border-0 ${className}`}>
      {/* Header: user + rating + date */}
      <div className="flex items-center gap-3">
        <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'Anonymous'}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <Badge variant="rating" rating={rating} />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Comment */}
      {comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{comment}</p>}

      {/* Photos */}
      {images.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <img key={i} src={img} alt={`Review photo ${i + 1}`} className="w-20 h-20 rounded-lg object-cover shrink-0" loading="lazy" />
          ))}
        </div>
      )}

      {/* Artisan response */}
      {response?.text && (
        <div className="mt-3 ml-4 pl-3 border-l-2 border-brand-200">
          <p className="text-xs font-medium text-brand-600">Artisan's Response</p>
          <p className="text-sm text-gray-600 mt-0.5">{response.text}</p>
        </div>
      )}

      {/* Helpful button */}
      <button
        onClick={onHelpful}
        className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
          isHelpful ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
      >
        <ThumbsUp className="h-3 w-3" />
        Helpful{helpfulVotes.length > 0 && ` (${helpfulVotes.length})`}
      </button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/ReviewCard.jsx
git commit -m "feat(ui): add ReviewCard component with tags, photos, and artisan response"
```

---

### Task 13: Build ImageCarousel component

**Files:**
- Create: `kalasetu-frontend/src/components/ui/ImageCarousel.jsx`

**Step 1: Build swipeable image gallery with pagination dots**

```jsx
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Swipeable image gallery for portfolios and product details.
 * Touch-friendly with snap scroll and pagination dots.
 */
export default function ImageCarousel({ images = [], aspectRatio = '16/9', className = '' }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);

  if (images.length === 0) return null;

  const scrollTo = (idx) => {
    setCurrent(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const idx = Math.round(scrollLeft / clientWidth);
    setCurrent(idx);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Images */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ aspectRatio }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Image ${i + 1}`}
            className="w-full shrink-0 snap-start object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Arrow buttons (desktop only) */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => scrollTo(Math.max(0, current - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-card opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={current === 0}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollTo(Math.min(images.length - 1, current + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-card opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={current === images.length - 1}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/60'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/ImageCarousel.jsx
git commit -m "feat(ui): add ImageCarousel component with snap scroll and pagination dots"
```

---

### Task 14: Build Toast component (non-blocking notifications)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/Toast.jsx`
- Create: `kalasetu-frontend/src/context/ToastContext.jsx`

**Step 1: Build Toast component**

```jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-success-50 border-success-500/30 text-success-700',
  error: 'bg-error-50 border-error-500/30 text-error-700',
  info: 'bg-blue-50 border-blue-500/30 text-blue-700',
};

export default function Toast({ toast, onDismiss }) {
  const { id, type = 'info', message, duration = 4000 } = toast;
  const Icon = icons[type];

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return createPortal(
    <div className={`fixed top-4 right-4 z-toast max-w-sm w-full border rounded-card shadow-dropdown p-3 flex items-start gap-2 animate-slide-in ${styles[type]}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={() => onDismiss(id)} className="p-0.5 hover:opacity-70" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>,
    document.body
  );
}
```

**Step 2: Build ToastContext for global toast management**

```jsx
import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.map((t) => <Toast key={t.id} toast={t} onDismiss={dismiss} />)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
```

**Step 3: Wrap app with ToastProvider**

In `kalasetu-frontend/src/main.jsx`, wrap the app:

```jsx
import { ToastProvider } from './context/ToastContext';
// Inside the render tree, wrap around App:
<ToastProvider>
  <App />
</ToastProvider>
```

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/ui/Toast.jsx kalasetu-frontend/src/context/ToastContext.jsx kalasetu-frontend/src/main.jsx
git commit -m "feat(ui): add Toast component and ToastContext for global notifications"
```

---

### Task 15: Build SlideToConfirm component (Swiggy pattern)

**Files:**
- Create: `kalasetu-frontend/src/components/ui/SlideToConfirm.jsx`

**Step 1: Build the slide-to-confirm interaction**

```jsx
import { useState, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';

/**
 * Swiggy-style slide-to-confirm button.
 * 70% threshold to trigger. Chevron morphs to checkmark on complete.
 */
export default function SlideToConfirm({ label = 'Slide to confirm', onConfirm, disabled = false }) {
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const handleStart = (clientX) => {
    if (disabled || confirmed) return;
    dragging.current = true;
  };

  const handleMove = (clientX) => {
    if (!dragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left - 24) / (rect.width - 48)));
    setProgress(pct);
  };

  const handleEnd = () => {
    dragging.current = false;
    if (progress >= 0.7) {
      setProgress(1);
      setConfirmed(true);
      onConfirm?.();
    } else {
      setProgress(0);
    }
  };

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-full overflow-hidden select-none ${disabled ? 'opacity-50' : ''} ${confirmed ? 'bg-success-500' : 'bg-gray-100'}`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Fill track */}
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all ${confirmed ? 'bg-success-500' : 'bg-brand-500/20'}`}
        style={{ width: `${progress * 100}%` }}
      />

      {/* Label */}
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-medium transition-opacity ${confirmed ? 'text-white' : 'text-gray-500'}`}>
        {confirmed ? 'Confirmed!' : label}
      </span>

      {/* Thumb */}
      <div
        className={`absolute top-1 bottom-1 w-12 rounded-full flex items-center justify-center shadow-card transition-colors ${confirmed ? 'bg-white' : 'bg-brand-500'}`}
        style={{ left: `${Math.max(0, progress * (100 - 15))}%` }}
      >
        {confirmed ? (
          <Check className="h-5 w-5 text-success-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-white" />
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/ui/SlideToConfirm.jsx
git commit -m "feat(ui): add SlideToConfirm component (Swiggy pattern, 70% threshold)"
```

---

### Task 16: Update barrel export with all new components

**Files:**
- Modify: `kalasetu-frontend/src/components/ui/index.js`

**Step 1: Add all new component exports**

```javascript
// Existing
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Modal } from './Modal';
export { default as Input } from './Input';
export { default as Badge } from './Badge';
export { default as Avatar } from './Avatar';
export { default as Skeleton } from './Skeleton';
export { default as Alert } from './Alert';
export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as Spinner } from './Spinner';

// New — Phase 1 Design System
export { default as BottomSheet } from './BottomSheet';
export { default as FilterChips } from './FilterChips';
export { default as StickyBottomCTA } from './StickyBottomCTA';
export { default as TabBar } from './TabBar';
export { default as StatusBadge } from './StatusBadge';
export { default as ArtisanCard } from './ArtisanCard';
export { default as ReviewCard } from './ReviewCard';
export { default as ImageCarousel } from './ImageCarousel';
export { default as Toast } from './Toast';
export { default as SlideToConfirm } from './SlideToConfirm';
```

**Step 2: Verify all imports resolve**

Run: `cd kalasetu-frontend && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/ui/index.js
git commit -m "feat(ui): update barrel export with all new design system components"
```

---

## Phase 2: Homepage Redesign

Rebuild the homepage using design system components. Depends on Phase 1 completion.

**Coordination note:** The offering redesign plan (Task 13) also touches `HomePage.jsx` and creates `TrendingProducts.jsx` / `PopularPackages.jsx`. This plan owns the FULL homepage rebuild. If implementing both plans, do THIS plan's homepage task and integrate the offering-specific sections within it.

---

### Task 17: Rebuild HomePage with new layout

**Files:**
- Modify: `kalasetu-frontend/src/pages/HomePage.jsx`
- Create: `kalasetu-frontend/src/components/home/LocationBar.jsx`
- Create: `kalasetu-frontend/src/components/home/HeroBannerCarousel.jsx`
- Create: `kalasetu-frontend/src/components/home/CategoryChips.jsx`
- Create: `kalasetu-frontend/src/components/home/ArtisanCarousel.jsx`
- Create: `kalasetu-frontend/src/components/home/HowItWorks.jsx`

**Step 1: Build LocationBar**

Simple city dropdown. Stores selected city in localStorage. Drives "Near You" filtering.

```jsx
// LocationBar.jsx
// - Read city from localStorage (default: 'All Cities')
// - Dropdown with major Indian cities
// - On change: save to localStorage, trigger parent callback
```

**Step 2: Build HeroBannerCarousel**

Full-width auto-rotating banners using ImageCarousel component. 3:1 aspect ratio. Hardcoded initially with 3-4 promotional banners.

**Step 3: Build CategoryChips**

Horizontal scrollable category chips (replacing current grid). Fetch from `/api/categories`. Each chip: icon + label. Tap navigates to `/category/:slug`.

**Step 4: Build ArtisanCarousel**

Horizontal scrollable row of ArtisanCard components. Reusable for "Top Artisans Near You" and "Featured Artisans" sections.

**Step 5: Build HowItWorks**

3-step explainer with icons: Browse → Book → Experience. Polished with design system components.

**Step 6: Assemble HomePage**

Layout order:
1. LocationBar (sticky)
2. Search bar (tap → full-screen overlay, built in Phase 3)
3. HeroBannerCarousel
4. CategoryChips (horizontal scroll)
5. ArtisanCarousel ("Top Artisans Near You")
6. ArtisanCarousel ("Featured Artisans")
7. HowItWorks
8. Footer

**Note:** TrendingProducts and PopularPackages carousels from the offering redesign plan are added AFTER the offering API endpoints exist. For now, leave placeholder slots or conditional rendering.

**Step 7: Commit**

```bash
git add kalasetu-frontend/src/pages/HomePage.jsx kalasetu-frontend/src/components/home/
git commit -m "feat(ui): rebuild HomePage with location bar, banner carousel, category chips, artisan carousels"
```

---

## Phase 3: Search & Discovery

Build the 3-state search model. Depends on Phase 1 (FilterChips, TabBar, BottomSheet).

---

### Task 18: Build search overlay (pre-search + autocomplete)

**Files:**
- Create: `kalasetu-frontend/src/components/search/SearchOverlay.jsx`
- Create: `kalasetu-frontend/src/hooks/useRecentSearches.js`

**Step 1: Build useRecentSearches hook**

```javascript
// useRecentSearches.js
// - Read/write from localStorage key 'ks_recent_searches'
// - addSearch(term), getSearches(), clearSearches()
// - Max 10 recent searches, newest first
```

**Step 2: Build SearchOverlay**

Full-screen overlay that opens when search bar is tapped:
- State 1 (pre-search): Recent searches as chips, trending searches (hardcoded array), category grid
- State 2 (typing): Debounced autocomplete results from `/api/search/suggestions`, blended results with type icons (Artisan/Service/Category)
- On select: navigate to `/search?q=term` or `/artisan/:publicId`
- Close button, backdrop click to close

**Step 3: Integrate with HomePage**

Replace or augment existing SearchBar. Tap on search input opens SearchOverlay.

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/search/SearchOverlay.jsx kalasetu-frontend/src/hooks/useRecentSearches.js kalasetu-frontend/src/pages/HomePage.jsx
git commit -m "feat(ui): add 3-state search overlay with recent searches and autocomplete"
```

---

### Task 19: Rebuild SearchResults page with tabs and filter chips

**Files:**
- Modify: `kalasetu-frontend/src/pages/SearchResults.jsx`

**Step 1: Rebuild with TabBar and FilterChips**

- Tabs: [All] [Artisans] [Services] [Products] — using TabBar component
- Filter chips below tabs — using FilterChips component
- Chips: Sort, Rating 4+, Price Range, Near Me, Available Now, Verified
- Sort and Price Range open BottomSheet
- Results use ArtisanCard for artisans
- All results show shimmer skeletons while loading
- Empty state uses EmptyState component

**Step 2: Add backend endpoint for trending searches**

Create `GET /api/search/trending` in `kalasetu-backend/controllers/searchController.js`:
- Returns hardcoded array of trending terms by region initially
- Later can be driven by analytics

Add route in `kalasetu-backend/routes/searchRoutes.js`.

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/pages/SearchResults.jsx kalasetu-backend/controllers/searchController.js kalasetu-backend/routes/searchRoutes.js
git commit -m "feat(ui): rebuild SearchResults with tabs, filter chips, and trending searches endpoint"
```

---

## Phase 4: Artisan Profile Page

Rebuild the public-facing artisan profile. Depends on Phase 1 (TabBar, ArtisanCard, ReviewCard, ImageCarousel, StickyBottomCTA, Badge rating variant).

**Coordination note:** The offering redesign plan (Task 14) also touches `ArtisanProfilePage.jsx` and creates product/service tabs. This plan owns the FULL page rebuild — offering tabs are part of this rebuild.

---

### Task 20: Rebuild ArtisanProfilePage

**Files:**
- Modify: `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx`
- Create: `kalasetu-frontend/src/components/artisan/ProfileHeader.jsx`
- Create: `kalasetu-frontend/src/components/artisan/ReviewsTab.jsx`
- Create: `kalasetu-frontend/src/components/artisan/AboutTab.jsx`

**Step 1: Build ProfileHeader**

Compact header below portfolio hero:
- Avatar + name + craft + verified badge
- Quick stats row: RatingBadge, experience years, total bookings, response rate
- Tagline (1 line)
- Chat & Call buttons (right-aligned)

**Step 2: Build ReviewsTab**

Zomato Reviews 2.0 pattern:
- Tag summary at top (most common tags as chips with counts)
- Individual reviews using ReviewCard component
- Pagination or "Load more"
- Fetches from `GET /api/reviews/artisan/:id`

**Step 3: Build AboutTab**

- Bio text
- Full portfolio gallery using ImageCarousel
- Working hours display
- Location/service area

**Step 4: Assemble ArtisanProfilePage**

Layout order:
1. Portfolio Hero Carousel (ImageCarousel, full-width, 16:9)
2. ProfileHeader
3. Sticky TabBar — [Services] [Products] [Custom] [Reviews] [About]
4. Tab content area — one tab visible at a time
5. StickyBottomCTA — "Book Now - From Rs.X"

Tab visibility: only show tabs that have content. Default to first tab with content.

**Step 5: Commit**

```bash
git add kalasetu-frontend/src/pages/ArtisanProfilePage.jsx kalasetu-frontend/src/components/artisan/
git commit -m "feat(ui): rebuild ArtisanProfilePage with portfolio hero, sticky tabs, and Zomato-style reviews"
```

---

## Phase 5: Booking + Payment Flow

Fix the booking and payment backend, build BottomSheet checkout. Depends on Phase 1 (BottomSheet, SlideToConfirm) and Phase 4 (artisan profile context).

---

### Task 21: Build availability API endpoint

**Files:**
- Create: `kalasetu-backend/controllers/availabilityController.js` (or add to existing)
- Modify: `kalasetu-backend/routes/availabilityRoutes.js`

**Step 1: Create GET /api/artisans/:id/availability endpoint**

```javascript
// Returns available time slots for a given date
// - Reads artisan's workingHours configuration
// - Checks existing bookings for conflicts
// - Respects minimumBookingNotice (grey out slots too close to now)
// - Returns array of { time: 'HH:MM', available: boolean }
```

**Step 2: Commit**

```bash
git add kalasetu-backend/controllers/availabilityController.js kalasetu-backend/routes/availabilityRoutes.js
git commit -m "feat(api): add artisan availability endpoint returning time slots per date"
```

---

### Task 22: Fix payment-booking atomicity

**Files:**
- Modify: `kalasetu-backend/controllers/paymentController.js`
- Modify: `kalasetu-backend/controllers/bookingController.js`

**Step 1: Restructure payment flow**

Current broken flow: booking created → payment initiated → payment may fail → orphaned booking.

Fixed flow:
1. Frontend sends booking details to `POST /api/payments/create-order`
2. Backend creates Razorpay order (no booking yet), stores intent
3. User completes Razorpay checkout
4. Frontend sends Razorpay response to `POST /api/payments/verify`
5. Backend verifies Razorpay signature → creates booking + payment in same request
6. If verification fails → no booking created, error returned

**Step 2: Implement autoAcceptBookings**

In `bookingController.js`, after booking creation:
```javascript
// If artisan has autoAcceptBookings enabled, set status to 'confirmed'
if (artisan.autoAcceptBookings) {
  booking.status = 'confirmed';
  await booking.save();
}
```

**Step 3: Commit**

```bash
git add kalasetu-backend/controllers/paymentController.js kalasetu-backend/controllers/bookingController.js
git commit -m "fix(api): make payment-booking atomic — booking created only after payment verification"
```

---

### Task 23: Build BottomSheet booking flow (frontend)

**Files:**
- Create: `kalasetu-frontend/src/components/booking/ServiceSummarySheet.jsx`
- Create: `kalasetu-frontend/src/components/booking/PaymentSheet.jsx`
- Create: `kalasetu-frontend/src/components/booking/BookingConfirmation.jsx`
- Create: `kalasetu-frontend/src/components/booking/DateTimePicker.jsx`

**Step 1: Build DateTimePicker**

- Horizontal scrollable day chips (next 14 days)
- Time slot chips below (from availability API)
- Greyed out = booked or too close to now
- Selected state: brand color fill

**Step 2: Build ServiceSummarySheet (BottomSheet Step 1)**

Uses BottomSheet component:
- Service name, artisan name, price, duration
- Included items checklist (green checks)
- DateTimePicker
- Special requests textarea (Input with as="textarea")
- "Continue — Rs.X" button

**Step 3: Build PaymentSheet (BottomSheet Step 2)**

Uses BottomSheet component:
- Order summary (service + date + time)
- Price breakdown: service fee + platform fee
- Payment method pills: UPI, Card, Netbanking
- SlideToConfirm component
- On confirm → initiate Razorpay checkout
- Error recovery: on Razorpay failure, show Alert with retry button

**Step 4: Build BookingConfirmation (full-screen)**

- Checkmark animation (CSS keyframes)
- All booking details: service, artisan, date/time, booking ID
- Quick action buttons: Message Artisan, View Booking, Back to Home

**Step 5: Wire into ArtisanProfilePage**

- "Book Now" on ServiceCard → opens ServiceSummarySheet
- ServiceSummarySheet "Continue" → opens PaymentSheet
- PaymentSheet confirmed → shows BookingConfirmation

**Step 6: Commit**

```bash
git add kalasetu-frontend/src/components/booking/
git commit -m "feat(ui): add BottomSheet booking flow with date picker, payment, and confirmation"
```

---

## Phase 6: Booking Status & Tracking

Rebuild booking management for both users and artisans. Depends on Phase 1 (StatusBadge, BottomSheet, TabBar).

---

### Task 24: Rebuild UserBookings page

**Files:**
- Modify: `kalasetu-frontend/src/pages/dashboard/user/UserBookings.jsx`
- Create: `kalasetu-frontend/src/components/booking/BookingCard.jsx`
- Create: `kalasetu-frontend/src/components/booking/CancellationSheet.jsx`

**Step 1: Build BookingCard**

Expandable booking card:
- Collapsed: artisan avatar + name, service name, date/time, StatusBadge
- Expanded: full details (booking ID, price, duration), context-dependent action buttons
- Action buttons per status (from design doc Section 6)

**Step 2: Build CancellationSheet**

BottomSheet for cancellation:
- Reason dropdown (using Input with as="select")
- Cancellation policy display (if post-confirmation)
- "Confirm Cancellation" button
- Calls `PUT /api/bookings/:id/status` with status='cancelled'

**Step 3: Rebuild UserBookings with status tabs**

- TabBar: [Upcoming] [Completed] [Cancelled]
- Upcoming = pending + confirmed bookings
- Each tab shows BookingCards
- Shimmer skeletons while loading
- EmptyState when no bookings in a tab

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/pages/dashboard/user/UserBookings.jsx kalasetu-frontend/src/components/booking/BookingCard.jsx kalasetu-frontend/src/components/booking/CancellationSheet.jsx
git commit -m "feat(ui): rebuild UserBookings with status tabs, expandable cards, and cancellation sheet"
```

---

### Task 25: Rebuild artisan BookingsTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/BookingsTab.jsx`

**Step 1: Rebuild with StatusBadge, FilterChips, inline actions**

- FilterChips: Pending, Confirmed, Completed, Cancelled
- BookingCard with artisan-specific actions: Accept, Reject, Complete, Cancel
- Accept/Reject open BottomSheet with optional notes field
- Uses StatusBadge component throughout

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/BookingsTab.jsx
git commit -m "feat(ui): rebuild artisan BookingsTab with filter chips and inline accept/reject actions"
```

---

## Phase 7: Reviews Flow

Add tag-based reviews. Depends on Phase 1 (BottomSheet, ReviewCard, Badge rating variant).

---

### Task 26: Add tags field to Review model and tag aggregation endpoint

**Files:**
- Modify: `kalasetu-backend/models/reviewModel.js`
- Modify: `kalasetu-backend/controllers/reviewController.js`
- Modify: `kalasetu-backend/routes/reviewRoutes.js`

**Step 1: Add tags to review schema**

In `kalasetu-backend/models/reviewModel.js`, add after `rating` field:

```javascript
  tags: {
    type: [String],
    default: [],
    validate: [v => v.length <= 5, 'Maximum 5 tags allowed'],
  },
```

**Step 2: Update createReview to accept tags**

In `kalasetu-backend/controllers/reviewController.js`, add `tags` to Zod schema and save to document.

**Step 3: Add tag aggregation endpoint**

```javascript
// GET /api/reviews/artisan/:id/tags
// Returns: [{ tag: 'On Time', count: 12 }, { tag: 'Excellent Craftsmanship', count: 8 }, ...]
export const getArtisanReviewTags = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tags = await Review.aggregate([
    { $match: { artisan: new mongoose.Types.ObjectId(id), status: 'active' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { tag: '$_id', count: 1, _id: 0 } },
  ]);
  res.json({ success: true, data: tags });
});
```

**Step 4: Add route**

In `kalasetu-backend/routes/reviewRoutes.js`:
```javascript
router.get('/artisan/:id/tags', getArtisanReviewTags);
```

**Step 5: Commit**

```bash
git add kalasetu-backend/models/reviewModel.js kalasetu-backend/controllers/reviewController.js kalasetu-backend/routes/reviewRoutes.js
git commit -m "feat(api): add review tags field and tag aggregation endpoint for artisan profiles"
```

---

### Task 27: Build review submission BottomSheet

**Files:**
- Create: `kalasetu-frontend/src/components/review/ReviewSubmitSheet.jsx`
- Create: `kalasetu-frontend/src/components/review/StarRating.jsx`
- Create: `kalasetu-frontend/src/components/review/ReviewTagSelector.jsx`

**Step 1: Build StarRating component**

- 5 large tappable stars
- Rating label below: 1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent
- Controlled component: value + onChange

**Step 2: Build ReviewTagSelector**

- Tag chips that change based on selected rating
- Positive tags (4-5 stars): "Excellent Craftsmanship", "On Time", "True to Photos", etc.
- Negative tags (1-2 stars): "Delayed", "Different from Photos", etc.
- Select 1-5 tags (required)

**Step 3: Build ReviewSubmitSheet**

BottomSheet with 3 steps (single scrollable view, not separate sheets):
1. StarRating
2. ReviewTagSelector
3. Optional text review (Input as="textarea") + optional photo upload (max 3)
4. "Submit Review" button
5. Calls `POST /api/reviews`
6. On success: toast success, refresh reviews

**Step 4: Wire into BookingCard**

"Leave Review" button on completed BookingCards opens ReviewSubmitSheet.

**Step 5: Commit**

```bash
git add kalasetu-frontend/src/components/review/
git commit -m "feat(ui): add review submission BottomSheet with star rating, tag selection, and photo upload"
```

---

## Phase 8: Chat Integration

Fix chat UX gaps. Depends on existing Stream Chat integration and Phase 1 (EmptyState).

---

### Task 28: Add chat access points and rebuild MessagesPage

**Files:**
- Modify: `kalasetu-frontend/src/pages/MessagesPage.jsx`
- Modify: `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx` (add Message button)
- Create: `kalasetu-frontend/src/hooks/useStreamChannel.js`

**Step 1: Build useStreamChannel hook**

```javascript
// useStreamChannel.js
// - Creates or opens a Stream Chat channel between current user and target artisan/user
// - Returns { openChat(targetId), loading }
// - Navigates to /messages?channel=channelId on open
```

**Step 2: Add "Message" button to artisan profile header**

In ProfileHeader (from Task 20), the Chat button uses `useStreamChannel` hook.

**Step 3: Rebuild MessagesPage**

- Desktop: Left panel (channel list) + Right panel (active chat)
- Mobile: Full-screen channel list, tap opens full-screen chat
- Channel list: artisan/user avatars, last message preview, unread count badge
- Empty state: "No conversations yet" with EmptyState component
- Uses design system components throughout

**Step 4: Add unread message badge to navbar**

Use ChatContext's unread count to show red badge on chat icon in navbar.

**Step 5: Commit**

```bash
git add kalasetu-frontend/src/pages/MessagesPage.jsx kalasetu-frontend/src/hooks/useStreamChannel.js kalasetu-frontend/src/pages/ArtisanProfilePage.jsx
git commit -m "feat(ui): rebuild MessagesPage and add chat access points on artisan profile"
```

---

## Phase 9: Artisan Dashboard Rebuild

Rebuild all 11 tabs using design system components. Depends on Phase 1, Phase 6 (BookingCard), Phase 7 (ReviewCard).

---

### Task 29: Rebuild DashboardOverviewTab

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx`

**Step 1: Redesign with UC-style overview**

- Welcome greeting with artisan name
- Stats cards row: earnings (this month), rating (RatingBadge), response rate, total bookings
- "Today's Bookings" highlighted section
- Quick actions: View All Bookings, Add New Service, View Messages
- All cards use Card component, stats show Skeleton while loading

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx
git commit -m "feat(ui): rebuild artisan DashboardOverviewTab with stats cards and today's bookings"
```

---

### Task 30: Rebuild EarningsTab and ReviewsTab (artisan dashboard)

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/EarningsTab.jsx`
- Modify: `kalasetu-frontend/src/components/profile/tabs/ReviewsTab.jsx`

**Step 1: Rebuild EarningsTab**

- Summary cards: this month, total, pending payouts
- Payment history list with StatusBadge (captured, pending, refunded)
- Uses Card and Skeleton components

**Step 2: Rebuild ReviewsTab (artisan view)**

- Tag summary at top (fetch from `/api/reviews/artisan/:id/tags`)
- ReviewCard list with "Respond" button per review
- Respond opens BottomSheet with textarea
- Calls `POST /api/reviews/:id/respond`

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/EarningsTab.jsx kalasetu-frontend/src/components/profile/tabs/ReviewsTab.jsx
git commit -m "feat(ui): rebuild artisan EarningsTab and ReviewsTab with design system components"
```

---

## Phase 10: User Dashboard Rebuild

Rebuild user dashboard pages. Depends on Phase 1, Phase 6 (BookingCard).

---

### Task 31: Rebuild UserDashboardHome

**Files:**
- Modify: `kalasetu-frontend/src/pages/dashboard/user/UserDashboardHome.jsx`

**Step 1: Redesign with design system**

- Welcome greeting
- Review prompt banner (when completed bookings have no review)
- Upcoming bookings (highlighted, using BookingCard)
- Stats cards: total bookings, total spent, reviews given
- Recent activity feed
- All loading states use Skeleton
- Empty states use EmptyState

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/pages/dashboard/user/UserDashboardHome.jsx
git commit -m "feat(ui): rebuild UserDashboardHome with review prompts, stats cards, and skeletons"
```

---

### Task 32: Rebuild UserPayments and Support pages

**Files:**
- Modify: `kalasetu-frontend/src/pages/dashboard/user/UserPayments.jsx`
- Modify: `kalasetu-frontend/src/pages/dashboard/user/Support.jsx`

**Step 1: Rebuild UserPayments**

- Payment cards with StatusBadge, amount, date, booking reference
- Uses Card component
- Skeleton loading, EmptyState for no payments

**Step 2: Rebuild Support**

- FAQ accordion (common questions about bookings, payments, cancellations)
- Support ticket form below FAQ (using Input and Button components)
- Uses Card for FAQ items

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/pages/dashboard/user/UserPayments.jsx kalasetu-frontend/src/pages/dashboard/user/Support.jsx
git commit -m "feat(ui): rebuild UserPayments and Support pages with design system components"
```

---

## Phase 11: Remaining Integrations & Global Polish

Error states, notifications, 404 page. Depends on Phase 1 (Alert, EmptyState, Skeleton, Toast).

---

### Task 33: Build notification dropdown

**Files:**
- Create: `kalasetu-frontend/src/components/NotificationDropdown.jsx`

**Step 1: Build notification bell with dropdown**

- Bell icon in navbar with unread count badge (red circle)
- Click opens dropdown panel
- Each notification: icon, title, message, relative timestamp, read/unread state
- Click notification: mark as read, navigate to deep link (url field)
- "Mark all as read" button at top
- Fetches from `GET /api/notifications`
- Marks as read via `PATCH /api/notifications/:id/read`

**Step 2: Integrate into navbar**

Replace or augment existing notification UI in the app's navbar/header component.

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/NotificationDropdown.jsx
git commit -m "feat(ui): add notification dropdown with unread badge and mark-as-read"
```

---

### Task 34: Build 404 page and global error boundary

**Files:**
- Create: `kalasetu-frontend/src/pages/NotFoundPage.jsx`
- Create: `kalasetu-frontend/src/components/ErrorBoundary.jsx`
- Modify: `kalasetu-frontend/src/App.jsx` (add 404 route and error boundary)

**Step 1: Build NotFoundPage**

```jsx
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold font-display text-brand-500 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <div className="flex gap-3">
        <Link to="/"><Button>Go Home</Button></Link>
        <Link to="/search"><Button variant="outline">Search</Button></Link>
      </div>
    </div>
  );
}
```

**Step 2: Build ErrorBoundary**

React error boundary that catches render errors, shows Alert with retry button.

**Step 3: Add to App.jsx**

- Wrap routes with ErrorBoundary
- Add `<Route path="*" element={<NotFoundPage />} />` as last route

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/pages/NotFoundPage.jsx kalasetu-frontend/src/components/ErrorBoundary.jsx kalasetu-frontend/src/App.jsx
git commit -m "feat(ui): add 404 page and global error boundary"
```

---

### Task 35: Add offline banner and global loading/empty/error patterns

**Files:**
- Create: `kalasetu-frontend/src/components/OfflineBanner.jsx`
- Create: `kalasetu-frontend/src/hooks/useOnlineStatus.js`

**Step 1: Build useOnlineStatus hook**

```javascript
// Returns { isOnline } — watches navigator.onLine events
```

**Step 2: Build OfflineBanner**

```jsx
// Fixed banner at top: "You're offline — some features may not work"
// Only visible when isOnline === false
```

**Step 3: Add to app layout**

Render OfflineBanner at the top of the app layout (above navbar).

**Step 4: Commit**

```bash
git add kalasetu-frontend/src/components/OfflineBanner.jsx kalasetu-frontend/src/hooks/useOnlineStatus.js
git commit -m "feat(ui): add offline detection banner and useOnlineStatus hook"
```

---

## Final Verification

### Task 36: End-to-end verification

**Step 1: Verify frontend builds**

```bash
cd kalasetu-frontend && npm run build
```
Expected: No errors.

**Step 2: Verify backend starts**

```bash
cd kalasetu-backend && npm run dev
```
Expected: No crashes.

**Step 3: Run frontend lint**

```bash
cd kalasetu-frontend && npm run lint
```
Expected: No new errors.

**Step 4: Manual browser testing**

- Homepage: location bar, search, banner carousel, category chips, artisan carousels
- Search: tap search → overlay, type → autocomplete, results → tabs + filter chips
- Artisan profile: hero carousel, compact header, sticky tabs, reviews with tags
- Booking: select service → ServiceSummarySheet → PaymentSheet → confirmation
- User dashboard: stats, booking tabs, review prompts
- Artisan dashboard: overview stats, booking management, reviews with response
- Chat: message from profile, MessagesPage, unread badges
- Notifications: bell icon, dropdown, mark as read
- 404: navigate to invalid URL
- Offline: disconnect network → banner appears

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete UI/UX overhaul — design system, page rebuilds, flow fixes, and integration repairs"
```

---

## File Summary

### New Files (28)
| File | Purpose |
|------|---------|
| `kalasetu-frontend/src/components/ui/BottomSheet.jsx` | Slide-up panel (Swiggy/UC) |
| `kalasetu-frontend/src/components/ui/FilterChips.jsx` | Horizontal filter pills |
| `kalasetu-frontend/src/components/ui/StickyBottomCTA.jsx` | Persistent mobile CTA |
| `kalasetu-frontend/src/components/ui/TabBar.jsx` | Sticky tabs with underline |
| `kalasetu-frontend/src/components/ui/StatusBadge.jsx` | Booking status indicator |
| `kalasetu-frontend/src/components/ui/ArtisanCard.jsx` | Standardized listing card |
| `kalasetu-frontend/src/components/ui/ReviewCard.jsx` | Review with tags + response |
| `kalasetu-frontend/src/components/ui/ImageCarousel.jsx` | Swipeable image gallery |
| `kalasetu-frontend/src/components/ui/Toast.jsx` | Non-blocking notification |
| `kalasetu-frontend/src/components/ui/SlideToConfirm.jsx` | Swiggy confirm slider |
| `kalasetu-frontend/src/context/ToastContext.jsx` | Global toast management |
| `kalasetu-frontend/src/components/home/LocationBar.jsx` | City selector |
| `kalasetu-frontend/src/components/home/HeroBannerCarousel.jsx` | Homepage banners |
| `kalasetu-frontend/src/components/home/CategoryChips.jsx` | Category chips (horizontal) |
| `kalasetu-frontend/src/components/home/ArtisanCarousel.jsx` | Artisan card carousel |
| `kalasetu-frontend/src/components/home/HowItWorks.jsx` | 3-step explainer |
| `kalasetu-frontend/src/components/search/SearchOverlay.jsx` | Full-screen search |
| `kalasetu-frontend/src/components/artisan/ProfileHeader.jsx` | Compact artisan header |
| `kalasetu-frontend/src/components/artisan/ReviewsTab.jsx` | Reviews tab (public) |
| `kalasetu-frontend/src/components/artisan/AboutTab.jsx` | About tab |
| `kalasetu-frontend/src/components/booking/ServiceSummarySheet.jsx` | Booking step 1 |
| `kalasetu-frontend/src/components/booking/PaymentSheet.jsx` | Booking step 2 |
| `kalasetu-frontend/src/components/booking/BookingConfirmation.jsx` | Booking step 3 |
| `kalasetu-frontend/src/components/booking/DateTimePicker.jsx` | Date/time selector |
| `kalasetu-frontend/src/components/booking/BookingCard.jsx` | Expandable booking card |
| `kalasetu-frontend/src/components/booking/CancellationSheet.jsx` | Cancellation BottomSheet |
| `kalasetu-frontend/src/components/review/ReviewSubmitSheet.jsx` | Review submission |
| `kalasetu-frontend/src/components/review/StarRating.jsx` | Star rating selector |
| `kalasetu-frontend/src/components/review/ReviewTagSelector.jsx` | Tag chip selector |
| `kalasetu-frontend/src/hooks/useRecentSearches.js` | Recent searches (localStorage) |
| `kalasetu-frontend/src/hooks/useStreamChannel.js` | Stream Chat channel opener |
| `kalasetu-frontend/src/hooks/useOnlineStatus.js` | Online/offline detection |
| `kalasetu-frontend/src/components/NotificationDropdown.jsx` | Notification bell + panel |
| `kalasetu-frontend/src/pages/NotFoundPage.jsx` | 404 page |
| `kalasetu-frontend/src/components/ErrorBoundary.jsx` | React error boundary |
| `kalasetu-frontend/src/components/OfflineBanner.jsx` | Offline status banner |
| `kalasetu-backend/controllers/availabilityController.js` | Artisan time slots |

### Modified Files (22)
| File | Changes |
|------|---------|
| `kalasetu-frontend/tailwind.config.js` | + semantic colors, z-index, container, slideUp anim |
| `kalasetu-frontend/src/components/ui/Button.jsx` | + outline variant, icon-only mode |
| `kalasetu-frontend/src/components/ui/Card.jsx` | + interactive, compact variants |
| `kalasetu-frontend/src/components/ui/Badge.jsx` | + rating variant (Zomato) |
| `kalasetu-frontend/src/components/ui/Input.jsx` | + textarea, select variants |
| `kalasetu-frontend/src/components/ui/index.js` | + all new component exports |
| `kalasetu-frontend/src/index.css` | + scrollbar-hide utility |
| `kalasetu-frontend/src/main.jsx` | + ToastProvider wrapper |
| `kalasetu-frontend/src/App.jsx` | + 404 route, ErrorBoundary |
| `kalasetu-frontend/src/pages/HomePage.jsx` | Full rebuild with design system |
| `kalasetu-frontend/src/pages/SearchResults.jsx` | Full rebuild with tabs + filters |
| `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx` | Full rebuild with sticky tabs |
| `kalasetu-frontend/src/pages/MessagesPage.jsx` | Rebuild with design system |
| `kalasetu-frontend/src/pages/dashboard/user/UserDashboardHome.jsx` | Rebuild with stats + skeletons |
| `kalasetu-frontend/src/pages/dashboard/user/UserBookings.jsx` | Rebuild with status tabs |
| `kalasetu-frontend/src/pages/dashboard/user/UserPayments.jsx` | Rebuild with Card + StatusBadge |
| `kalasetu-frontend/src/pages/dashboard/user/Support.jsx` | Rebuild with FAQ + form |
| `kalasetu-frontend/src/components/profile/tabs/DashboardOverviewTab.jsx` | Rebuild with UC-style overview |
| `kalasetu-frontend/src/components/profile/tabs/BookingsTab.jsx` | Rebuild with inline actions |
| `kalasetu-frontend/src/components/profile/tabs/EarningsTab.jsx` | Rebuild with summary cards |
| `kalasetu-frontend/src/components/profile/tabs/ReviewsTab.jsx` | Rebuild with tag summary |
| `kalasetu-backend/controllers/paymentController.js` | Atomic payment-booking flow |
| `kalasetu-backend/controllers/bookingController.js` | + autoAcceptBookings logic |
| `kalasetu-backend/controllers/reviewController.js` | + tags support, tag aggregation |
| `kalasetu-backend/controllers/searchController.js` | + trending searches endpoint |
| `kalasetu-backend/models/reviewModel.js` | + tags field |
| `kalasetu-backend/routes/reviewRoutes.js` | + /artisan/:id/tags route |
| `kalasetu-backend/routes/searchRoutes.js` | + /trending route |
| `kalasetu-backend/routes/availabilityRoutes.js` | + /:id/availability route |

### Phase Dependencies
```
Phase 1 (Design System) ──┬── Phase 2 (Homepage)
                          ├── Phase 3 (Search)
                          ├── Phase 4 (Artisan Profile) ── Phase 5 (Booking + Payment)
                          ├── Phase 6 (Booking Status)
                          ├── Phase 7 (Reviews)
                          ├── Phase 8 (Chat)
                          ├── Phase 9 (Artisan Dashboard)
                          ├── Phase 10 (User Dashboard)
                          └── Phase 11 (Global Polish)
```

Phases 2-11 all depend on Phase 1 but are largely independent of each other (can be built in any order after Phase 1). Exception: Phase 5 depends on Phase 4 (booking flow lives on artisan profile).
