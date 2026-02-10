# TASK: Add Error Boundaries

## Priority: MEDIUM (Error Handling)

## Problem
The app has no error boundaries. If any component throws an error, the entire app crashes with a white screen.

## What is an Error Boundary?

An Error Boundary is a React component that:
- Catches JavaScript errors in child components
- Logs the error
- Displays a fallback UI instead of crashing

## Create Error Boundary Component

`kalasetu-frontend/src/components/ErrorBoundary.jsx`

```jsx
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in development
    console.error('Error caught by boundary:', error, errorInfo);

    // Store error info for display
    this.setState({ errorInfo });

    // Log to Sentry in production
    if (import.meta.env.PROD) {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo?.componentStack,
          ...this.props.context,
        },
      });
    }

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              resetError: this.handleReset,
            })
          : this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {this.props.title || 'Something went wrong'}
          </h2>

          <p className="text-gray-500 mb-6 max-w-md">
            {this.props.message || "We're sorry, but something unexpected happened. Please try again."}
          </p>

          {/* Show error details in development */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mb-4 text-left w-full max-w-lg">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details (development only)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  onReset: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  context: PropTypes.object, // Extra context for Sentry
};

export default ErrorBoundary;
```

## Create Page-Level Error Boundary

`kalasetu-frontend/src/components/PageErrorBoundary.jsx`

```jsx
import ErrorBoundary from './ErrorBoundary';
import { useNavigate } from 'react-router-dom';

/**
 * Page-level error boundary with navigation
 */
export default function PageErrorBoundary({ children, pageName }) {
  const navigate = useNavigate();

  const handleReset = () => {
    // Navigate to home on reset
    navigate('/');
  };

  return (
    <ErrorBoundary
      onReset={handleReset}
      context={{ page: pageName }}
      title="Page Error"
      message="This page encountered an error. You can try again or go back to the home page."
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Update App.jsx to Use Error Boundaries

`kalasetu-frontend/src/App.jsx`

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      title="Application Error"
      message="The application encountered an unexpected error. Please refresh the page."
    >
      <AuthContextProvider>
        <NotificationContextProvider>
          {/* ... rest of providers and routes */}
        </NotificationContextProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  );
}
```

## Wrap Critical Sections

Wrap sections that might fail independently:

```jsx
// In a dashboard page
import ErrorBoundary from '../components/ErrorBoundary';

function ArtisanDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats section - if it fails, show fallback */}
      <ErrorBoundary
        fallback={
          <div className="col-span-full p-4 bg-red-50 text-red-700 rounded-lg">
            Unable to load stats. <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        }
      >
        <DashboardStats />
      </ErrorBoundary>

      {/* Bookings section */}
      <ErrorBoundary>
        <RecentBookings />
      </ErrorBoundary>

      {/* Reviews section */}
      <ErrorBoundary>
        <RecentReviews />
      </ErrorBoundary>
    </div>
  );
}
```

## Using with Routes

Wrap route components:

```jsx
// In App.jsx routes
<Route
  path="/artisan/dashboard"
  element={
    <ErrorBoundary context={{ page: 'artisan-dashboard' }}>
      <RequireAuth role="artisan">
        <ArtisanDashboardPage />
      </RequireAuth>
    </ErrorBoundary>
  }
/>
```

## Custom Fallback Function

For more control over the fallback:

```jsx
<ErrorBoundary
  fallback={({ error, resetError }) => (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <h3 className="font-bold text-red-700">Error in Chat</h3>
      <p className="text-red-600 text-sm">{error.message}</p>
      <button
        onClick={resetError}
        className="mt-2 text-sm text-red-700 underline"
      >
        Retry
      </button>
    </div>
  )}
>
  <ChatInterface />
</ErrorBoundary>
```

## Files to Add Error Boundaries

Priority:
1. `App.jsx` - Top-level (catches everything)
2. Routes in App.jsx - Per-page boundaries
3. `MessagesPage.jsx` - Chat can fail
4. `VideoCallPage.jsx` - Video can fail
5. `PaymentsPage.jsx` - Payments are critical
6. Dashboard sections - Independent failure

## Steps

1. Create `ErrorBoundary.jsx`
2. Create `PageErrorBoundary.jsx` (optional)
3. Add top-level boundary to App.jsx
4. Add boundaries to critical pages
5. Test by intentionally throwing an error
6. Verify Sentry receives errors (in production)

## Testing Error Boundaries

Temporarily add this to test:

```jsx
function BuggyComponent() {
  throw new Error('Test error!');
  return <div>This won't render</div>;
}

// Then use it:
<ErrorBoundary>
  <BuggyComponent />
</ErrorBoundary>
```

## Success Criteria
- App no longer shows white screen on errors
- Error fallback UI is user-friendly
- "Try Again" button works
- Errors logged to Sentry in production
- Development shows error details
- At least 5 error boundaries added
