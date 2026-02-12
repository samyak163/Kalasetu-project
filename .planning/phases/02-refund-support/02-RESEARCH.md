# Phase 2: Refund & Support - Research

**Researched:** 2026-02-13
**Domain:** Payment refunds (Razorpay), Support ticket system, Admin workflows
**Confidence:** HIGH

## Summary

Phase 2 implements two critical customer service features: a refund request workflow with admin approval and a support ticket system. Both features follow marketplace trust patterns where admin oversight prevents abuse while providing necessary recourse for users.

The codebase already has refund infrastructure partially in place (Razorpay integration, payment model with refund fields, admin routes) but currently processes refunds immediately without approval. The support endpoints exist as stubs returning placeholder responses. This phase converts both into production-ready systems with proper state management, admin oversight, and multi-channel notifications.

**Primary recommendation:** Build RefundRequest and SupportTicket as separate models (not embedded in Payment/User) to enable independent lifecycle management, admin workflows, and audit trails. Use Razorpay webhooks for refund status updates, OneSignal for push notifications, and existing email templates extended for refund/support events.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Razorpay Node.js SDK | Latest (via npm) | Process refunds via Razorpay API | Already integrated; official SDK for Indian marketplace payments |
| Mongoose | ^8.x | MongoDB ODM for models | Project standard; handles schema validation, middleware, indexes |
| Zod | ^3.x | Request validation | Project standard for API input validation (see bookingController.js) |
| Express | ^4.x | REST API routes | Project standard; admin routes follow `/api/admin/*` pattern |
| Resend | ^4.x | Email notifications | Project standard (utils/email.js) for transactional emails |
| OneSignal REST API | v1 | Push notifications | Project standard (utils/onesignal.js) for real-time alerts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| QStash | Latest | Background job processing | Already in project for async tasks like email/push notification batching |
| Node crypto | Built-in | Webhook signature verification | Razorpay webhook security (already in utils/razorpay.js) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate models | Embedding in Payment/User | Embedding limits independent queries/filtering, makes audit trails harder |
| Admin approval | Auto-approve or auto-reject | Loses marketplace trust, increases refund abuse or customer dissatisfaction |
| OneSignal | Firebase Cloud Messaging | OneSignal already integrated, consistent with existing notification patterns |

**Installation:**
```bash
# Already installed; no new dependencies required
# Verify Razorpay SDK: npm list razorpay
```

## Architecture Patterns

### Recommended Project Structure
```
kalasetu-backend/
├── models/
│   ├── refundRequestModel.js     # New: RefundRequest schema
│   ├── supportTicketModel.js     # New: SupportTicket schema
│   └── paymentModel.js           # Existing: update status enum
├── controllers/
│   ├── refundController.js       # New: user-facing refund requests
│   ├── supportController.js      # New: user-facing support tickets
│   └── adminDashboardController.js # Update: add refund/ticket admin actions
├── routes/
│   ├── refundRoutes.js           # New: /api/refunds/*
│   ├── supportRoutes.js          # New: /api/support/*
│   └── adminRoutes.js            # Update: add refund/ticket endpoints
├── utils/
│   ├── email.js                  # Update: add refund/support email templates
│   └── notificationTemplates.js  # Update: add refund/support push notifications
└── jobs/
    └── jobHandlers.js            # Update: add refund status polling job (optional)
```

### Pattern 1: Admin-Approved Refund Workflow
**What:** User creates RefundRequest → Admin reviews → Admin approves/rejects → Razorpay API called → Webhook updates final status → Both parties notified

**When to use:** Marketplace platforms requiring trust/safety (prevents refund abuse while ensuring customer protection)

**State transitions:**
```
pending → approved → processing → processed (final)
        ↘ rejected (final)
                  ↘ failed (final - Razorpay API error)
```

