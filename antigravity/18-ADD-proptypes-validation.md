# TASK: Add PropTypes Validation

## Priority: MEDIUM (Code Quality)

## Problem
Most components don't have PropTypes validation, making it hard to:
- Know what props a component expects
- Catch bugs from wrong prop types
- Document component APIs

## Install PropTypes (if not installed)

```bash
cd kalasetu-frontend
npm install prop-types
```

Note: PropTypes is already in package.json, so it should be installed.

## Files to Update

### Priority Components (User-facing)

#### 1. Button.jsx (if you created it in Task 08)
```jsx
import PropTypes from 'prop-types';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  className: '',
  type: 'button',
};
```

#### 2. Card.jsx (if you created it in Task 09)
```jsx
import PropTypes from 'prop-types';

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'bordered', 'elevated', 'interactive', 'ghost']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  hover: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
};
```

#### 3. SearchBar.jsx
`kalasetu-frontend/src/components/SearchBar.jsx`

```jsx
import PropTypes from 'prop-types';

// Add at the end of the file
SearchBar.propTypes = {
  className: PropTypes.string,
  showLocationSearch: PropTypes.bool,
  userLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    address: PropTypes.string,
    city: PropTypes.string,
  }),
  onSearch: PropTypes.func,
};

SearchBar.defaultProps = {
  className: '',
  showLocationSearch: true,
  userLocation: null,
};
```

#### 4. ArtisanSearch.jsx
```jsx
import PropTypes from 'prop-types';

ArtisanSearch.propTypes = {
  onResultClick: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

ArtisanSearch.defaultProps = {
  placeholder: 'Search artisans...',
  className: '',
};
```

#### 5. ProfileDropdown.jsx
`kalasetu-frontend/src/components/common/ProfileDropdown.jsx`

```jsx
import PropTypes from 'prop-types';

ProfileDropdown.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    fullName: PropTypes.string,
    email: PropTypes.string,
    profilePhoto: PropTypes.string,
  }).isRequired,
  userType: PropTypes.oneOf(['artisan', 'user']).isRequired,
  onLogout: PropTypes.func.isRequired,
  onOpenProfile: PropTypes.func,
};
```

#### 6. ImageUpload.jsx
```jsx
import PropTypes from 'prop-types';

ImageUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
  folder: PropTypes.string,
  maxSize: PropTypes.number, // in bytes
  accept: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

ImageUpload.defaultProps = {
  folder: 'uploads',
  maxSize: 5 * 1024 * 1024, // 5MB
  accept: 'image/*',
  className: '',
};
```

#### 7. PaymentButton.jsx
```jsx
import PropTypes from 'prop-types';

PaymentButton.propTypes = {
  amount: PropTypes.number.isRequired,
  recipientId: PropTypes.string.isRequired,
  bookingId: PropTypes.string,
  purpose: PropTypes.oneOf(['booking', 'tip', 'other']),
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

PaymentButton.defaultProps = {
  purpose: 'booking',
  disabled: false,
  className: '',
};
```

#### 8. Modal.jsx (if created in Task 10)
```jsx
import PropTypes from 'prop-types';

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Modal.defaultProps = {
  size: 'md',
  closeOnOverlayClick: true,
  closeOnEscape: true,
  className: '',
};
```

### Page Components

#### 9. SearchResults.jsx - Internal Components

```jsx
// For LoadingState component (around line 261)
LoadingState.propTypes = {
  mode: PropTypes.oneOf(['artisans', 'services']),
};

// For ResultsView component (around line 281)
ResultsView.propTypes = {
  mode: PropTypes.oneOf(['artisans', 'services']).isRequired,
  artisans: PropTypes.arrayOf(PropTypes.object),
  services: PropTypes.arrayOf(PropTypes.object),
  onArtisanClick: PropTypes.func.isRequired,
  onServiceClick: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  onChat: PropTypes.func.isRequired,
};

// For ArtisanCard component (around line 341)
ArtisanCard.propTypes = {
  artisan: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    publicId: PropTypes.string,
    profilePhoto: PropTypes.string,
    bio: PropTypes.string,
    rating: PropTypes.number,
    totalReviews: PropTypes.number,
    portfolioImages: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  onChat: PropTypes.func.isRequired,
};
```

## Common PropTypes Patterns

```jsx
import PropTypes from 'prop-types';

// Required string
PropTypes.string.isRequired

// Optional string
PropTypes.string

// One of specific values
PropTypes.oneOf(['small', 'medium', 'large'])

// Object with specific shape
PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
})

// Array of objects
PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
}))

// Function
PropTypes.func

// Boolean
PropTypes.bool

// Number
PropTypes.number

// Any renderable content
PropTypes.node

// React element
PropTypes.element

// Instance of a class
PropTypes.instanceOf(Date)

// Custom validation
PropTypes.custom((props, propName, componentName) => {
  if (props[propName] < 0) {
    return new Error(`${propName} must be positive`);
  }
})
```

## Steps

1. Open each component file
2. Import PropTypes at the top
3. Add .propTypes object after component definition
4. Add .defaultProps for optional props with defaults
5. Test that no PropTypes warnings appear in console

## Search for Components Without PropTypes

```bash
# Find components that might need PropTypes
grep -L "PropTypes" kalasetu-frontend/src/components/*.jsx
grep -L "PropTypes" kalasetu-frontend/src/components/**/*.jsx
```

## Success Criteria
- No PropTypes warnings in development console
- At least 10 key components have PropTypes
- Components document their expected props
- Default values provided where sensible
