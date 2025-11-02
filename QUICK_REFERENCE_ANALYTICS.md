# 🚀 Quick Reference Guide - Analytics Tools

## 📋 Quick Start

### 1. Environment Setup
Copy these to your `.env` files:

**Frontend (.env):**
```env
VITE_LOGROCKET_APP_ID=your_app_id
VITE_POSTHOG_KEY=your_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_ONESIGNAL_APP_ID=your_app_id
```

**Backend (.env):**
```env
POSTHOG_API_KEY=your_api_key
ONESIGNAL_APP_ID=your_app_id
ONESIGNAL_REST_API_KEY=your_rest_api_key
```

---

## 🎬 LogRocket - Track User Actions

```javascript
import { trackLogRocketEvent } from './lib/logrocket.js';
import { useLogRocketTracking } from '../hooks/useLogRocketTracking';

// Track custom event
trackLogRocketEvent('Purchase', { amount: 99.99, items: 3 });

// Use hook in component
function MyComponent() {
  const { trackClick, trackFormSubmit } = useLogRocketTracking();
  
  return (
    <button onClick={() => trackClick('buy-now')}>
      Buy Now
    </button>
  );
}
```

---

## 📊 PostHog - Analytics & Feature Flags

### Track Events
```javascript
import { usePostHogTracking } from '../hooks/usePostHogTracking';

function MyComponent() {
  const { track, trackClick, trackFormSubmit } = usePostHogTracking();
  
  const handleSearch = () => {
    track('Search Performed', { query: 'pottery', results: 15 });
  };
}
```

### Feature Flags
```javascript
import FeatureFlag from '../components/FeatureFlag';

// Simple flag
<FeatureFlag flagKey="new-feature" fallback={<OldFeature />}>
  <NewFeature />
</FeatureFlag>

// With payload
<FeatureFlag flagKey="premium-tier">
  {(payload) => <Features tier={payload?.tier} />}
</FeatureFlag>
```

### Backend Analytics
```javascript
import { trackEvent } from '../utils/posthog.js';

// In controller
trackEvent(userId, 'Profile Updated', { 
  fields: ['name', 'email'], 
  timestamp: Date.now() 
});
```

---

## 🔔 OneSignal - Push Notifications

### Backend - Send Notifications
```javascript
import { sendNotificationToUser } from '../utils/onesignal.js';
import { sendWelcomeNotification, sendOrderNotification } from '../utils/notificationTemplates.js';

// Custom notification
await sendNotificationToUser(userId, {
  title: 'New Message',
  message: 'You have a new message from John',
  url: '/messages',
  data: { type: 'message', senderId: '123' }
});

// Template notification
await sendWelcomeNotification(userId, 'John Doe');
await sendOrderNotification(userId, orderId, 'shipped');
```

### Frontend - Notification Management
```javascript
import { requestNotificationPermission, addTags } from '../lib/onesignal.js';
import { useNotifications } from '../hooks/useNotifications';

// Request permission
const handleEnableNotifications = async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    console.log('Notifications enabled!');
  }
};

// Check subscription status
function MyComponent() {
  const { subscribed } = useNotifications();
  
  return subscribed ? <span>🔔 Enabled</span> : <EnableButton />;
}
```

---

## 🎯 Common Patterns

### Track Button Click
```javascript
const { trackClick } = useLogRocketTracking();
const { trackClick: trackPostHogClick } = usePostHogTracking();

<button onClick={() => {
  trackClick('checkout-button');
  trackPostHogClick('checkout-button', { cart_value: 299 });
}}>
  Checkout
</button>
```

### Track Form Submission
```javascript
const { trackFormSubmit } = useLogRocketTracking();

const handleSubmit = async (data) => {
  try {
    await api.post('/contact', data);
    trackFormSubmit('contact-form', true);
  } catch (error) {
    trackFormSubmit('contact-form', false, { error: error.message });
  }
};
```