**Example RefundRequest model:**
```javascript
// Source: Derived from existing bookingModel.js pattern + Razorpay API requirements
import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    index: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'requestedByModel'
  },
  requestedByModel: {
    type: String,
    required: true,
    enum: ['User', 'Artisan']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  evidence: [{
    type: { type: String, enum: ['image', 'document', 'text'] },
    url: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'processed', 'failed'],
    default: 'pending',
    index: true
  },
  adminResponse: {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    action: { type: String, enum: ['approved', 'rejected'] },
    reason: String,
    respondedAt: Date
  },
  razorpayRefundId: String,
  razorpayRefundStatus: String,
  processedAt: Date,
  failureReason: String
}, { timestamps: true });

// Indexes for admin filtering
refundRequestSchema.index({ status: 1, createdAt: -1 });
refundRequestSchema.index({ payment: 1, status: 1 });

export default mongoose.model('RefundRequest', refundRequestSchema);
```

### Pattern 2: Support Ticket System with Message Thread
**What:** User creates ticket → Admin responds with messages → User can reply → Admin closes ticket

**When to use:** Customer support, bug reports, general inquiries requiring back-and-forth communication

**State transitions:**
```
open → in_progress → resolved (final)
     ↘ closed (final - user/admin closes without resolution)
```

**Example SupportTicket model:**
```javascript
// Source: Derived from existing notificationModel.js pattern + common ticket system patterns
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderModel: { type: String, enum: ['User', 'Artisan', 'Admin'], required: true },
    senderName: String
  },
  message: { type: String, required: true, maxlength: 5000 },
  attachments: [{
    url: String,
    filename: String,
    type: String
  }],
  internal: { type: Boolean, default: false } // Admin-only notes
}, { timestamps: true });

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    enum: ['booking', 'payment', 'refund', 'technical', 'account', 'other'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userModel: { type: String, enum: ['User', 'Artisan'], required: true },
    userName: String,
    userEmail: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    index: true
  },
  messages: [messageSchema],
  relatedEntities: {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    refundRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'RefundRequest' }
  },
  resolvedAt: Date,
  closedAt: Date,
  closedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    userModel: String
  }
}, { timestamps: true });

// Indexes for admin filtering and search
supportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
supportTicketSchema.index({ category: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ 'createdBy.userId': 1, status: 1 });

// Auto-generate ticket number
supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TKT-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('SupportTicket', supportTicketSchema);
```

### Pattern 3: Razorpay Webhook Integration for Refund Status
**What:** Razorpay sends webhook events (refund.processed, refund.failed) → Server verifies signature → Updates RefundRequest status → Notifies parties

**When to use:** Always; refund.processed webhook is the authoritative final status (Razorpay API response is immediate but not definitive)

**Example webhook handler:**
```javascript
// Source: Existing pattern in paymentController.js handleWebhook + Razorpay docs
// Add to paymentController.js webhook switch statement

case 'refund.processed':
  await handleRefundProcessed(paymentData);
  break;

case 'refund.failed':
  await handleRefundFailed(paymentData);
  break;

async function handleRefundProcessed(refundData) {
  const refundRequest = await RefundRequest.findOne({
    razorpayRefundId: refundData.id
  });

  if (refundRequest) {
    refundRequest.status = 'processed';
    refundRequest.razorpayRefundStatus = refundData.status;
    refundRequest.processedAt = new Date();
    await refundRequest.save();

    // Update payment status
    const payment = await Payment.findById(refundRequest.payment);
    if (payment) {
      payment.status = 'refunded';
      payment.refundId = refundData.id;
      payment.refundAmount = refundData.amount / 100; // Convert paise to rupees
      payment.refundedAt = new Date();
      await payment.save();
    }

    // Notify both parties (user + artisan)
    await sendRefundProcessedNotifications(refundRequest, payment);
  }
}
```

### Pattern 4: Multi-Channel Notification Flow
**What:** State changes trigger notifications via email + push (OneSignal) + in-app (Notification model)

**When to use:** All user-facing status updates (refund approved/rejected/processed, ticket responded/resolved)

