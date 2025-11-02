# 📧 Email Service Implementation Guide - Resend

## 📖 Overview

This document covers the complete implementation of transactional email service using **Resend** in the KalaSetu project. The service provides professional HTML email templates for user engagement, authentication flows, notifications, and contact form submissions.

---

## 🎯 Features Implemented

### ✅ Email Templates
1. **Welcome Email** - Sent on new user registration
2. **Password Reset Email** - Sent when user requests password reset
3. **Email Verification** - Sent to verify user email address
4. **Order Confirmation** - Sent when order is placed
5. **Custom Notifications** - Generic notification template with action button
6. **Contact Form** - Internal notification for contact form submissions
7. **Batch Emails** - Send multiple emails concurrently

### ✅ Features
- Professional HTML email templates with inline CSS
- Responsive design for mobile and desktop
- Graceful fallback when service is disabled
- Async/non-blocking email sending
- Batch email support with Promise.allSettled
- Error handling and logging
- Reply-to support for contact forms
- Customizable branding (from name, from email)

---

## 🔧 Backend Implementation

### File Structure
```
kalasetu-backend/
├── utils/
│   └── email.js                    # Email client & templates
├── controllers/
│   ├── authController.js           # Integration: welcome & reset emails
│   └── contactController.js        # Contact form handler
├── routes/
│   └── contactRoutes.js            # Contact form endpoint
└── config/
    └── env.config.js               # EMAIL_CONFIG
```

### Configuration

**File:** `kalasetu-backend/config/env.config.js`

```javascript
export const EMAIL_CONFIG = {
  enabled: true,
  provider: 'resend',
  appUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
    fromName: process.env.RESEND_FROM_NAME || 'KalaSetu',
  },
};
```

### Utility Functions

**File:** `kalasetu-backend/utils/email.js`

#### Initialize Resend Client
```javascript
import { initResend, getResendClient } from './utils/email.js';

// Initialize on server startup
initResend();

// Get client instance
const client = getResendClient();
```

#### Send Welcome Email
```javascript
import { sendWelcomeEmail } from './utils/email.js';

await sendWelcomeEmail(
  'artisan@example.com',
  'John Doe'
);
```

#### Send Password Reset Email
```javascript
import { sendPasswordResetEmail } from './utils/email.js';

const resetToken = 'abc123...';
await sendPasswordResetEmail(
  'artisan@example.com',
  'John Doe',
  resetToken
);
```

#### Send Email Verification
```javascript
import { sendVerificationEmail } from './utils/email.js';

const verificationToken = 'xyz789...';
await sendVerificationEmail(
  'artisan@example.com',
  'John Doe',
  verificationToken
);
```

#### Send Order Confirmation
```javascript
import { sendOrderConfirmationEmail } from './utils/email.js';

await sendOrderConfirmationEmail(
  'customer@example.com',
  'Jane Smith',
  {
    orderId: 'ORD-123',
    items: [
      { name: 'Handmade Pottery', quantity: 2, price: 500 },
      { name: 'Woven Basket', quantity: 1, price: 350 }
    ],
    total: 1350,
    orderUrl: 'https://kalasetu.com/orders/ORD-123'
  }
);
```

#### Send Custom Notification
```javascript
import { sendNotificationEmail } from './utils/email.js';

await sendNotificationEmail(
  'user@example.com',
  'John Doe',
  {
    title: 'New Message Received',
    message: 'You have a new message from an artisan.',
    actionUrl: 'https://kalasetu.com/messages',
    actionText: 'View Messages'
  }
);
```

#### Send Batch Emails
```javascript
import { sendBatchEmails } from './utils/email.js';

const emails = [
  { to: 'user1@example.com', subject: 'Update', html: '<p>Content</p>' },
  { to: 'user2@example.com', subject: 'Update', html: '<p>Content</p>' },
];

const results = await sendBatchEmails(emails);
console.log(`Sent ${results.filter(r => r.status === 'fulfilled').length} emails`);
```

#### Send Contact Form Email
```javascript
import { sendContactFormEmail } from './utils/email.js';

await sendContactFormEmail({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Partnership Inquiry',
  message: 'I would like to discuss...'
});
```

### Integration in Authentication Flow

**File:** `kalasetu-backend/controllers/authController.js`

```javascript
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';

// In register handler
const artisan = await Artisan.create(artisanData);

// Send welcome email (async, don't wait)
if (artisan.email) {
  sendWelcomeEmail(artisan.email, artisan.fullName).catch(err => {
    console.error('Failed to send welcome email:', err);
  });
}

// In forgot password handler
const resetToken = crypto.randomBytes(32).toString('hex');
artisan.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
artisan.resetPasswordExpires = Date.now() + 3600000;
await artisan.save({ validateBeforeSave: false });

// Send password reset email (async, don't wait)
if (artisan.email) {
  sendPasswordResetEmail(artisan.email, artisan.fullName, resetToken).catch(err => {
    console.error('Failed to send password reset email:', err);
  });
}
```

