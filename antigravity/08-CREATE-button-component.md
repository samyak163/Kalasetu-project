# TASK: Create Reusable Button Component

## Priority: HIGH (UI Foundation)

## Problem
Button styles are repeated 50+ times across the codebase with slight variations. This makes consistency impossible and changes tedious.

## Create New File
`kalasetu-frontend/src/components/ui/Button.jsx`

## Implementation

```jsx
import { forwardRef } from 'react';

/**
 * Reusable Button component with consistent styling
 *
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Shows spinner and disables button
 * @param {boolean} disabled - Disables button
 * @param {boolean} fullWidth - Makes button full width
 * @param {string} className - Additional classes
 */

const variants = {
  primary: `
    bg-brand-500 text-white
    hover:bg-brand-600
    focus:ring-brand-500
    shadow-button hover:shadow-button-hover
  `,
  secondary: `
    bg-white text-brand-500
    border-2 border-brand-500
    hover:bg-brand-50
    focus:ring-brand-500
  `,
  ghost: `
    bg-transparent text-gray-700
    hover:bg-gray-100
    focus:ring-gray-500
  `,
  danger: `
    bg-error-500 text-white
    hover:bg-error-600
    focus:ring-error-500
  `,
  'danger-ghost': `
    bg-transparent text-error-600
    hover:bg-error-50
    focus:ring-error-500
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

// Loading spinner component
function Spinner({ className = '' }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    children,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-button
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {loading && <Spinner className="-ml-1" />}
      {children}
    </button>
  );
});

export default Button;

// Also export Spinner for use elsewhere
export { Spinner };
```

## Also Create Index File for UI Components
`kalasetu-frontend/src/components/ui/index.js`

```javascript
export { default as Button, Spinner } from './Button';
// Future exports:
// export { default as Card } from './Card';
// export { default as Modal } from './Modal';
// export { default as Input } from './Input';
```

## Usage Examples

```jsx
import { Button } from '../components/ui';

// Primary (default)
<Button>Book Now</Button>

// With loading state
<Button loading>Processing...</Button>

// Secondary/outlined
<Button variant="secondary">Cancel</Button>

// Ghost/subtle
<Button variant="ghost" size="sm">Edit</Button>

// Danger
<Button variant="danger">Delete Account</Button>

// Full width
<Button fullWidth size="lg">Continue to Payment</Button>

// Disabled
<Button disabled>Not Available</Button>

// With icon
<Button>
  <PlusIcon className="w-4 h-4" />
  Add Service
</Button>
```

## Migration Guide

Find and replace common button patterns:

### Before:
```jsx
<button className="bg-[#A55233] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#8e462b] transition-colors">
  Book Now
</button>
```

### After:
```jsx
<Button>Book Now</Button>
```

### Before (outlined):
```jsx
<button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
  Cancel
</button>
```

### After:
```jsx
<Button variant="secondary">Cancel</Button>
```

## Files to Update (Examples)

Priority files to migrate:
1. `Header.jsx` - Sign Up button, location buttons
2. `SearchResults.jsx` - Book buttons, chat buttons
3. `PaymentButton.jsx` - Can use Button internally
4. Profile tabs - Save buttons, action buttons

## Steps

1. Create `kalasetu-frontend/src/components/ui/` folder
2. Create `Button.jsx` with the code above
3. Create `index.js` with exports
4. Test by importing and using in one component
5. Gradually migrate other components

## Dependencies

This task requires:
- Task 07 (Tailwind design tokens) - for `bg-brand-500`, `rounded-button`, etc.

If design tokens aren't set up yet, temporarily use:
```jsx
const variants = {
  primary: `
    bg-[#A55233] text-white
    hover:bg-[#8e462b]
    focus:ring-[#A55233]
  `,
  // ...
};
```

## Success Criteria
- Button component renders correctly
- All 4 variants work (primary, secondary, ghost, danger)
- Loading state shows spinner
- Disabled state works
- Active state has slight scale effect
- At least one existing component migrated to use Button