**Example notification utility:**
```javascript
// Source: Existing patterns in utils/email.js + utils/notificationTemplates.js
import { sendEmail } from './email.js';
import { sendNotificationToUser } from './onesignal.js';
import Notification from '../models/notificationModel.js';

export async function notifyRefundStatusChange(refundRequest, newStatus) {
  const user = await User.findById(refundRequest.requestedBy).lean();
  if (!user) return;

  const statusMessages = {
    approved: 'Your refund request has been approved',
    rejected: 'Your refund request has been rejected',
    processed: 'Your refund has been processed successfully',
    failed: 'Your refund could not be processed'
  };

  const title = 'Refund Request Update';
  const message = statusMessages[newStatus];

  // 1. Email
  await sendEmail({
    to: user.email,
    subject: title,
    html: generateRefundEmailHTML(user.fullName, refundRequest, newStatus)
  });

  // 2. Push notification
  await sendNotificationToUser(user._id.toString(), {
    title,
    message,
    url: `/refunds/${refundRequest._id}`,
    data: { type: 'refund', refundRequestId: refundRequest._id.toString(), status: newStatus }
  });

  // 3. In-app notification
  await Notification.create({
    ownerId: user._id,
    ownerType: 'user',
    title,
    text: message,
    url: `/refunds/${refundRequest._id}`,
    read: false
  });
}
```

### Anti-Patterns to Avoid
- **Directly mutating Payment status on refund request:** Create RefundRequest first, update Payment only after Razorpay confirms via webhook
- **Synchronous refund processing in admin approval:** Call Razorpay API async (via QStash job or background worker) to avoid timeout on admin panel
- **Embedding ticket messages as unlimited array:** Consider separate TicketMessage collection if tickets commonly exceed 100 messages (unlikely but prevents BSON doc size limit)
- **Missing idempotency on webhooks:** Already handled in existing paymentController.js via webhookEventId; replicate for refund events

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Refund processing logic | Custom refund workflow | Razorpay refund API + webhooks | Razorpay handles bank communication, compliance, partial refunds, status tracking; already integrated |
| Email templating | Custom HTML email builder | Extend existing utils/email.js templates | Project already has styled email templates (welcome, OTP, password reset); consistent branding |
| Push notifications | Direct Firebase/APNs integration | Extend existing utils/onesignal.js | OneSignal abstracts multi-platform push; already handles user segmentation |
| Ticket number generation | Manual counter increment | MongoDB auto-increment or timestamp-based | Race conditions with manual counters; timestamp + count hybrid is safe (see pattern above) |
| Admin activity logging | Custom audit trail | Extend existing Admin.logActivity method | adminModel.js already has loginHistory pattern; reusable for refund/ticket actions |
| Request validation | Manual field checks | Zod schemas | Project standard (bookingController.js); declarative, auto-generates error messages |

**Key insight:** Payment and notification infrastructure is mature in this codebase. New models should integrate with existing utilities (email, onesignal, razorpay) rather than reinventing them.

## Common Pitfalls

### Pitfall 1: Race Condition Between Refund Approval and Razorpay API Call
**What goes wrong:** Admin approves refund → API call fails → RefundRequest stuck in "approved" status → User never gets refund

**Why it happens:** Network errors, Razorpay downtime, or invalid payment state (already refunded)

**How to avoid:**
1. Set status to "processing" (not "processed") immediately after admin approval
2. Call Razorpay API in try/catch
3. On API success: store razorpayRefundId, keep status "processing" until webhook confirms
4. On API failure: set status "failed", store failureReason, notify admin + user

**Warning signs:** RefundRequests with status "approved" older than 5 minutes (should be "processing" or "rejected")

### Pitfall 2: Refunding More Than Original Payment Amount
**What goes wrong:** User requests partial refund → Admin approves → Later requests another partial refund → Total exceeds original payment

