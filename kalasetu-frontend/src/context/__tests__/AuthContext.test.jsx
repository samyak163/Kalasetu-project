import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthContextProvider, useAuth } from '../AuthContext.jsx';

// Mock all external dependencies
vi.mock('../../lib/axios.js', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
    setCsrfToken: vi.fn(),
  };
});

vi.mock('../../lib/sentry.js', () => ({
  setSentryUser: vi.fn(),
  clearSentryUser: vi.fn(),
  default: {},
}));

vi.mock('../../lib/logrocket.js', () => ({
  identifyLogRocketUser: vi.fn(),
  addLogRocketTag: vi.fn(),
  default: {},
}));

vi.mock('../../lib/posthog.js', () => ({
  identifyPostHogUser: vi.fn(),
  resetPostHog: vi.fn(),
  default: {},
}));

vi.mock('../../lib/onesignal.js', () => ({
  setOneSignalUserId: vi.fn(),
  removeOneSignalUserId: vi.fn().mockResolvedValue(undefined),
  addTags: vi.fn(),
  default: {},
}));

import api, { setCsrfToken } from '../../lib/axios.js';
import { setSentryUser, clearSentryUser } from '../../lib/sentry.js';

// Test helper component that displays auth state
const AuthConsumer = () => {
  const { user, userType, isAuthenticated, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <span data-testid="userType">{userType || 'null'}</span>
      <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
    </div>
  );
};

