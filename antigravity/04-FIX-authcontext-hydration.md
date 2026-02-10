# TASK: Fix AuthContext Hydration Issue

## Priority: CRITICAL

## Problem
AuthContext only renders children when `loading` is false, which can cause React hydration mismatches and component mounting issues.

## File to Fix
`kalasetu-frontend/src/context/AuthContext.jsx`

## Current Problematic Code (around line 198)
```jsx
return (
  <AuthContext.Provider value={{...}}>
    {/* Problem: Children only render after loading completes */}
    {!loading && children}
  </AuthContext.Provider>
);
```

## Why This Is Bad
1. Components don't mount until auth check completes
2. Can cause hydration mismatch in SSR scenarios
3. Components can't show their own loading states
4. Causes layout shift when content suddenly appears

## Solution

### Option A: Always render children, pass loading state (RECOMMENDED)

```jsx
return (
  <AuthContext.Provider
    value={{
      auth,
      user: auth.user,
      userType: auth.userType,
      isAuthenticated: !!auth.user,
      artisanLogin,
      artisanRegister,
      userLogin,
      userRegister,
      login,
      logout,
      checkAuth,
      loading  // Pass loading so components can handle it
    }}
  >
    {children}  {/* Always render children */}
  </AuthContext.Provider>
);
```

### Option B: Create a separate loading component

```jsx
// Create a wrapper that shows loading UI
function AuthLoadingWrapper({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  return children;
}

// In App.jsx, wrap routes with this
<AuthContextProvider>
  <AuthLoadingWrapper>
    <Routes>...</Routes>
  </AuthLoadingWrapper>
</AuthContextProvider>
```

## Steps

1. Read `kalasetu-frontend/src/context/AuthContext.jsx`
2. Modify the return statement to always render children
3. Update components that need to handle loading state to check `loading` from useAuth()
4. Optionally create a wrapper component for consistent loading UI

## Components That May Need Updates

After this change, these components should handle loading state:
- `RequireAuth.jsx` - Already has some handling, verify it works
- Any component that immediately uses `user` data on mount

## Example: Updating RequireAuth

```jsx
// kalasetu-frontend/src/components/RequireAuth.jsx
function RequireAuth({ children, role }) {
  const { isAuthenticated, userType, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userType !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

## Success Criteria
- No hydration warnings in console
- Components render immediately (may show loading state)
- Auth-protected routes still work correctly
- No flash of unauthenticated content

## Related Files
- `kalasetu-frontend/src/context/AuthContext.jsx` - Main fix
- `kalasetu-frontend/src/components/RequireAuth.jsx` - May need update
- `kalasetu-frontend/src/App.jsx` - Route setup
