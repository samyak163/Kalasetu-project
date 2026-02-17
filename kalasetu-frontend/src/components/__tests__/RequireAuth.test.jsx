import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('@sentry/react', () => ({ init: vi.fn(), setUser: vi.fn(), withScope: vi.fn(), captureException: vi.fn(), captureMessage: vi.fn(), browserTracingIntegration: vi.fn(), replayIntegration: vi.fn() }));
vi.mock('logrocket', () => ({ default: { init: vi.fn(), identify: vi.fn(), track: vi.fn(), addTag: vi.fn(), captureException: vi.fn(), getSessionURL: vi.fn() } }));
vi.mock('logrocket-react', () => ({ default: vi.fn() }));
vi.mock('posthog-js', () => ({ default: { init: vi.fn(), identify: vi.fn(), reset: vi.fn(), capture: vi.fn(), people: { set: vi.fn() }, isFeatureEnabled: vi.fn(), getFeatureFlagPayload: vi.fn(), getFeatureFlag: vi.fn() } }));
vi.mock('react-onesignal', () => ({ default: { init: vi.fn(), setExternalUserId: vi.fn(), removeExternalUserId: vi.fn(), sendTags: vi.fn() } }));
vi.mock('axios', () => ({ default: { create: vi.fn(() => ({ get: vi.fn(), post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } })) } }));

import RequireAuth from '../RequireAuth.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';

afterEach(() => { cleanup(); });

// Render helper using proper Routes structure so Navigate resolves correctly
const renderWithAuth = (authValue, { role, initialRoute = '/protected' } = {}) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth role={role}>
                <div>Protected Content</div>
              </RequireAuth>
            }
          />
          <Route path="/user/login" element={<div>User Login Page</div>} />
          <Route path="/artisan/login" element={<div>Artisan Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('RequireAuth', () => {
  describe('loading state', () => {
    it('shows loading indicator while auth is being checked', () => {
      renderWithAuth({ auth: { user: null, userType: null }, loading: true });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('authenticated access', () => {
    it('renders children when user is authenticated with no role requirement', () => {
      renderWithAuth({ auth: { user: { _id: '1' }, userType: 'user' }, loading: false });
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children when user has correct role', () => {
      renderWithAuth(
        { auth: { user: { _id: '1' }, userType: 'user' }, loading: false },
        { role: 'user' }
      );
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children when artisan has correct role', () => {
      renderWithAuth(
        { auth: { user: { _id: '1' }, userType: 'artisan' }, loading: false },
        { role: 'artisan' }
      );
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('unauthenticated redirects', () => {
    it('redirects to /user/login when not authenticated and no role specified', () => {
      renderWithAuth({ auth: { user: null, userType: null }, loading: false });
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('User Login Page')).toBeInTheDocument();
    });

    it('redirects to /artisan/login when not authenticated and role is artisan', () => {
      renderWithAuth(
        { auth: { user: null, userType: null }, loading: false },
        { role: 'artisan' }
      );
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Artisan Login Page')).toBeInTheDocument();
    });

    it('redirects to /user/login when not authenticated and role is user', () => {
      renderWithAuth(
        { auth: { user: null, userType: null }, loading: false },
        { role: 'user' }
      );
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('User Login Page')).toBeInTheDocument();
    });
  });

  describe('wrong role redirects', () => {
    it('redirects to home when artisan tries to access user-only route', () => {
      renderWithAuth(
        { auth: { user: { _id: '1' }, userType: 'artisan' }, loading: false },
        { role: 'user' }
      );
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('redirects to home when user tries to access artisan-only route', () => {
      renderWithAuth(
        { auth: { user: { _id: '1' }, userType: 'user' }, loading: false },
        { role: 'artisan' }
      );
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  describe('no role specified', () => {
    it('allows any authenticated user type', () => {
      renderWithAuth({ auth: { user: { _id: '1' }, userType: 'artisan' }, loading: false });
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
