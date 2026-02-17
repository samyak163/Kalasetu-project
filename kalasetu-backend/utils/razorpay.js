import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../config/env.config.js';

let razorpayInstance = null;

/**
 * Initialize Razorpay instance
 * @returns {Razorpay|null} Razorpay instance or null
 */
export const initRazorpay = () => {
  if (!RAZORPAY_CONFIG.keyId || !RAZORPAY_CONFIG.keySecret) {
    console.warn('⚠️  Razorpay credentials are not configured');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_CONFIG.keyId,
      key_secret: RAZORPAY_CONFIG.keySecret,
    });

    console.log('✅ Razorpay initialized');
    return razorpayInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error.message);
    return null;
  }
};

/**
 * Get Razorpay instance
 * @returns {Razorpay|null}
 */
export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    return initRazorpay();
  }
  return razorpayInstance;
};

/**
 * Create Razorpay order
 * @param {Object} options - Order options
 * @returns {Promise<Object|null>} Order object
 */
export const createOrder = async (options) => {
  const instance = getRazorpayInstance();
  if (!instance) return null;

  try {
    const order = await instance.orders.create({
      amount: options.amount * 100, // Convert to paise
      currency: RAZORPAY_CONFIG.currency,
      receipt: `${RAZORPAY_CONFIG.receipt.prefix}${Date.now()}`,
      notes: options.notes || {},
      payment_capture: 1, // Auto capture
    });

    console.log(`✅ Razorpay order created: ${order.id}`);
    return order;
  } catch (error) {
    console.error('❌ Failed to create Razorpay order:', error.message);
    return null;
  }
};

/**
 * Verify payment signature
 * @param {Object} data - Payment data
 * @returns {boolean} Verification status
 */
export const verifyPaymentSignature = (data) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks on signature verification
    const isValid = generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'hex'),
        Buffer.from(razorpay_signature, 'hex')
      );
    return isValid;
  } catch (error) {
    console.error('❌ Failed to verify payment signature:', error.message);
    return false;
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object|null>} Payment object
 */
export const fetchPayment = async (paymentId) => {
  const instance = getRazorpayInstance();
  if (!instance) return null;

  try {
    const payment = await instance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('❌ Failed to fetch payment:', error.message);
    return null;
  }
};

/**
 * Refund payment
 * @param {string} paymentId - Payment ID
 * @param {number} amount - Refund amount (optional, full refund if not provided)
 * @returns {Promise<Object|null>} Refund object
 */
export const refundPayment = async (paymentId, amount = null) => {
  const instance = getRazorpayInstance();
  if (!instance) return null;

  try {
    const refundData = {};
    if (amount) {
      refundData.amount = amount * 100; // Convert to paise
    }

    const refund = await instance.payments.refund(paymentId, refundData);
    console.log(`✅ Payment refunded: ${paymentId}`);
    return refund;
  } catch (error) {
    console.error('❌ Failed to refund payment:', error.message);
    return null;
  }
};

/**
 * Capture payment
 * @param {string} paymentId - Payment ID
 * @param {number} amount - Amount to capture
 * @returns {Promise<Object|null>} Payment object
 */
export const capturePayment = async (paymentId, amount) => {
  const instance = getRazorpayInstance();
  if (!instance) return null;

  try {
    const payment = await instance.payments.capture(
      paymentId,
      amount * 100, // Convert to paise
      RAZORPAY_CONFIG.currency
    );

    console.log(`✅ Payment captured: ${paymentId}`);
    return payment;
  } catch (error) {
    console.error('❌ Failed to capture payment:', error.message);
    return null;
  }
};

/**
 * Verify webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - Webhook signature from header
 * @returns {boolean} Verification status
 */
export const verifyWebhookSignature = (body, signature) => {
  try {
    if (!RAZORPAY_CONFIG.webhookSecret) {
      console.warn('⚠️  Razorpay webhook secret not configured');
      return false;
    }

    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.webhookSecret)
      .update(body)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks on signature verification
    const isValid = generatedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    return isValid;
  } catch (error) {
    console.error('❌ Failed to verify webhook signature:', error.message);
    return false;
  }
};

export default {
  initRazorpay,
  getRazorpayInstance,
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  refundPayment,
  capturePayment,
  verifyWebhookSignature,
};
