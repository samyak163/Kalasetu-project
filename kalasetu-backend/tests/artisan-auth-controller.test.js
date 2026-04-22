import { describe, it, expect, vi } from 'vitest';
import Artisan from '../models/artisanModel.js';
import { register } from '../controllers/authController.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/email.js';
import { createNotifications } from '../utils/notificationService.js';

vi.mock('../utils/algolia.js', () => ({
  indexArtisan: vi.fn(() => Promise.resolve()),
}));

vi.mock('../utils/email.js', () => ({
  sendWelcomeEmail: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  sendVerificationEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock('../utils/notificationService.js', () => ({
  createNotifications: vi.fn(() => Promise.resolve()),
}));

vi.mock('../utils/posthog.js', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

const mockResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    cookies: {},
    status(code) {
      res.statusCode = code;
      return res;
    },
    cookie(name, value, options) {
      res.cookies[name] = { value, options };
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
};

describe('artisan auth controller', () => {
  it('registers an artisan without requiring email verification', async () => {
    const req = {
      body: {
        fullName: 'New Artisan',
        email: 'new-artisan@example.com',
        password: 'Password123',
      },
    };
    const res = mockResponse();
    const next = vi.fn();

    await register(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.cookies.ks_auth).toBeDefined();

    const artisan = await Artisan.findOne({ email: 'new-artisan@example.com' })
      .select('+emailVerificationToken +emailVerificationExpires')
      .lean();

    expect(artisan.emailVerified).toBe(true);
    expect(artisan.emailVerificationToken).toBeUndefined();
    expect(artisan.emailVerificationExpires).toBeUndefined();
    expect(sendWelcomeEmail).toHaveBeenCalledWith('new-artisan@example.com', 'New Artisan');
    expect(sendVerificationEmail).not.toHaveBeenCalled();

    const notifications = createNotifications.mock.calls[0][2];
    expect(notifications.some((notification) => /verify/i.test(`${notification.title} ${notification.text}`))).toBe(false);
  });
});
