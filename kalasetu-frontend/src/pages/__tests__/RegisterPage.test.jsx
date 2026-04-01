import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage.jsx';
import { ToastContext } from '../../context/ToastContext.jsx';

const {
  artisanRegisterMock,
  axiosPostMock,
  loginMock,
  refreshNotificationsMock,
  navigateMock,
  showToastMock,
} = vi.hoisted(() => ({
  artisanRegisterMock: vi.fn(),
  axiosPostMock: vi.fn(),
  loginMock: vi.fn(),
  refreshNotificationsMock: vi.fn(),
  navigateMock: vi.fn(),
  showToastMock: vi.fn(),
}));

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    artisanRegister: artisanRegisterMock,
    login: loginMock,
  }),
}));

vi.mock('../../context/NotificationContext.jsx', () => ({
  useNotifications: () => ({
    refresh: refreshNotificationsMock,
  }),
}));

vi.mock('../../lib/sentry.js', () => ({
  captureException: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    post: axiosPostMock,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    artisanRegisterMock.mockResolvedValue({
      success: true,
      artisan: {
        _id: 'artisan-1',
        email: 'artisan@example.com',
        fullName: 'Test Artisan',
      },
      redirectTo: '/artisan/dashboard/account',
    });
    axiosPostMock.mockResolvedValue({
      data: {
        success: true,
        artisan: {
          _id: 'artisan-1',
          email: 'artisan@example.com',
          fullName: 'Test Artisan',
        },
        redirectTo: '/artisan/dashboard/account',
      },
    });
    refreshNotificationsMock.mockResolvedValue(undefined);
  });

  it('submits artisan registration through the auth context flow', async () => {
    render(
      <MemoryRouter>
        <ToastContext.Provider value={{ showToast: showToastMock }}>
          <RegisterPage />
        </ToastContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: '  Test Artisan  ' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'artisan@example.com ' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

    await waitFor(() => {
      expect(artisanRegisterMock).toHaveBeenCalledWith({
        fullName: 'Test Artisan',
        password: 'password123',
        email: 'artisan@example.com',
        phoneNumber: undefined,
      });
    });

    expect(axiosPostMock).not.toHaveBeenCalled();
  });
});
