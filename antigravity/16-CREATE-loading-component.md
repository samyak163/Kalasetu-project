# TASK: Create Reusable Loading Components

## Priority: MEDIUM (UI Consistency)

## Problem
Loading states are implemented inconsistently:
- Some use spinner
- Some use "Loading..." text
- Some use skeleton
- No consistent sizing or styling

## Create New Files

### 1. Spinner Component
`kalasetu-frontend/src/components/ui/Spinner.jsx`

```jsx
/**
 * Loading spinner with customizable size and color
 */
export default function Spinner({
  size = 'md',
  color = 'brand',
  className = ''
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colors = {
    brand: 'border-brand-500',
    white: 'border-white',
    gray: 'border-gray-500',
    current: 'border-current',
  };

  return (
    <div
      className={`
        animate-spin rounded-full
        border-2 border-t-transparent
        ${sizes[size]}
        ${colors[color]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

### 2. Loading State Component
`kalasetu-frontend/src/components/ui/LoadingState.jsx`

```jsx
import Spinner from './Spinner';

/**
 * Full loading state with optional message
 */
export default function LoadingState({
  message = 'Loading...',
  size = 'lg',
  fullScreen = false,
  className = '',
}) {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50'
    : '';

  return (
    <div
      className={`
        flex flex-col items-center justify-center py-12
        ${containerClass}
        ${className}
      `}
    >
      <Spinner size={size} />
      {message && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
```

### 3. Skeleton Components
`kalasetu-frontend/src/components/ui/Skeleton.jsx`

```jsx
/**
 * Skeleton loading placeholder
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`
        bg-gray-200 rounded animate-pulse
        ${className}
      `}
      {...props}
    />
  );
}

/**
 * Text skeleton - for text placeholders
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <Skeleton className={`rounded-full ${sizes[size]} ${className}`} />
  );
}

/**
 * Card skeleton - for card placeholders
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-card border p-4 ${className}`}>
      <div className="flex gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Skeleton className="h-9 w-24 rounded-button" />
        <Skeleton className="h-9 w-24 rounded-button" />
      </div>
    </div>
  );
}

/**
 * Table row skeleton
 */
export function SkeletonTableRow({ columns = 4, className = '' }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
```

### 4. Update UI Index
`kalasetu-frontend/src/components/ui/index.js`

```javascript
export { default as Button, Spinner as ButtonSpinner } from './Button';
export { default as Card } from './Card';
export { default as Modal } from './Modal';
export { default as Spinner } from './Spinner';
export { default as LoadingState } from './LoadingState';
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
} from './Skeleton';
```

## Usage Examples

### Simple Spinner
```jsx
import { Spinner } from '../components/ui';

{loading && <Spinner />}
```

### Full Page Loading
```jsx
import { LoadingState } from '../components/ui';

if (loading) {
  return <LoadingState message="Loading your bookings..." />;
}
```

### Skeleton for Cards
```jsx
import { SkeletonCard } from '../components/ui';

if (loading) {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
```

### Skeleton for Search Results
```jsx
import { SkeletonCard } from '../components/ui';

function SearchResultsSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
```

### Button with Loading
```jsx
import { Button } from '../components/ui';

<Button loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

## Files to Update

After creating these components, update:

1. `SearchResults.jsx` - Use SkeletonCard for loading
2. `BookingsTab.jsx` - Use LoadingState
3. `DashboardOverviewTab.jsx` - Use LoadingState
4. `EarningsTab.jsx` - Use LoadingState
5. `OrderHistoryTab.jsx` - Use LoadingState

### Example Migration

**Before:**
```jsx
if (loading) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
    </div>
  );
}
```

**After:**
```jsx
import { LoadingState } from '../components/ui';

if (loading) {
  return <LoadingState message="Loading bookings..." />;
}
```

## Steps

1. Create `Spinner.jsx`
2. Create `LoadingState.jsx`
3. Create `Skeleton.jsx`
4. Update `index.js` exports
5. Test each component
6. Migrate one existing component
7. Gradually migrate others

## Success Criteria
- Consistent loading indicators across app
- Spinner shows brand color
- Skeleton cards match real card layout
- LoadingState is accessible (aria-label)
- At least 3 components migrated
