# TASK: Create Reusable Empty State Component

## Priority: MEDIUM (UI Consistency)

## Problem
Empty states are inconsistent:
- Some just show text
- Some have no styling
- No illustrations or helpful actions
- Poor user experience when there's no data

## Create New File
`kalasetu-frontend/src/components/ui/EmptyState.jsx`

```jsx
/**
 * Reusable empty state component for when there's no data
 */

// Pre-built icons for common empty states
const icons = {
  search: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  bookings: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  messages: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  payments: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  reviews: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  services: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  users: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  folder: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

export default function EmptyState({
  icon = 'folder',
  title,
  description,
  action,
  actionText,
  secondaryAction,
  secondaryActionText,
  className = '',
  children,
}) {
  // Allow custom icon or use preset
  const IconComponent = typeof icon === 'string' ? icons[icon] : icon;

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        text-center py-12 px-4
        ${className}
      `}
    >
      {/* Icon */}
      <div className="text-gray-300 mb-6">
        {IconComponent}
      </div>

      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-gray-500 max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Custom children */}
      {children}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action && (
            <button
              onClick={action}
              className="px-4 py-2 bg-brand-500 text-white rounded-button font-medium hover:bg-brand-600 transition-colors"
            >
              {actionText || 'Take Action'}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-button font-medium hover:bg-gray-50 transition-colors"
            >
              {secondaryActionText || 'Learn More'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Convenience variants for common use cases
export function NoSearchResults({ query, onClear }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description={query ? `No artisans match "${query}". Try different keywords or filters.` : 'Try searching for artisans by name, skill, or location.'}
      action={onClear}
      actionText="Clear search"
    />
  );
}

export function NoBookings({ userType = 'user', onBrowse }) {
  const isArtisan = userType === 'artisan';

  return (
    <EmptyState
      icon="bookings"
      title={isArtisan ? "No bookings yet" : "No bookings yet"}
      description={
        isArtisan
          ? "When customers book your services, they'll appear here."
          : "Browse our talented artisans and book your first service."
      }
      action={isArtisan ? undefined : onBrowse}
      actionText={isArtisan ? undefined : "Browse Artisans"}
    />
  );
}

export function NoMessages({ onStartChat }) {
  return (
    <EmptyState
      icon="messages"
      title="No messages yet"
      description="Start a conversation by booking a service or contacting an artisan."
      action={onStartChat}
      actionText="Browse Artisans"
    />
  );
}

export function NoReviews({ isOwner }) {
  return (
    <EmptyState
      icon="reviews"
      title="No reviews yet"
      description={
        isOwner
          ? "Complete bookings to receive reviews from your customers."
          : "Be the first to leave a review after your booking."
      }
    />
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon="error"
      title="Something went wrong"
      description={message || "We couldn't load this content. Please try again."}
      action={onRetry}
      actionText="Try Again"
    />
  );
}
```

## Update UI Index
`kalasetu-frontend/src/components/ui/index.js`

```javascript
// Add to existing exports
export {
  default as EmptyState,
  NoSearchResults,
  NoBookings,
  NoMessages,
  NoReviews,
  ErrorState,
} from './EmptyState';
```

## Usage Examples

### Basic Empty State
```jsx
import { EmptyState } from '../components/ui';

<EmptyState
  icon="services"
  title="No services added"
  description="Add services to let customers know what you offer."
  action={() => setShowAddService(true)}
  actionText="Add Service"
/>
```

### Search Results Empty State
```jsx
import { NoSearchResults } from '../components/ui';

if (results.length === 0) {
  return (
    <NoSearchResults
      query={searchQuery}
      onClear={() => setSearchQuery('')}
    />
  );
}
```

### Bookings Empty State
```jsx
import { NoBookings } from '../components/ui';

if (bookings.length === 0) {
  return (
    <NoBookings
      userType={auth.userType}
      onBrowse={() => navigate('/search')}
    />
  );
}
```

### Error State
```jsx
import { ErrorState } from '../components/ui';

if (error) {
  return (
    <ErrorState
      message={error.message}
      onRetry={() => fetchData()}
    />
  );
}
```

### Custom Icon
```jsx
<EmptyState
  icon={<MyCustomIcon className="w-16 h-16" />}
  title="Custom Empty State"
  description="You can pass any React element as the icon."
/>
```

## Files to Update

Replace current empty states in:
1. `SearchResults.jsx` - No search results
2. `BookingsTab.jsx` - No bookings
3. `MessagesPage.jsx` - No messages
4. `ReviewsTab.jsx` - No reviews
5. `EarningsTab.jsx` - No earnings
6. `OrderHistoryTab.jsx` - No orders

## Steps

1. Create `EmptyState.jsx`
2. Update `index.js` exports
3. Test each preset (NoSearchResults, NoBookings, etc.)
4. Migrate one component (start with SearchResults)
5. Gradually migrate others

## Success Criteria
- Consistent empty states across app
- Icons are relevant to context
- Actions are helpful
- Messages are user-friendly
- At least 3 components migrated
