/**
 * @file contactRoutes.js — Public Contact Form Route
 *
 * Single endpoint for the public "Contact Us" form. No authentication
 * required. Rate-limited to 5 submissions per hour per IP to prevent
 * email spam abuse.
 *
 * Mounted at: /api/contact
 *
 * Routes:
 *  POST / — Submit contact form (name, email, subject, message)
 *
 * @see controllers/contactController.js — Zod validation + Resend email
 * @see utils/email.js — sendContactFormEmail()
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitContactForm } from '../controllers/contactController.js';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many contact submissions. Try again later.' },
});

router.post('/', contactLimiter, submitContactForm);

export default router;
