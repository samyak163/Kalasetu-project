# TASK: Create Reusable Card Component

## Priority: HIGH (UI Foundation)

## Problem
Card styling is repeated across many components with slight variations. Need a consistent card component.

## Create New File
`kalasetu-frontend/src/components/ui/Card.jsx`

## Implementation

```jsx
import { forwardRef } from 'react';

/**
 * Reusable Card component
 *
 * @param {string} variant - 'default' | 'bordered' | 'elevated' | 'interactive'
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {boolean} hover - Adds hover effect
 */

const variants = {
  default: 'bg-white border border-gray-200',
  bordered: 'bg-white border-2 border-gray-200',
  elevated: 'bg-white shadow-card',
  interactive: 'bg-white border border-gray-200 hover:shadow-card-hover hover:border-gray-300 cursor-pointer transition-all duration-200',
  ghost: 'bg-gray-50 border border-transparent',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card = forwardRef(function Card(
  {
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    children,
    onClick,
    ...props
  },
  ref
) {
  const isInteractive = variant === 'interactive' || onClick;

  return (
    <div
      ref={ref}
      className={`
        rounded-card
        ${variants[variant]}
        ${paddings[padding]}
        ${hover && variant !== 'interactive' ? 'hover:shadow-card-hover transition-shadow duration-200' : ''}
        ${isInteractive ? 'cursor-pointer' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

// Card subcomponents for consistent structure
function CardHeader({ className = '', children, ...props }) {
  return (
    <div
      className={`border-b border-gray-100 pb-4 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ as: Component = 'h3', className = '', children, ...props }) {
  return (
    <Component
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

function CardContent({ className = '', children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={`border-t border-gray-100 pt-4 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Attach subcomponents
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
```

## Update Index File
`kalasetu-frontend/src/components/ui/index.js`

```javascript
export { default as Button, Spinner } from './Button';
export { default as Card } from './Card';
```

## Usage Examples

### Basic Card
```jsx
import { Card } from '../components/ui';

<Card>
  <p>Simple card content</p>
</Card>
```

### Card with Sections
```jsx
<Card padding="lg">
  <Card.Header>
    <Card.Title>Booking Details</Card.Title>
    <Card.Description>View your upcoming appointment</Card.Description>
  </Card.Header>

  <Card.Content>
    <p>Service: Pottery Workshop</p>
    <p>Date: January 25, 2026</p>
  </Card.Content>

  <Card.Footer>
    <Button>Confirm Booking</Button>
  </Card.Footer>
</Card>
```

### Interactive Card (clickable)
```jsx
<Card variant="interactive" onClick={() => navigate(`/artisan/${id}`)}>
  <img src={photo} alt={name} className="rounded-lg mb-4" />
  <h3 className="font-semibold">{name}</h3>
  <p className="text-gray-500">{category}</p>
</Card>
```

### Elevated Card
```jsx
<Card variant="elevated" padding="lg">
  <h2 className="text-xl font-bold">Dashboard Stats</h2>
  {/* Stats content */}
</Card>
```

### Card with Hover Effect
```jsx
<Card hover>
  <p>This card lifts on hover</p>
</Card>
```

## Migration Examples

### Before (Artisan Card in SearchResults.jsx):
```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
  {/* content */}
</div>
```

### After:
```jsx
<Card variant="elevated" padding="lg" hover>
  {/* content */}
</Card>
```

### Before (Stats Card in Dashboard):
```jsx
<div className="bg-white rounded-lg border p-4">
  <h3 className="text-lg font-semibold">Active Bookings</h3>
  <p className="text-3xl font-bold">{count}</p>
</div>
```

### After:
```jsx
<Card>
  <Card.Title>Active Bookings</Card.Title>
  <p className="text-3xl font-bold mt-2">{count}</p>
</Card>
```

## Files to Migrate

Priority files:
1. `SearchResults.jsx` - Artisan cards, Service cards
2. `DashboardOverviewTab.jsx` - Stats cards
3. `EarningsTab.jsx` - Earnings cards
4. `BookingsTab.jsx` - Booking cards

## Steps

1. Create `Card.jsx` in `src/components/ui/`
2. Update `index.js` to export Card
3. Test basic usage
4. Migrate one component (e.g., DashboardOverviewTab stats cards)
5. Gradually migrate other components

## Dependencies

Requires Task 07 (Tailwind design tokens) for:
- `rounded-card`
- `shadow-card`
- `shadow-card-hover`

Fallback if not set up:
```jsx
const variants = {
  default: 'bg-white border border-gray-200 rounded-xl',
  elevated: 'bg-white shadow-sm rounded-xl',
  // ...
};
```

## Success Criteria
- Card component renders correctly
- All variants work
- Subcomponents (Header, Title, etc.) work
- Hover effect works
- At least one component migrated