### Contact Form Controller

**File:** `kalasetu-backend/controllers/contactController.js`

```javascript
import asyncHandler from '../utils/asyncHandler.js';
import { sendContactFormEmail } from '../utils/email.js';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const submitContactForm = asyncHandler(async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);
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
```

### API Routes

**File:** `kalasetu-backend/routes/contactRoutes.js`

```javascript
import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitContactForm);

export default router;
```

**Mount in server.js:**

```javascript
import { initResend } from './utils/email.js';
import contactRoutes from './routes/contactRoutes.js';

// Initialize Resend
initResend();

// Mount routes
app.use('/api/contact', contactRoutes);
```

---

## 🎨 Frontend Implementation

### File Structure
```
kalasetu-frontend/
└── src/
    └── components/
        └── ContactForm.jsx         # Contact form component
```

### Contact Form Component

**File:** `kalasetu-frontend/src/components/ContactForm.jsx`

```jsx
import { useState } from 'react';
import api from '../lib/axios';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          <p className="font-semibold">✅ Message sent successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
```

### Usage in Pages

```jsx
import ContactForm from '../components/ContactForm';

function ContactPage() {
  return (
    <div>
      <ContactForm />
    </div>
  );
}
```

---

## ⚙️ Configuration & Setup

### Environment Variables

**Backend `.env`:**
```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@kalasetu.com
RESEND_FROM_NAME=KalaSetu

# Frontend URL (for email links)
FRONTEND_BASE_URL=http://localhost:5173
```

### Getting Started with Resend

1. **Sign up for Resend**
   - Visit: https://resend.com
   - Create a free account

2. **Get API Key**
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Name: "KalaSetu Production"
   - Permission: Full Access
   - Copy the key (starts with `re_`)

3. **Verify Domain** (Production)
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Add your domain: `kalasetu.com`
   - Add DNS records (TXT, MX, CNAME)
   - Wait for verification
   - Use verified domain in `RESEND_FROM_EMAIL`

4. **Test with Development Email** (Development)
   - Use: `onboarding@resend.dev` (no verification needed)
   - Test emails will be sent to your Resend account email

### Installation

Backend package is already installed:
```bash
cd kalasetu-backend
npm install resend
```

---

## 🧪 Testing

### Test Email Initialization

```bash
# Start backend server
cd kalasetu-backend
npm run dev

# Look for log message
✅ Resend client initialized
```

### Test Welcome Email

```bash
# Register a new artisan
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Artisan",
    "email": "test@example.com",
    "password": "password123"
  }'

# Check backend logs
✅ Email sent to test@example.com: Welcome to KalaSetu - Let's Get Started! 🎨
```

### Test Password Reset Email

```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "loginIdentifier": "test@example.com"
  }'

# Check backend logs
✅ Email sent to test@example.com: Reset Your Password - KalaSetu
```

### Test Contact Form

```bash
# Submit contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test Message",
    "message": "This is a test message from the contact form."
  }'

# Check backend logs
✅ Email sent to noreply@kalasetu.com: Contact Form: Test Message
```

### Test with Frontend

1. Start both servers:
   ```bash
   # Terminal 1: Backend
   cd kalasetu-backend
   npm run dev

   # Terminal 2: Frontend
   cd kalasetu-frontend
   npm run dev
   ```

2. Visit: http://localhost:5173/contact (add route if needed)

3. Fill out and submit the contact form

4. Check:
   - Success message appears
   - Backend logs show email sent
   - Resend dashboard shows email activity

---

## 📊 Monitoring & Debugging

### Resend Dashboard

**URL:** https://resend.com/emails

**Features:**
- View all sent emails
- Email status (delivered, bounced, failed)
- Delivery logs
- Webhook events
- API usage statistics

### Check Email Status

```javascript
// In utils/email.js or any controller
const response = await sendEmail({
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Test</p>'
});

console.log('Email ID:', response.id);
// Use this ID to check status in Resend dashboard
```

### Error Handling

The email service handles errors gracefully:

1. **Service Disabled:**
   ```
   ⚠️ Resend email service is disabled
   📧 Email would be sent: {...}
   ```

2. **Missing API Key:**
   ```
   Resend API key is not configured
   ```

3. **Send Failure:**
   ```
   ❌ Failed to send email: <error message>
   ```

4. **Async Errors** (in auth flow):
   ```
   Failed to send welcome email: <error>
   Failed to send password reset email: <error>
   ```

### Logs to Monitor

```bash
# Successful initialization
✅ Resend client initialized

# Successful email send
✅ Email sent to user@example.com: Welcome to KalaSetu - Let's Get Started! 🎨

# Batch email results
✅ Sent 48 emails, 2 failed
```

