import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockUseAdminAuth = vi.fn();

vi.mock('../../../context/AdminAuthContext.jsx', () => ({
  useAdminAuth: () => mockUseAdminAuth(),
}));

import RequireAdminAuth from '../RequireAdminAuth.jsx';
import RedirectIfAdminAuth from '../RedirectIfAdminAuth.jsx';

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  mockUseAdminAuth.mockReset();
});

const renderProtectedRoute = (authValue, initialRoute = '/admin/dashboard') => {
  mockUseAdminAuth.mockReturnValue(authValue);

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/admin/login" element={<div>Admin Login Page</div>} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdminAuth>
              <div>Admin Dashboard</div>
            </RequireAdminAuth>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

const renderLoginRoute = (authValue, initialRoute = '/admin/login') => {
  mockUseAdminAuth.mockReturnValue(authValue);

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route
          path="/admin/login"
          element={
            <RedirectIfAdminAuth>
              <div>Admin Login Form</div>
            </RedirectIfAdminAuth>
          }
        />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Admin auth guards', () => {
  it('redirects unauthenticated admins to the login page', () => {
    renderProtectedRoute({ isAuthenticated: false, loading: false });

    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Login Page')).toBeInTheDocument();
  });

  it('renders protected admin content when authenticated', () => {
    renderProtectedRoute({ isAuthenticated: true, loading: false });

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('shows a loading state while admin auth is still being checked', () => {
    renderProtectedRoute({ isAuthenticated: false, loading: true });

    expect(screen.getByText('Checking admin access...')).toBeInTheDocument();
  });

  it('redirects authenticated admins away from the login page', () => {
    renderLoginRoute({ isAuthenticated: true, loading: false });

    expect(screen.queryByText('Admin Login Form')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders the admin login form when not authenticated', () => {
    renderLoginRoute({ isAuthenticated: false, loading: false });

    expect(screen.getByText('Admin Login Form')).toBeInTheDocument();
  });
});