### Send Notification After Action
```javascript
// Backend controller
import { sendOrderNotification } from '../utils/notificationTemplates.js';
import { trackEvent } from '../utils/posthog.js';

export const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  
  // Update order in database
  const order = await Order.findByIdAndUpdate(orderId, { status });
  
  // Track event
  trackEvent(order.userId, 'Order Status Updated', { orderId, status });
  
  // Send notification
  await sendOrderNotification(order.userId, orderId, status);
  
  res.json({ success: true, order });
};
```

---

## 🔍 Debug Checklist

### Not working? Check these:

**LogRocket:**
- ✅ App ID in `.env` correct?
- ✅ Console shows "✅ LogRocket initialized"?
- ✅ Session appears in LogRocket dashboard?

**PostHog:**
- ✅ API key in `.env` correct?
- ✅ Console shows "✅ PostHog initialized"?
- ✅ Events appearing in PostHog (may take 10-30 seconds)?
- ✅ Feature flag created in PostHog dashboard?

**OneSignal:**
- ✅ App ID and REST API key correct?
- ✅ HTTPS environment (required for web push)?
- ✅ User granted notification permission?
- ✅ Service worker accessible?
- ✅ Console shows "✅ OneSignal initialized"?

---

## 📱 Test Commands

```bash
# Frontend - Check if packages installed
cd kalasetu-frontend
npm list logrocket logrocket-react posthog-js react-onesignal

# Backend - Check if packages installed
cd kalasetu-backend
npm list posthog-node

# Start development servers
cd kalasetu-frontend && npm run dev
cd kalasetu-backend && npm run dev
```

---

## 🎨 Component Examples

### Add Notification Prompt to App
```javascript
// In App.jsx or Layout.jsx
import NotificationPrompt from './components/NotificationPrompt';
import { useNotifications } from './hooks/useNotifications';

function App() {
  useNotifications(); // Set up notification handlers
  
  return (
    <>
      <YourAppContent />
      <NotificationPrompt />
    </>
  );
}
```

### Feature Flag Example
```javascript
// Show new dashboard to beta users
<FeatureFlag flagKey="beta-dashboard" fallback={<OldDashboard />}>
  <NewBetaDashboard />
</FeatureFlag>

// A/B test checkout flow
<FeatureFlag flagKey="checkout-variant">
  {(payload) => (
    payload?.variant === 'A' 
      ? <CheckoutA /> 
      : <CheckoutB />
  )}
</FeatureFlag>
```

---

## 🔗 Dashboard Links

After setup, access your dashboards:

- **LogRocket**: https://app.logrocket.com/
- **PostHog**: https://app.posthog.com/
- **OneSignal**: https://app.onesignal.com/

---

## 💡 Pro Tips

1. **LogRocket**: Sessions are automatically recorded. View them in the dashboard to see exactly what users see.

2. **PostHog**: Use feature flags for gradual rollouts. Start at 10%, monitor, then increase.

3. **OneSignal**: Segment users with tags for targeted notifications. Example: `artisan`, `premium-user`, `new-user`.

4. **All Tools**: They're disabled in development by default (check console). Set enabled: true in config to test.

5. **Privacy**: All tools sanitize sensitive data (passwords, tokens). Check `logrocket.js` for sanitization rules.

---

## 🚨 Important Notes

- All tools are **optional** - They won't break your app if not configured
- Services are **disabled** if API keys are missing
- **No user data** is sent without proper consent
- Tools work in **production mode** - Some features limited in development
- **HTTPS required** for OneSignal web push notifications

---

## 📞 Support

If you encounter issues:
1. Check console logs for error messages
2. Verify API keys are correct
3. Check service dashboards for incoming data
4. Review implementation in `ANALYTICS_TOOLS_IMPLEMENTATION.md`
5. Contact support for each service if needed

---

## ✅ You're All Set!

Your Kalasetu project now has:
- 🎬 **Session Replay** with LogRocket
- 📊 **Analytics & Feature Flags** with PostHog  
- 🔔 **Push Notifications** with OneSignal

Start tracking user behavior, testing features, and engaging users!
