/**
 * @file contactController.js — Public Contact Form
 *
 * Handles the public "Contact Us" form submission. No auth required.
 * Sends the message to the KalaSetu team via Resend email.
 *
 * Endpoints:
 *  POST /api/contact — Submit contact form (name, email, subject, message)
 *
 * Validated with Zod. Email is sent asynchronously via utils/email.js.
 *
 * @see utils/email.js — sendContactFormEmail()
 */

import asyncHandler from '../utils/asyncHandler.js';
import { sendContactFormEmail } from '../utils/email.js';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

/**
 * Handle contact form submission
 * POST /api/contact
 */
export const submitContactForm = asyncHandler(async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);

    // Send email
    const result = await sendContactFormEmail(data);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
      });
    }

    res.json({
      success: true,
      message: 'Message sent successfully. We\'ll get back to you soon!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    throw error;
  }
});
