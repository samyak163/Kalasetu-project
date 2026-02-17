import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Availability from '../models/availabilityModel.js';
import Artisan from '../models/artisanModel.js';

// Replicate the Zod schema from availabilityRoutes.js for direct validation testing
const slotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().optional(),
});

const availabilityZodSchema = z.object({
  recurringSchedule: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    slots: z.array(slotSchema),
  })).optional(),
  exceptions: z.array(z.object({
    date: z.string().or(z.date()),
    isAvailable: z.boolean(),
    slots: z.array(slotSchema).optional(),
    reason: z.string().max(200).optional(),
  })).max(90).optional(),
  bufferTime: z.number().int().min(0).max(480).optional(),
  advanceBookingDays: z.number().int().min(1).max(365).optional(),
  minNoticeHours: z.number().int().min(0).max(168).optional(),
});

describe('Availability', () => {
  let artisan;

  beforeEach(async () => {
    const hashedPass = await bcrypt.hash('Password123', 10);
    artisan = await Artisan.create({
      fullName: 'Availability Artisan',
      email: 'avail-artisan@test.com',
      password: hashedPass,
    });
  });

  describe('Availability Model', () => {
    it('should create availability with required artisan field', async () => {
      const doc = await Availability.create({
        artisan: artisan._id,
      });

      expect(doc._id).toBeDefined();
      expect(doc.artisan.toString()).toBe(artisan._id.toString());
      expect(doc.bufferTime).toBe(30); // default
      expect(doc.advanceBookingDays).toBe(30); // default
      expect(doc.minNoticeHours).toBe(24); // default
    });

    it('should reject availability without artisan', async () => {
      await expect(Availability.create({})).rejects.toThrow();
    });

    it('should store recurring schedule with day and slots', async () => {
      const doc = await Availability.create({
        artisan: artisan._id,
        recurringSchedule: [
          {
            dayOfWeek: 1, // Monday
            slots: [
              { startTime: '09:00', endTime: '12:00', isActive: true },
              { startTime: '14:00', endTime: '18:00', isActive: true },
            ],
          },
          {
            dayOfWeek: 3, // Wednesday
            slots: [
              { startTime: '10:00', endTime: '16:00' },
            ],
          },
        ],
      });

      expect(doc.recurringSchedule).toHaveLength(2);
      expect(doc.recurringSchedule[0].dayOfWeek).toBe(1);
      expect(doc.recurringSchedule[0].slots).toHaveLength(2);
      expect(doc.recurringSchedule[0].slots[0].startTime).toBe('09:00');
    });

    it('should store exceptions with date and availability', async () => {
      const exceptionDate = new Date('2026-03-15');
      const doc = await Availability.create({
        artisan: artisan._id,
        exceptions: [
          {
            date: exceptionDate,
            isAvailable: false,
            reason: 'Holiday',
          },
        ],
      });

      expect(doc.exceptions).toHaveLength(1);
      expect(doc.exceptions[0].isAvailable).toBe(false);
      expect(doc.exceptions[0].reason).toBe('Holiday');
    });

    it('should enforce unique artisan constraint', async () => {
      await Availability.create({ artisan: artisan._id });

      // Attempting to create a second availability for same artisan should fail
      await expect(
        Availability.create({ artisan: artisan._id })
      ).rejects.toThrow();
    });

    it('should store custom buffer time and advance booking days', async () => {
      const doc = await Availability.create({
        artisan: artisan._id,
        bufferTime: 60,
        advanceBookingDays: 14,
        minNoticeHours: 48,
      });

      expect(doc.bufferTime).toBe(60);
      expect(doc.advanceBookingDays).toBe(14);
      expect(doc.minNoticeHours).toBe(48);
    });
  });

  describe('Zod validation schema', () => {
    it('should accept valid schedule data', () => {
      const result = availabilityZodSchema.safeParse({
        recurringSchedule: [
          {
            dayOfWeek: 0,
            slots: [{ startTime: '09:00', endTime: '17:00' }],
          },
        ],
        bufferTime: 30,
        advanceBookingDays: 30,
        minNoticeHours: 24,
      });

      expect(result.success).toBe(true);
    });

    it('should reject dayOfWeek below 0', () => {
      const result = availabilityZodSchema.safeParse({
        recurringSchedule: [
          { dayOfWeek: -1, slots: [] },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('should reject dayOfWeek above 6', () => {
      const result = availabilityZodSchema.safeParse({
        recurringSchedule: [
          { dayOfWeek: 7, slots: [] },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-integer dayOfWeek', () => {
      const result = availabilityZodSchema.safeParse({
        recurringSchedule: [
          { dayOfWeek: 2.5, slots: [] },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('should reject bufferTime below 0', () => {
      const result = availabilityZodSchema.safeParse({
        bufferTime: -10,
      });

      expect(result.success).toBe(false);
    });

    it('should reject bufferTime above 480', () => {
      const result = availabilityZodSchema.safeParse({
        bufferTime: 500,
      });

      expect(result.success).toBe(false);
    });

    it('should reject advanceBookingDays below 1', () => {
      const result = availabilityZodSchema.safeParse({
        advanceBookingDays: 0,
      });

      expect(result.success).toBe(false);
    });

    it('should reject advanceBookingDays above 365', () => {
      const result = availabilityZodSchema.safeParse({
        advanceBookingDays: 400,
      });

      expect(result.success).toBe(false);
    });

    it('should reject minNoticeHours above 168 (1 week)', () => {
      const result = availabilityZodSchema.safeParse({
        minNoticeHours: 200,
      });

      expect(result.success).toBe(false);
    });

    it('should reject more than 90 exceptions', () => {
      const exceptions = Array.from({ length: 91 }, (_, i) => ({
        date: `2026-01-${String(i + 1).padStart(2, '0')}`,
        isAvailable: false,
      }));

      const result = availabilityZodSchema.safeParse({ exceptions });

      expect(result.success).toBe(false);
    });

    it('should accept empty object (all fields optional)', () => {
      const result = availabilityZodSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it('should reject exception reason longer than 200 characters', () => {
      const result = availabilityZodSchema.safeParse({
        exceptions: [
          {
            date: '2026-03-15',
            isAvailable: false,
            reason: 'x'.repeat(201),
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('should accept slot with optional isActive field', () => {
      const result = availabilityZodSchema.safeParse({
        recurringSchedule: [
          {
            dayOfWeek: 2,
            slots: [
              { startTime: '09:00', endTime: '12:00' }, // no isActive
              { startTime: '14:00', endTime: '18:00', isActive: false }, // explicit isActive
            ],
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Buffer time and advance booking settings', () => {
    it('should default bufferTime to 30 minutes', async () => {
      const doc = await Availability.create({ artisan: artisan._id });
      expect(doc.bufferTime).toBe(30);
    });

    it('should default advanceBookingDays to 30', async () => {
      const doc = await Availability.create({ artisan: artisan._id });
      expect(doc.advanceBookingDays).toBe(30);
    });

    it('should default minNoticeHours to 24', async () => {
      const doc = await Availability.create({ artisan: artisan._id });
      expect(doc.minNoticeHours).toBe(24);
    });

    it('should allow updating buffer time via findOneAndUpdate', async () => {
      await Availability.create({ artisan: artisan._id, bufferTime: 30 });

      const updated = await Availability.findOneAndUpdate(
        { artisan: artisan._id },
        { $set: { bufferTime: 60 } },
        { new: true }
      );

      expect(updated.bufferTime).toBe(60);
    });

    it('should allow updating advance booking days via findOneAndUpdate', async () => {
      await Availability.create({ artisan: artisan._id, advanceBookingDays: 30 });

      const updated = await Availability.findOneAndUpdate(
        { artisan: artisan._id },
        { $set: { advanceBookingDays: 7 } },
        { new: true }
      );

      expect(updated.advanceBookingDays).toBe(7);
    });

    it('should preserve other fields when updating buffer time', async () => {
      await Availability.create({
        artisan: artisan._id,
        bufferTime: 30,
        advanceBookingDays: 14,
        minNoticeHours: 12,
        recurringSchedule: [
          { dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '17:00' }] },
        ],
      });

      const updated = await Availability.findOneAndUpdate(
        { artisan: artisan._id },
        { $set: { bufferTime: 45 } },
        { new: true }
      );

      expect(updated.bufferTime).toBe(45);
      expect(updated.advanceBookingDays).toBe(14);
      expect(updated.minNoticeHours).toBe(12);
      expect(updated.recurringSchedule).toHaveLength(1);
    });
  });
});