---

## 🎨 Customizing Email Templates

### Update Welcome Email Template

**File:** `kalasetu-backend/utils/email.js`

```javascript
export const sendWelcomeEmail = async (to, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Update styles here */
        .header { background: YOUR_COLOR; }
        .button { background: YOUR_COLOR; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- Update header content -->
        </div>
        <div class="content">
          <!-- Update body content -->
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'YOUR_SUBJECT',
    html,
  });
};
```

### Add New Email Template

1. **Create template function in `utils/email.js`:**

```javascript
export const sendOrderShippedEmail = async (to, name, orderDetails) => {
  const { orderId, trackingUrl, estimatedDelivery } = orderDetails;

  const html = `
    <!DOCTYPE html>
    <html>
    <!-- Your template HTML -->
    </html>
  `;

  return sendEmail({
    to,
    subject: `Your Order #${orderId} Has Shipped!`,
    html,
  });
};
```

2. **Use in controller:**

```javascript
import { sendOrderShippedEmail } from '../utils/email.js';

// When order ships
await sendOrderShippedEmail(
  customer.email,
  customer.name,
  {
    orderId: order.id,
    trackingUrl: 'https://tracking.com/...',
    estimatedDelivery: '2024-12-25'
  }
);
```

---

## 🔐 Security Best Practices

### API Key Security

1. **Never commit API keys to Git:**
   ```bash
   # .gitignore already includes .env
   .env
   .env.local
   ```

2. **Use different keys for dev/production:**
   ```bash
   # Development
   RESEND_API_KEY=re_dev_xxxxx

   # Production
   RESEND_API_KEY=re_prod_xxxxx
   ```

3. **Restrict API key permissions:**
   - Create separate keys for different environments
   - Use "Sending Access" only if webhook receiving is separate

### Email Security

1. **Rate limiting** (already implemented in server.js):
   ```javascript
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 300, // limit per IP
   });
   ```

2. **Input validation** (using Zod schemas):
   ```javascript
   const contactSchema = z.object({
     email: z.string().email('Invalid email'),
     // ... other fields
   });
   ```

3. **Sanitize user input:**
   ```javascript
   const message = data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
   ```

### Privacy

1. **Don't log email addresses in production:**
   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     console.log('Sending email to:', to);
   }
   ```

2. **Include unsubscribe links** (for marketing emails):
   ```html
   <a href="${EMAIL_CONFIG.appUrl}/settings/notifications">Unsubscribe</a>
   ```

---

## 📈 Usage & Limits

### Resend Free Tier
- **3,000 emails/month**
- **100 emails/day**
- Single domain verification
- Full API access

### Resend Pro Tier ($20/month)
- **50,000 emails/month**
- **Unlimited daily sends**
- Multiple domains
- Webhook support
- Priority support

### Best Practices
1. Use async/non-blocking sends to avoid request delays
2. Batch emails when sending to multiple recipients
3. Monitor daily/monthly usage in Resend dashboard
4. Set up webhooks to track delivery status
5. Implement retry logic for failed sends

---

## 🚀 Deployment Checklist

### Before Production

- [ ] Sign up for Resend account
- [ ] Create production API key
- [ ] Verify custom domain (e.g., `kalasetu.com`)
- [ ] Update `RESEND_FROM_EMAIL` to verified domain
- [ ] Test all email templates
- [ ] Check all email links point to production URLs
- [ ] Set up error monitoring (Sentry already integrated)
- [ ] Configure webhooks (optional, for delivery tracking)
- [ ] Review rate limits
- [ ] Test unsubscribe flow (if applicable)

### Production Environment Variables

```bash
RESEND_API_KEY=re_prod_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@kalasetu.com
RESEND_FROM_NAME=KalaSetu
FRONTEND_BASE_URL=https://kalasetu.com
```

---

## 📚 Additional Resources

### Official Documentation
- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Node.js SDK:** https://resend.com/docs/send-with-nodejs

### Example Projects
- **Next.js + Resend:** https://github.com/resendlabs/react-email
- **Email Templates:** https://react.email/examples

### Support
- **Resend Support:** support@resend.com
- **Discord Community:** https://discord.gg/resend
- **GitHub Issues:** https://github.com/resendlabs/resend-node

---

## 🎯 Summary

You now have a complete transactional email system with:
- ✅ 7 professional HTML email templates
- ✅ Async/non-blocking email sending
- ✅ Graceful error handling
- ✅ Contact form with backend integration
- ✅ Authentication flow integration (welcome & password reset)
- ✅ Batch email support
- ✅ Production-ready configuration

**Next Steps:**
1. Sign up for Resend and get API key
2. Add environment variables to `.env`
3. Test all email templates
4. Deploy to production with verified domain

Happy emailing! 📧✨
