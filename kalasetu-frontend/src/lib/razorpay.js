import { RAZORPAY_CONFIG } from '../config/env.config.js';

/**
 * Load Razorpay script
 * @returns {Promise<boolean>} Load status
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Display Razorpay checkout
 * @param {Object} options - Payment options
 * @returns {Promise<Object>} Payment result
 */
export const displayRazorpay = async (options) => {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  return new Promise((resolve, reject) => {
    const rzpOptions = {
      key: options.keyId || RAZORPAY_CONFIG.keyId,
      amount: options.amount,
      currency: options.currency || RAZORPAY_CONFIG.currency,
      name: RAZORPAY_CONFIG.name,
      description: options.description || RAZORPAY_CONFIG.description,
      image: RAZORPAY_CONFIG.image,
      order_id: options.orderId,
      handler: function (response) {
        resolve(response);
      },
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: options.notes || {},
      theme: RAZORPAY_CONFIG.theme,
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.on('payment.failed', function (response) {
      reject(new Error(response.error.description));
    });

    rzp.open();
  });
};

export default {
  loadRazorpayScript,
  displayRazorpay,
};
