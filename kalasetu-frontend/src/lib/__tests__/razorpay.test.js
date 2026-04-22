import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../config/env.config.js', () => ({
  RAZORPAY_CONFIG: {
    keyId: 'rzp_test_default',
    currency: 'INR',
    name: 'KalaSetu',
    description: 'Artisan Services Payment',
    image: '/logo.png',
    theme: { color: '#A55233' },
  },
}));

import { displayRazorpay } from '../razorpay.js';

describe('displayRazorpay', () => {
  afterEach(() => {
    delete window.Razorpay;
    vi.restoreAllMocks();
  });

  it('configures Razorpay checkout so users can dismiss it and reports cancellation', async () => {
    const open = vi.fn();
    const on = vi.fn();

    window.Razorpay = vi.fn((options) => ({
      options,
      on,
      open,
    }));

    const paymentPromise = displayRazorpay({
      keyId: 'rzp_test_123',
      amount: 250000,
      currency: 'INR',
      orderId: 'order_123',
      description: 'Bridal Mehendi',
    });

    await Promise.resolve();

    expect(window.Razorpay).toHaveBeenCalledTimes(1);

    const razorpayOptions = window.Razorpay.mock.calls[0][0];

    expect(razorpayOptions.modal).toMatchObject({
      backdropclose: true,
      escape: true,
      handleback: true,
      confirm_close: true,
    });
    expect(typeof razorpayOptions.modal.ondismiss).toBe('function');
    expect(open).toHaveBeenCalledTimes(1);

    razorpayOptions.modal.ondismiss();

    await expect(paymentPromise).rejects.toThrow('Payment cancelled by user');
  });
});