**Why it happens:** No validation against cumulative refunded amount

**How to avoid:**
```javascript
// Before creating RefundRequest, check total refunds
const existingRefunds = await RefundRequest.find({
  payment: paymentId,
  status: { $in: ['approved', 'processing', 'processed'] }
});
const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);
const payment = await Payment.findById(paymentId);

if (requestedAmount + totalRefunded > payment.amount) {
  throw new Error('Refund amount exceeds available balance');
}
```

**Warning signs:** Payment.refundAmount > Payment.amount (data integrity check in admin panel)

### Pitfall 3: Email/Push Notification Failures Blocking Refund Flow
**What goes wrong:** Razorpay refund succeeds → Email service down → Notification sending throws error → Entire transaction rolls back

**Why it happens:** Notifications treated as critical path instead of best-effort

**How to avoid:**
1. Wrap all notification calls in try/catch
2. Log notification failures but don't throw
3. Optionally: queue failed notifications for retry via QStash

```javascript
// Pattern from existing code
try {
  await sendRefundProcessedNotifications(refundRequest);
} catch (error) {
  console.error('❌ Failed to send refund notification:', error.message);
  // Don't throw - refund already processed
}
```

**Warning signs:** RefundRequests marked "processed" but users reporting they didn't receive notification (check email/push logs)

### Pitfall 4: Support Ticket Message Array Growing Unbounded
**What goes wrong:** Long-running ticket accumulates 1000+ messages → Document size exceeds MongoDB 16MB BSON limit

**Why it happens:** Embedded messages array with no size limit

**How to avoid:**
1. **Recommended:** Keep embedded messages (simpler queries) but limit to recent 100, archive older messages to separate collection if needed
2. **Alternative:** Use separate TicketMessage collection from start (more joins but unlimited messages)

**For Phase 2 (recommended):** Use embedded array with soft limit of 100 messages. Add validation:
```javascript
if (ticket.messages.length >= 100) {
  throw new Error('Ticket has reached maximum message count. Please close and create new ticket.');
}
```

**Warning signs:** Tickets with >50 messages (flag for admin review/closure)

### Pitfall 5: Missing Razorpay Webhook Signature Verification
**What goes wrong:** Attacker sends fake webhook → Server processes fake "refund.processed" event → Updates RefundRequest to processed without actual refund

**Why it happens:** Webhook endpoint accepts unauthenticated POST requests

**How to avoid:** Existing paymentController.js already implements verifyWebhookSignature. Ensure refund webhook events use same verification:
```javascript
// From paymentController.js (already implemented)
const signature = req.headers['x-razorpay-signature'];
const body = JSON.stringify(req.body);
const isValid = verifyWebhookSignature(body, signature);

if (!isValid) {
  return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
}
```

**Warning signs:** Webhook events in logs without signature verification warnings

### Pitfall 6: Admin Panel Shows Stale Refund Status
**What goes wrong:** Admin approves refund → API call succeeds → Admin panel still shows "pending" → Admin re-approves, triggering duplicate refund attempt

**Why it happens:** Frontend doesn't refetch after state change, or optimistic update without server confirmation

**How to avoid:**
1. After admin action, refetch list via `fetchPayments()` + `fetchStats()` (pattern already in AdminPayments.jsx)
2. Disable action buttons while request in flight
3. Show loading state during refund processing

**Warning signs:** Multiple RefundRequests for same Payment (audit trail shows duplicate admin approvals)

## Code Examples

Verified patterns from existing codebase:

### Example 1: Admin Route with Permission Check
```javascript
// Source: kalasetu-backend/routes/adminRoutes.js
import { protectAdmin, checkPermission } from '../middleware/authMiddleware.js';

// Apply to new refund/support routes
router.get('/refunds', protectAdmin, checkPermission('refunds', 'view'), getAllRefunds);
router.post('/refunds/:id/approve', protectAdmin, checkPermission('refunds', 'approve'), approveRefund);
router.post('/refunds/:id/reject', protectAdmin, checkPermission('refunds', 'reject'), rejectRefund);

router.get('/support/tickets', protectAdmin, checkPermission('support', 'view'), getAllTickets);
router.post('/support/tickets/:id/respond', protectAdmin, checkPermission('support', 'respond'), respondToTicket);
router.patch('/support/tickets/:id/close', protectAdmin, checkPermission('support', 'close'), closeTicket);
```

