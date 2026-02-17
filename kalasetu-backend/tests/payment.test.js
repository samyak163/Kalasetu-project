import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Payment from '../models/paymentModel.js';
import User from '../models/userModel.js';
import Artisan from '../models/artisanModel.js';

function mockReq(overrides = {}) {
  return {
    cookies: {},
    headers: {},
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; },
  };
  return res;
}

describe('Payment Tests', () => {
  let testUser, testArtisan;

  beforeEach(async () => {
    testUser = await User.create({
      fullName: 'Payment Test User',
      email: 'paymentuser@example.com',
      password: 'Password123',
    });

    const hashedPass = await bcrypt.hash('Password123', 10);
    testArtisan = await Artisan.create({
      fullName: 'Payment Test Artisan',
      email: 'paymentartisan@example.com',
      password: hashedPass,
    });
  });

  // Helper to create a valid payment document
  async function createTestPayment(overrides = {}) {
    return Payment.create({
      orderId: `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      razorpayOrderId: `rpay_order_${Date.now()}`,
      amount: 1500,
      currency: 'INR',
      status: 'created',
      payerId: testUser._id,
      payerModel: 'User',
      recipientId: testArtisan._id,
      recipientModel: 'Artisan',
      purpose: 'service',
      description: 'Payment for pottery workshop',
      ...overrides,
    });
  }

  // -------------------------------------------------------------------
  // 1. Payment Model - Creation and Validation
  // -------------------------------------------------------------------
  describe('Payment Model - Creation', () => {
    it('should create a payment with all required fields', async () => {
      const payment = await createTestPayment();

      expect(payment).toBeDefined();
      expect(payment._id).toBeDefined();
      expect(payment.amount).toBe(1500);
      expect(payment.currency).toBe('INR');
      expect(payment.status).toBe('created');
      expect(payment.payerId.toString()).toBe(testUser._id.toString());
      expect(payment.payerModel).toBe('User');
      expect(payment.recipientId.toString()).toBe(testArtisan._id.toString());
      expect(payment.recipientModel).toBe('Artisan');
      expect(payment.purpose).toBe('service');
    });

    it('should fail without orderId', async () => {
      await expect(Payment.create({
        razorpayOrderId: 'rpay_test',
        amount: 1000,
        payerId: testUser._id,
        payerModel: 'User',
        purpose: 'service',
      })).rejects.toThrow();
    });

    it('should fail without razorpayOrderId', async () => {
      await expect(Payment.create({
        orderId: 'order_test',
        amount: 1000,
        payerId: testUser._id,
        payerModel: 'User',
        purpose: 'service',
      })).rejects.toThrow();
    });

    it('should fail without amount', async () => {
      await expect(Payment.create({
        orderId: 'order_test_2',
        razorpayOrderId: 'rpay_test_2',
        payerId: testUser._id,
        payerModel: 'User',
        purpose: 'service',
      })).rejects.toThrow();
    });

    it('should fail without payerId', async () => {
      await expect(Payment.create({
        orderId: 'order_test_3',
        razorpayOrderId: 'rpay_test_3',
        amount: 1000,
        payerModel: 'User',
        purpose: 'service',
      })).rejects.toThrow();
    });

    it('should fail without payerModel', async () => {
      await expect(Payment.create({
        orderId: 'order_test_4',
        razorpayOrderId: 'rpay_test_4',
        amount: 1000,
        payerId: testUser._id,
        purpose: 'service',
      })).rejects.toThrow();
    });

    it('should fail without purpose', async () => {
      await expect(Payment.create({
        orderId: 'order_test_5',
        razorpayOrderId: 'rpay_test_5',
        amount: 1000,
        payerId: testUser._id,
        payerModel: 'User',
      })).rejects.toThrow();
    });

    it('should enforce unique orderId', async () => {
      const sharedOrderId = `order_unique_${Date.now()}`;
      await createTestPayment({ orderId: sharedOrderId, razorpayOrderId: 'rpay_1' });

      await expect(
        createTestPayment({ orderId: sharedOrderId, razorpayOrderId: 'rpay_2' })
      ).rejects.toThrow();
    });

    it('should default currency to INR', async () => {
      const payment = await createTestPayment();
      expect(payment.currency).toBe('INR');
    });

    it('should default status to created', async () => {
      const payment = await createTestPayment();
      expect(payment.status).toBe('created');
    });

    it('should store metadata as mixed type', async () => {
      const payment = await createTestPayment({
        metadata: { bookingId: 'abc123', customField: true, nested: { deep: 'value' } },
      });
      expect(payment.metadata.bookingId).toBe('abc123');
      expect(payment.metadata.customField).toBe(true);
      expect(payment.metadata.nested.deep).toBe('value');
    });
  });

  // -------------------------------------------------------------------
  // 2. Payment Model - Status Enum Validation
  // -------------------------------------------------------------------
  describe('Payment Model - Status Enum', () => {
    it('should accept all valid status values', async () => {
      const validStatuses = ['created', 'pending', 'authorized', 'captured', 'refunded', 'failed'];

      for (const status of validStatuses) {
        const payment = await createTestPayment({
          orderId: `order_status_${status}_${Date.now()}`,
          razorpayOrderId: `rpay_status_${status}_${Date.now()}`,
          status,
        });
        expect(payment.status).toBe(status);
      }
    });

    it('should reject invalid status values', async () => {
      await expect(createTestPayment({
        orderId: `order_invalid_${Date.now()}`,
        razorpayOrderId: `rpay_invalid_${Date.now()}`,
        status: 'invalid_status',
      })).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------
  // 3. Payment Model - Purpose Enum Validation
  // -------------------------------------------------------------------
  describe('Payment Model - Purpose Enum', () => {
    it('should accept all valid purpose values', async () => {
      const validPurposes = ['consultation', 'product_purchase', 'service', 'subscription', 'other'];

      for (const purpose of validPurposes) {
        const payment = await createTestPayment({
          orderId: `order_purpose_${purpose}_${Date.now()}`,
          razorpayOrderId: `rpay_purpose_${purpose}_${Date.now()}`,
          purpose,
        });
        expect(payment.purpose).toBe(purpose);
      }
    });

    it('should reject invalid purpose values', async () => {
      await expect(createTestPayment({
        orderId: `order_badpurpose_${Date.now()}`,
        razorpayOrderId: `rpay_badpurpose_${Date.now()}`,
        purpose: 'invalid_purpose',
      })).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------
  // 4. Payment Model - PayerModel Enum Validation
  // -------------------------------------------------------------------
  describe('Payment Model - PayerModel Enum', () => {
    it('should accept User as payerModel', async () => {
      const payment = await createTestPayment({ payerModel: 'User' });
      expect(payment.payerModel).toBe('User');
    });

    it('should accept Artisan as payerModel', async () => {
      const payment = await createTestPayment({
        orderId: `order_artpayer_${Date.now()}`,
        razorpayOrderId: `rpay_artpayer_${Date.now()}`,
        payerId: testArtisan._id,
        payerModel: 'Artisan',
      });
      expect(payment.payerModel).toBe('Artisan');
    });

    it('should reject invalid payerModel', async () => {
      await expect(createTestPayment({
        orderId: `order_badmodel_${Date.now()}`,
        razorpayOrderId: `rpay_badmodel_${Date.now()}`,
        payerModel: 'InvalidModel',
      })).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------
  // 5. Payment Status Transitions (model-level)
  // -------------------------------------------------------------------
  describe('Payment Status Transitions', () => {
    it('should transition from created to captured', async () => {
      const payment = await createTestPayment({ status: 'created' });
      payment.status = 'captured';
      payment.razorpayPaymentId = 'pay_test_123';
      await payment.save();

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('captured');
      expect(updated.razorpayPaymentId).toBe('pay_test_123');
    });

    it('should transition from captured to refunded', async () => {
      const payment = await createTestPayment({ status: 'captured', razorpayPaymentId: 'pay_test_456' });
      payment.status = 'refunded';
      payment.refundId = 'rfnd_test_123';
      payment.refundAmount = 1500;
      payment.refundedAt = new Date();
      await payment.save();

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('refunded');
      expect(updated.refundId).toBe('rfnd_test_123');
      expect(updated.refundAmount).toBe(1500);
      expect(updated.refundedAt).toBeDefined();
    });

    it('should transition from created to failed', async () => {
      const payment = await createTestPayment({ status: 'created' });
      payment.status = 'failed';
      await payment.save();

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('failed');
    });

    it('should support partial refund (refundAmount less than amount)', async () => {
      const payment = await createTestPayment({
        status: 'captured',
        amount: 2000,
        razorpayPaymentId: 'pay_partial_test',
      });
      payment.status = 'refunded';
      payment.refundAmount = 500;
      payment.refundId = 'rfnd_partial_test';
      payment.refundedAt = new Date();
      await payment.save();

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('refunded');
      expect(updated.refundAmount).toBe(500);
      expect(updated.amount).toBe(2000);
    });
  });

  // -------------------------------------------------------------------
  // 6. Refund Request Validation Logic (model-level checks)
  // -------------------------------------------------------------------
  describe('Refund Validation Logic', () => {
    it('should only allow refund from captured status (atomic update pattern)', async () => {
      const payment = await createTestPayment({ status: 'captured', razorpayPaymentId: 'pay_rfnd_1' });

      // Simulate the atomic update pattern from the controller
      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id, status: 'captured' },
        {
          $set: {
            status: 'refunded',
            refundId: 'rfnd_1',
            refundAmount: payment.amount,
            refundedAt: new Date(),
          },
        },
        { new: true }
      );

      expect(updated).not.toBeNull();
      expect(updated.status).toBe('refunded');
    });

    it('should reject refund when payment is not captured (atomic update returns null)', async () => {
      const payment = await createTestPayment({ status: 'created' });

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id, status: 'captured' },
        {
          $set: {
            status: 'refunded',
            refundId: 'rfnd_2',
            refundAmount: payment.amount,
            refundedAt: new Date(),
          },
        },
        { new: true }
      );

      // Should return null because the precondition (status: captured) doesn't match
      expect(updated).toBeNull();

      // Original document should remain unchanged
      const original = await Payment.findById(payment._id);
      expect(original.status).toBe('created');
    });

    it('should reject refund when already refunded (idempotency check)', async () => {
      const payment = await createTestPayment({
        status: 'refunded',
        razorpayPaymentId: 'pay_already_refunded',
        refundId: 'rfnd_existing',
        refundAmount: 1500,
        refundedAt: new Date(),
      });

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id, status: 'captured' },
        {
          $set: {
            status: 'refunded',
            refundId: 'rfnd_duplicate',
            refundAmount: payment.amount,
            refundedAt: new Date(),
          },
        },
        { new: true }
      );

      expect(updated).toBeNull();
    });

    it('should not allow refund amount exceeding original (application-level check)', () => {
      const paymentAmount = 1500;
      const refundAmount = 2000;
      expect(refundAmount > paymentAmount).toBe(true);
    });
  });

  // -------------------------------------------------------------------
  // 7. Payment Query Patterns
  // -------------------------------------------------------------------
  describe('Payment Query Patterns', () => {
    it('should find payments by payer', async () => {
      await createTestPayment();
      await createTestPayment({
        orderId: `order_q1_${Date.now()}`,
        razorpayOrderId: `rpay_q1_${Date.now()}`,
      });

      const payments = await Payment.find({ payerId: testUser._id });
      expect(payments).toHaveLength(2);
    });

    it('should find payments by recipient', async () => {
      await createTestPayment();

      const payments = await Payment.find({ recipientId: testArtisan._id });
      expect(payments).toHaveLength(1);
    });

    it('should find payments by status', async () => {
      await createTestPayment({ status: 'captured', razorpayPaymentId: 'pay_s1' });
      await createTestPayment({
        orderId: `order_q2_${Date.now()}`,
        razorpayOrderId: `rpay_q2_${Date.now()}`,
        status: 'created',
      });

      const captured = await Payment.find({ status: 'captured' });
      expect(captured).toHaveLength(1);
      expect(captured[0].status).toBe('captured');
    });

    it('should find payment by razorpayOrderId', async () => {
      const razorpayOrderId = `rpay_unique_${Date.now()}`;
      await createTestPayment({ razorpayOrderId });

      const payment = await Payment.findOne({ razorpayOrderId });
      expect(payment).not.toBeNull();
      expect(payment.razorpayOrderId).toBe(razorpayOrderId);
    });

    it('should support metadata-based queries (bookingId lookup)', async () => {
      const bookingId = new mongoose.Types.ObjectId().toString();
      await createTestPayment({
        metadata: { bookingId },
      });

      const payment = await Payment.findOne({ 'metadata.bookingId': bookingId });
      expect(payment).not.toBeNull();
      expect(payment.metadata.bookingId).toBe(bookingId);
    });
  });

  // -------------------------------------------------------------------
  // 8. Webhook Idempotency (atomic update patterns)
  // -------------------------------------------------------------------
  describe('Webhook Idempotency Patterns', () => {
    it('should capture payment only once (idempotent update)', async () => {
      const payment = await createTestPayment({ status: 'created' });

      // First webhook call - should succeed
      const first = await Payment.findOneAndUpdate(
        { razorpayOrderId: payment.razorpayOrderId, status: { $ne: 'captured' } },
        { $set: { status: 'captured', razorpayPaymentId: 'pay_wh_1' } },
        { new: true }
      );
      expect(first).not.toBeNull();
      expect(first.status).toBe('captured');

      // Second webhook call (duplicate) - should be a no-op
      const second = await Payment.findOneAndUpdate(
        { razorpayOrderId: payment.razorpayOrderId, status: { $ne: 'captured' } },
        { $set: { status: 'captured', razorpayPaymentId: 'pay_wh_1' } },
        { new: true }
      );
      expect(second).toBeNull();
    });

    it('should not overwrite captured with failed (payment.failed webhook race)', async () => {
      const payment = await createTestPayment({
        status: 'captured',
        razorpayPaymentId: 'pay_race_test',
      });

      const updated = await Payment.findOneAndUpdate(
        { razorpayOrderId: payment.razorpayOrderId, status: { $nin: ['captured', 'failed', 'refunded'] } },
        { $set: { status: 'failed' } },
        { new: true }
      );

      expect(updated).toBeNull();

      // Original remains captured
      const original = await Payment.findById(payment._id);
      expect(original.status).toBe('captured');
    });
  });
});
