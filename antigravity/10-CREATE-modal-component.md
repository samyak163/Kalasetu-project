# TASK: Create Reusable Modal Component

## Priority: HIGH (UI Foundation)

## Problem
Modal code is repeated across multiple files (ArtisanInfoModal, HowItWorksModal, BookServiceModal) with slightly different implementations.

## Create New File
`kalasetu-frontend/src/components/ui/Modal.jsx`

## Implementation

```jsx
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable Modal component with accessibility features
 *
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called when modal should close
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} closeOnOverlayClick - Close when clicking backdrop
 * @param {boolean} closeOnEscape - Close when pressing Escape
 */

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-4xl',
};

function Modal({
  isOpen,
  onClose,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  className = '',
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  const handleEscape = useCallback(
    (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousActiveElement.current = document.activeElement;

      // Focus the modal
      modalRef.current?.focus();

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Add escape listener
      document.addEventListener('keydown', handleEscape);

      return () => {
        // Restore body scroll
        document.body.style.overflow = '';

        // Remove escape listener
        document.removeEventListener('keydown', handleEscape);

        // Restore focus
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizes[size]}
          bg-white rounded-modal shadow-modal
          max-h-[90vh] overflow-hidden
          animate-scale-in
          ${className}
        `.replace(/\s+/g, ' ').trim()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// Modal subcomponents
function ModalHeader({ children, onClose, className = '' }) {
  return (
    <div className={`flex items-start justify-between p-6 border-b border-gray-100 ${className}`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ModalTitle({ children, className = '' }) {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

function ModalDescription({ children, className = '' }) {
  return (
    <p className={`mt-1 text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  );
}

function ModalBody({ children, className = '' }) {
  return (
    <div className={`p-6 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}

// Attach subcomponents
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
```

## Update Index File
`kalasetu-frontend/src/components/ui/index.js`

```javascript
export { default as Button, Spinner } from './Button';
export { default as Card } from './Card';
export { default as Modal } from './Modal';
```

## Usage Examples

### Basic Modal
```jsx
import { Modal, Button } from '../components/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header onClose={() => setIsOpen(false)}>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to proceed?</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

### Booking Modal (larger)
```jsx
<Modal isOpen={showBooking} onClose={() => setShowBooking(false)} size="lg">
  <Modal.Header onClose={() => setShowBooking(false)}>
    <Modal.Title>Book Service</Modal.Title>
    <Modal.Description>Select date and time for your appointment</Modal.Description>
  </Modal.Header>

  <Modal.Body>
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Date & Time</label>
        <input type="datetime-local" className="w-full rounded-input border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea className="w-full rounded-input border p-2" rows={3} />
      </div>
    </form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="ghost" onClick={() => setShowBooking(false)}>
      Cancel
    </Button>
    <Button loading={isSubmitting}>
      Confirm Booking
    </Button>
  </Modal.Footer>
</Modal>
```

## Migration Guide

### Before (ArtisanInfoModal.jsx style):
```jsx
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="relative max-w-xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 ...">
        <X />
      </button>
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-semibold">Title</h2>
      </div>
      <div className="px-6 py-5">
        {/* content */}
      </div>
      <div className="px-6 pb-6">
        <button className="...">Get Started</button>
      </div>
    </div>
  </div>
)}
```

### After:
```jsx
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  <Modal.Header onClose={onClose}>
    <Modal.Title>Title</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* content */}
  </Modal.Body>
  <Modal.Footer>
    <Button>Get Started</Button>
  </Modal.Footer>
</Modal>
```

## Files to Migrate

1. `ArtisanInfoModal.jsx`
2. `HowItWorksModal.jsx`
3. `BookServiceModal` in `SearchResults.jsx`
4. `ProfileModal.jsx`
5. Any confirmation dialogs

## Steps

1. Create `Modal.jsx` in `src/components/ui/`
2. Update `index.js` to export Modal
3. Test with a simple modal
4. Migrate `ArtisanInfoModal.jsx` first (simpler)
5. Migrate other modals

## Dependencies

Requires Task 07 (Tailwind design tokens) for:
- `rounded-modal`
- `shadow-modal`
- `animate-fade-in`
- `animate-scale-in`

## Success Criteria
- Modal opens/closes correctly
- Escape key closes modal
- Clicking backdrop closes modal
- Focus is trapped in modal
- Body scroll is locked
- Animations work
- Accessible (aria attributes)