// Test helper that exposes login/logout functions
const AuthActions = () => {
  const { login, logout, artisanLogin, userLogin, user, userType, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <span data-testid="userType">{userType || 'null'}</span>
      <button data-testid="login-btn" onClick={() => login({ _id: '123', email: 'test@test.com' }, 'user')}>
        Login
      </button>
      <button data-testid="artisan-login-btn" onClick={() => artisanLogin({ email: 'a@test.com', password: '1234' }).catch(() => {})}>
        Artisan Login
      </button>
      <button data-testid="user-login-btn" onClick={() => userLogin({ email: 'u@test.com', password: '1234' }).catch(() => {})}>
        User Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: both /me endpoints reject (logged out state)
    api.get.mockRejectedValue(new Error('Not authenticated'));
    // Prevent window.location.href assignment from throwing in jsdom
    delete window.location;
    window.location = { href: '' };
  });

  describe('initial state', () => {
    it('starts with user as null and userType as null after bootstrap fails', async () => {
      render(
        <AuthContextProvider>
          <AuthConsumer />
        </AuthContextProvider>
      );

      // Wait for bootstrap to complete (loading becomes false)
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('userType').textContent).toBe('null');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    });

    it('shows loading true during bootstrap', () => {
      // Make the API call hang so loading stays true
      api.get.mockReturnValue(new Promise(() => {}));

      render(
        <AuthContextProvider>
          <AuthConsumer />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('loading').textContent).toBe('true');
    });
  });

  describe('AuthProvider', () => {
    it('renders children correctly', async () => {
      render(
        <AuthContextProvider>
          <div data-testid="child">Hello</div>
        </AuthContextProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByTestId('child').textContent).toBe('Hello');
    });
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthContextProvider', () => {
      // Suppress console.error for the expected React error boundary output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<AuthConsumer />);
      }).toThrow('useAuth must be used within AuthContextProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('bootstrap auth', () => {
    it('sets user as "user" type when /api/users/me succeeds', async () => {
      const mockUser = { _id: 'u1', email: 'user@test.com', fullName: 'Test User' };
      api.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <AuthContextProvider>
          <AuthConsumer />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('userType').textContent).toBe('user');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(api.get).toHaveBeenCalledWith('/api/users/me');
    });

    it('falls back to artisan when /api/users/me fails but /api/auth/me succeeds', async () => {
      const mockArtisan = { _id: 'a1', email: 'artisan@test.com', fullName: 'Test Artisan' };
      // First call (users/me) fails
      api.get.mockRejectedValueOnce(new Error('Not a user'));
      // Second call (auth/me) succeeds
      api.get.mockResolvedValueOnce({ data: mockArtisan });

      render(
        <AuthContextProvider>
          <AuthConsumer />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('userType').textContent).toBe('artisan');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(api.get).toHaveBeenCalledWith('/api/auth/me');
    });

    it('remains logged out when both /me endpoints fail', async () => {
      api.get.mockRejectedValueOnce(new Error('Not a user'));
      api.get.mockRejectedValueOnce(new Error('Not an artisan'));

      render(
        <AuthContextProvider>
          <AuthConsumer />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('userType').textContent).toBe('null');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(clearSentryUser).toHaveBeenCalled();
    });

    it('sets CSRF token from user response when available', async () => {
      const mockUser = { _id: 'u1', email: 'user@test.com', csrfToken: 'csrf-token-123' };
      api.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <AuthContextProvider>
          <AuthConsumer />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(setCsrfToken).toHaveBeenCalledWith('csrf-token-123');
    });
  });

  describe('login function', () => {
    it('sets user and userType when login is called directly', async () => {
      render(
        <AuthContextProvider>
          <AuthActions />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      expect(screen.getByTestId('userType').textContent).toBe('user');
      expect(screen.getByTestId('user').textContent).toContain('123');
      expect(setSentryUser).toHaveBeenCalled();
    });
  });

  describe('artisanLogin', () => {
    it('calls /api/auth/login and sets artisan auth state', async () => {
      const mockArtisan = { _id: 'a1', email: 'a@test.com', fullName: 'Artisan' };
      api.post.mockResolvedValueOnce({ data: mockArtisan });

      render(
        <AuthContextProvider>
          <AuthActions />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByTestId('artisan-login-btn').click();
      });

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', { email: 'a@test.com', password: '1234' });
      expect(screen.getByTestId('userType').textContent).toBe('artisan');
    });

    it('clears auth state on login failure', async () => {
      api.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      render(
        <AuthContextProvider>
          <AuthActions />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        try {
          screen.getByTestId('artisan-login-btn').click();
        } catch {
          // Expected rejection
        }
      });

      // After failed login, auth should be cleared
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null');
      });
      expect(clearSentryUser).toHaveBeenCalled();
    });
  });

  describe('userLogin', () => {
    it('calls /api/users/login and sets user auth state', async () => {
      const mockUser = { _id: 'u1', email: 'u@test.com', fullName: 'User' };
      api.post.mockResolvedValueOnce({ data: mockUser });

      render(
        <AuthContextProvider>
          <AuthActions />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByTestId('user-login-btn').click();
      });

      expect(api.post).toHaveBeenCalledWith('/api/users/login', { email: 'u@test.com', password: '1234' });
      expect(screen.getByTestId('userType').textContent).toBe('user');
    });
  });

  describe('logout', () => {
    it('calls correct logout endpoint for user type and clears state', async () => {
      // Bootstrap as a user
      const mockUser = { _id: 'u1', email: 'user@test.com', fullName: 'User' };
      api.get.mockResolvedValueOnce({ data: mockUser });
      api.post.mockResolvedValueOnce({}); // logout endpoint

      render(
        <AuthContextProvider>
          <AuthActions />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
        expect(screen.getByTestId('userType').textContent).toBe('user');
      });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      expect(api.post).toHaveBeenCalledWith('/api/users/logout');
      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('userType').textContent).toBe('null');
    });

    it('calls artisan logout endpoint when logged in as artisan', async () => {
      // Bootstrap as artisan
      api.get.mockRejectedValueOnce(new Error('Not a user'));
      const mockArtisan = { _id: 'a1', email: 'artisan@test.com', fullName: 'Artisan' };
      api.get.mockResolvedValueOnce({ data: mockArtisan });
      api.post.mockResolvedValueOnce({});

      render(
        <AuthContextProvider>
          <AuthActions />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
        expect(screen.getByTestId('userType').textContent).toBe('artisan');
      });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
    });
  });
});