### Example 2: Zod Validation Schema
```javascript
// Source: Pattern from kalasetu-backend/controllers/bookingController.js
import { z } from 'zod';

const createRefundRequestSchema = z.object({
  paymentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID'),
  amount: z.number().min(1, 'Amount must be positive').max(500000, 'Amount too large'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason too long'),
  evidence: z.array(z.object({
    type: z.enum(['image', 'document', 'text']),
    url: z.string().url().optional(),
    description: z.string().max(500).optional()
  })).optional()
});

export const createRefundRequest = asyncHandler(async (req, res) => {
  const parsed = createRefundRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues.map(i => i.message).join(', ')
    });
  }
  // ... rest of handler
});
```

### Example 3: Admin List with Pagination
```javascript
// Source: Pattern from kalasetu-backend/controllers/adminDashboardController.js
export const getAllRefunds = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', startDate, endDate, search } = req.query;
    const query = {};

    if (status !== 'all') query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      const escaped = escapeRegex(search);
      // Search by payment ID, user email, etc.
      const payments = await Payment.find({
        $or: [
          { razorpayPaymentId: { $regex: escaped, $options: 'i' } },
          { razorpayOrderId: { $regex: escaped, $options: 'i' } }
        ]
      }).select('_id');

      if (payments.length > 0) {
        query.payment = { $in: payments.map(p => p._id) };
      } else {
        query._id = { $in: [] }; // No matches
      }
    }

    const refunds = await RefundRequest.find(query)
      .populate('payment')
      .populate('requestedBy')
      .populate('adminResponse.adminId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await RefundRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: refunds,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch refunds' });
  }
};
```

### Example 4: Email Template Extension
```javascript
// Source: Pattern from kalasetu-backend/utils/email.js
export const sendRefundApprovedEmail = async (to, userName, refundRequest) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Refund Approved</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Your refund request has been approved by our team.</p>

          <p><strong>Refund Amount:</strong> ₹${refundRequest.amount.toLocaleString('en-IN')}</p>
          <p><strong>Reason:</strong> ${refundRequest.reason}</p>

          <p>The refund will be processed within 5-7 working days and credited to your original payment method.</p>

          <a href="${process.env.FRONTEND_URL || 'https://kalasetu.com'}/refunds/${refundRequest._id}" class="button">View Refund Status</a>

          <p style="margin-top: 30px;">If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Your Refund Request Has Been Approved - KalaSetu',
    html,
  });
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Immediate refunds without review | Admin-approved workflow | Industry standard since ~2020 | Reduces refund abuse on marketplace platforms; standard for Airbnb, Uber, eBay |
| Email-only notifications | Email + push + in-app | Became standard ~2021 | Higher user engagement; users expect multi-channel alerts |
| Embedded ticket messages | Hybrid (embedded + pagination) or separate collection | MongoDB 16MB limit awareness ~2018 | Prevents document size errors; most ticket systems use separate messages table |
| Polling Razorpay API for status | Webhook-driven updates | Razorpay introduced webhooks ~2019 | Real-time updates; reduces API calls and server load |
| Manual ticket assignment | Auto-assignment or round-robin | Modern help desk standard | Better workload distribution; faster response times |

**Deprecated/outdated:**
- **Storing refund data only in Payment model:** Loses audit trail of refund requests vs. actual refunds (now: separate RefundRequest model)
- **Synchronous Razorpay API calls in request handler:** Risk of timeout (now: async job queue or webhook-driven)
- **Plain text support emails instead of ticket system:** No tracking, searchability, or accountability (now: structured ticket system with status/priority)

## Open Questions

1. **Should refund requests auto-expire after a certain time?**
   - What we know: Razorpay refunds can be initiated within 6 months of payment
   - What's unclear: Business rule for how long users can request refunds (30 days? 60 days?)
   - Recommendation: Default to 30 days from booking completion, make configurable in admin settings

2. **Should admins be able to initiate refunds directly (without user request)?**
   - What we know: Existing admin panel has `processRefund` endpoint (adminRoutes.js:51)
   - What's unclear: Whether this bypasses RefundRequest model or creates one automatically
   - Recommendation: Admin-initiated refunds should create RefundRequest with status "approved" (auto-approved) for consistent audit trail

3. **How should partial refunds be handled?**
   - What we know: Razorpay supports partial refunds, existing refundPayment(paymentId, amount) accepts amount parameter
   - What's unclear: UI for users to specify partial amount vs. full refund
   - Recommendation: Phase 2 allows full or partial (user specifies amount), but validate total refunds don't exceed payment amount (see Pitfall 2)

4. **Should support tickets have file upload capability?**
   - What we know: Project uses Cloudinary for image uploads (artisan profiles, etc.)
   - What's unclear: Whether ticket evidence/attachments warrant same infrastructure
   - Recommendation: Phase 2 includes attachment URLs in SupportTicket schema; actual upload uses existing Cloudinary integration (optional - text-only tickets are functional MVP)

5. **Who should receive support ticket notifications besides assigned admin?**
   - What we know: OneSignal supports segment targeting
   - What's unclear: Business rule for escalation (all admins? specific support team?)
   - Recommendation: Notify all admins with "support" permission on new ticket creation; only assigned admin on updates (reduces noise)

## Sources

### Primary (HIGH confidence)
- Razorpay Refund API Documentation: https://razorpay.com/docs/api/refunds/create-normal/
- Razorpay Refund Webhooks: https://razorpay.com/docs/payments/refunds/
- KalaSetu codebase: kalasetu-backend/controllers/paymentController.js (existing refund infrastructure)
- KalaSetu codebase: kalasetu-backend/models/paymentModel.js (refund fields already present)
- KalaSetu codebase: kalasetu-backend/routes/adminRoutes.js (admin route patterns)
- KalaSetu codebase: kalasetu-backend/utils/razorpay.js (Razorpay SDK integration)
- KalaSetu codebase: kalasetu-backend/utils/email.js (email template patterns)
- KalaSetu codebase: kalasetu-backend/utils/onesignal.js (push notification integration)

### Secondary (MEDIUM confidence)
- [Razorpay Refund Best Practices](https://razorpay.com/docs/payments/refunds/issue/)
- [MongoDB Schema Design Basics](https://www.thecodingdev.com/2026/02/schema-design-basics-in-mongodb.html)
- [Mongoose Enum Best Practices](https://www.geeksforgeeks.org/mongodb/how-to-create-and-use-enum-in-mongoose/)
- [Authorization Workflow Guide with Node.js](https://mvineetsharma.medium.com/authorization-workflow-a-comprehensive-guide-with-node-js-examples-bb6facebe43c)

### Tertiary (LOW confidence)
- None - all findings verified against official docs or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, versions verified in package.json
- Architecture: HIGH - Patterns derived from existing models (bookingModel, paymentModel, notificationModel) and controllers
- Refund workflow: HIGH - Razorpay API verified via official docs; webhook pattern exists in codebase
- Support ticket schema: MEDIUM - Schema design based on industry patterns + codebase conventions (not project-specific requirement doc)
- Pitfalls: MEDIUM-HIGH - Common marketplace/payment pitfalls verified via Razorpay docs; race conditions identified from existing code patterns

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (30 days - Razorpay API is stable, MongoDB patterns are stable, project dependencies frozen until next major version bump)
