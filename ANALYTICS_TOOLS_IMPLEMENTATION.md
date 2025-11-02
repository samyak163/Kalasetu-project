# 🎯 LogRocket, PostHog & OneSignal Implementation Guide

This document provides a complete implementation guide for LogRocket Session Replay, PostHog Analytics, and OneSignal Push Notifications in the Kalasetu project.

---

## 📦 Installed Packages

### Frontend (kalasetu-frontend)
- `logrocket` - Session replay SDK
- `logrocket-react` - React integration for LogRocket
- `posthog-js` - PostHog JavaScript SDK
- `react-onesignal` - OneSignal React SDK

### Backend (kalasetu-backend)
- `posthog-node` - PostHog Node.js SDK

---

## 🔧 Environment Variables

### Frontend (.env)
```env
# LogRocket Session Replay
VITE_LOGROCKET_APP_ID=your_logrocket_app_id

# PostHog Analytics
VITE_POSTHOG_KEY=your_posthog_api_key
VITE_POSTHOG_HOST=https://app.posthog.com

# OneSignal Push Notifications
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
VITE_ONESIGNAL_SAFARI_WEB_ID=your_safari_web_id  # Optional
```

### Backend (.env)
```env
# PostHog Analytics
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_HOST=https://app.posthog.com

# OneSignal Push Notifications
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
```

---

## 3️⃣ LogRocket Session Replay

### ✅ What's Implemented

#### Frontend Files Created:
1. **`kalasetu-frontend/src/lib/logrocket.js`**
   - Session replay initialization
   - User identification
   - Event tracking
   - Exception capture
   - Session URL retrieval
   - Data sanitization (passwords, tokens, credit cards)

2. **`kalasetu-frontend/src/hooks/useLogRocketTracking.js`**
   - Page view tracking
   - Click tracking
   - Form submission tracking
   - Error tracking

#### Integrations:
- **main.jsx**: Initialized before React rendering
- **AuthContext.jsx**: User identification on login
- **sentry.js**: LogRocket session URLs attached to Sentry events

### 🎯 Usage Examples

```javascript
// Track custom event
import { trackLogRocketEvent } from './lib/logrocket.js';
trackLogRocketEvent('Checkout Started', { items: 3, total: 299.99 });

// Use tracking hook in components
import { useLogRocketTracking } from '../hooks/useLogRocketTracking';

function MyComponent() {
  const { trackClick, trackFormSubmit } = useLogRocketTracking();
  
  return (
    <button onClick={() => trackClick('purchase-button')}>
      Buy Now
    </button>
  );
}
```

---

## 4️⃣ PostHog Analytics

### ✅ What's Implemented

#### Backend Files Created:
1. **`kalasetu-backend/utils/posthog.js`**
   - PostHog client initialization
   - Event tracking
   - User identification
   - Feature flags
   - Graceful shutdown

2. **`kalasetu-backend/middleware/analyticsMiddleware.js`**
   - Automatic API request tracking
   - User action tracking middleware

#### Frontend Files Created:
1. **`kalasetu-frontend/src/lib/posthog.js`**
   - PostHog initialization with session recording
   - User identification & reset
   - Event tracking
   - Feature flag checking
   - Page view tracking

2. **`kalasetu-frontend/src/hooks/usePostHogTracking.js`**
   - Automatic page view tracking on route changes
   - Custom event tracking helpers
   - Click, form, and search tracking

3. **`kalasetu-frontend/src/components/FeatureFlag.jsx`**
   - Conditional rendering based on feature flags
   - Support for feature flag payloads

#### Integrations:
- **server.js**: PostHog initialized, analytics middleware added, graceful shutdown
- **main.jsx**: PostHog initialized before React
- **AuthContext.jsx**: User identified on login, reset on logout

### 🎯 Usage Examples

#### Backend - Track Events
```javascript
import { trackEvent, identifyUser } from '../utils/posthog.js';

// Track event
trackEvent(userId, 'Product Viewed', {
  productId: '123',
  category: 'pottery',
  price: 599
});

// Identify user
identifyUser(userId, {
  email: 'user@example.com',
  name: 'John Doe',
  accountType: 'artisan'
});
```

#### Frontend - Use Tracking Hook
```javascript
import { usePostHogTracking } from '../hooks/usePostHogTracking';

function SearchPage() {
  const { trackSearch } = usePostHogTracking();
  
  const handleSearch = (query, results) => {
    trackSearch(query, results.length);
  };
  
  // Component code...
}
```

#### Frontend - Feature Flags
```javascript
import FeatureFlag from '../components/FeatureFlag';

function MyComponent() {
  return (
    <FeatureFlag 
      flagKey="new-checkout-flow"
      fallback={<OldCheckout />}
    >
      <NewCheckout />
    </FeatureFlag>
  );
}

// With payload
<FeatureFlag flagKey="premium-features">
  {(payload) => (
    <PremiumFeatures tier={payload?.tier} />
  )}
</FeatureFlag>
```

---

## 5️⃣ OneSignal Push Notifications

### ✅ What's Implemented

#### Backend Files Created:
1. **`kalasetu-backend/utils/onesignal.js`**
   - OneSignal REST API client
   - Send to specific user(s)
   - Broadcast notifications
   - Segment notifications
   - Notification history
   - Cancel notifications

2. **`kalasetu-backend/utils/notificationTemplates.js`**
   - Welcome notification
   - Order status notifications
   - Message notifications
   - Review notifications
   - Profile view notifications

3. **`kalasetu-backend/controllers/notificationController.js`**
   - API endpoints for sending notifications
   - Notification history retrieval
   - Cancel notifications

4. **`kalasetu-backend/routes/notificationRoutes.js`**
   - Protected notification routes

#### Frontend Files Created:
1. **`kalasetu-frontend/src/lib/onesignal.js`**
   - OneSignal initialization
   - User ID management
   - Subscription status
   - Permission requests
   - Tag management
   - Notification handlers

2. **`kalasetu-frontend/src/components/NotificationPrompt.jsx`**
   - User-friendly notification permission prompt
   - Auto-shows after 5 seconds
   - Dismissible with localStorage memory

3. **`kalasetu-frontend/src/hooks/useNotifications.js`**
   - Notification click handlers
   - Navigation based on notification type
   - Subscription status tracking

#### Integrations:
- **server.js**: Notification routes added
- **main.jsx**: OneSignal initialized
- **AuthContext.jsx**: User ID set on login, removed on logout, tags added

### 🎯 Usage Examples

#### Backend - Send Notifications
```javascript
import { sendNotificationToUser } from '../utils/onesignal.js';
import { sendWelcomeNotification } from '../utils/notificationTemplates.js';

// Send custom notification
await sendNotificationToUser(userId, {
  title: 'New Order!',
  message: 'You have a new order from John Doe',
  url: '/orders/123',
  data: { orderId: '123', type: 'order' }
});

// Use template
await sendWelcomeNotification(userId, 'John Doe');
```

#### Backend - API Endpoints
```bash
# Send to specific user
POST /api/notifications/send-to-user
{
  "userId": "user123",
  "title": "New Message",
  "message": "You have a new message",
  "url": "/messages"
}

# Broadcast to all users
POST /api/notifications/broadcast
{
  "title": "Platform Update",
  "message": "Check out our new features!"
}

# Get notification history
GET /api/notifications/history?limit=50&offset=0
```

#### Frontend - Use in Components
```javascript
import { useNotifications } from '../hooks/useNotifications';
import NotificationPrompt from '../components/NotificationPrompt';

function App() {
  const { subscribed } = useNotifications();
  
  return (
    <>
      <YourApp />
      <NotificationPrompt />
    </>
  );
}
```

---

## 🔄 Integration Flow

### User Login Flow
1. User logs in (artisan or customer)
2. **Sentry**: User context set
3. **LogRocket**: User identified with ID and details
4. **PostHog**: User identified for analytics
5. **OneSignal**: External user ID set, tags added

### User Logout Flow
1. User clicks logout
2. **Sentry**: User context cleared
3. **LogRocket**: Session continues (for debugging)
4. **PostHog**: User session reset
5. **OneSignal**: External user ID removed

### Page Navigation
1. Route changes
2. **PostHog**: Page view tracked automatically
3. **LogRocket**: Page view recorded in session

### API Request
1. User makes API request
2. **Analytics Middleware**: Tracks request metadata
3. **PostHog**: Event sent with duration, status, path

### Error Occurs
1. Error thrown in app
2. **Sentry**: Error captured with LogRocket session URL
3. **LogRocket**: Exception captured with context

---

## 🧪 Testing Checklist

### LogRocket ✅
- [ ] LogRocket initialized on app load
- [ ] User identified after login
- [ ] Page views tracked
- [ ] Custom events tracked
- [ ] Session URL captured
- [ ] Sensitive data sanitized (check network tab)
- [ ] LogRocket session URL in Sentry errors

### PostHog ✅
- [ ] PostHog initialized (backend & frontend)
- [ ] Events tracked on API calls (backend)
- [ ] User identified on registration/login
- [ ] Page views tracked automatically (frontend)
- [ ] Custom events tracked (frontend)
- [ ] Feature flags checked correctly
- [ ] User reset on logout
- [ ] Session recording works

### OneSignal ✅
- [ ] OneSignal initialized on frontend
- [ ] Permission prompt shows after 5 seconds
- [ ] User can subscribe to notifications
- [ ] External user ID set after login
- [ ] Tags added for segmentation
- [ ] Notification click handlers work
- [ ] Backend can send to specific user
- [ ] Backend can send to multiple users
- [ ] Backend can broadcast to all users
- [ ] Notification templates work
- [ ] Notifications delivered successfully

---

## 🚀 Deployment Checklist

### Before Deploying:

1. **Set Environment Variables**
   - Add all required API keys to your hosting platform
   - Verify frontend build has access to VITE_ prefixed vars
   - Verify backend has access to all required vars

2. **OneSignal Web Push Setup**
   - Configure your website URL in OneSignal dashboard
   - Upload `OneSignalSDKWorker.js` to your public folder
   - Set up Safari Web Push ID (if supporting Safari)

3. **PostHog Setup**
   - Create PostHog project
   - Set up feature flags if using
   - Configure session recording settings

4. **LogRocket Setup**
   - Create LogRocket project
   - Configure privacy settings
   - Set up Sentry integration in LogRocket dashboard

5. **Test in Production-like Environment**
   - Verify all services initialize
   - Check network requests for API keys
   - Test notification delivery
   - Verify analytics events are received

---

## 📚 Additional Resources

### LogRocket
- Docs: https://docs.logrocket.com/
- React Guide: https://docs.logrocket.com/docs/react

### PostHog
- Docs: https://posthog.com/docs
- Feature Flags: https://posthog.com/docs/feature-flags
- Session Recording: https://posthog.com/docs/session-replay

### OneSignal
- Docs: https://documentation.onesignal.com/
- Web Push: https://documentation.onesignal.com/docs/web-push-quickstart
- React: https://documentation.onesignal.com/docs/react-sdk

---

## 🐛 Troubleshooting

### LogRocket not recording
- Check that `VITE_LOGROCKET_APP_ID` is set correctly
- Verify app ID matches LogRocket dashboard
- Check browser console for errors
- Ensure initLogRocket() is called before React renders

### PostHog events not showing
- Verify API key is correct for both frontend and backend
- Check that PostHog host URL is correct
- In dev mode, PostHog debug mode is enabled (check console)
- Events may take a few seconds to appear in PostHog

### OneSignal notifications not working
- Verify OneSignal app ID and REST API key
- Check that service worker is accessible at `/OneSignalSDKWorker.js`
- User must grant notification permission
- Test in HTTPS environment (required for web push)
- Check OneSignal dashboard for delivery status

### Feature flags not working
- Ensure user is identified before checking flags
- Verify feature flag exists in PostHog dashboard
- Check flag is enabled for your user/environment
- Feature flags require PostHog to be fully initialized

---

## ✅ Summary

All three tools have been successfully integrated into the Kalasetu project:

1. **LogRocket Session Replay** - Records user sessions for debugging
2. **PostHog Analytics** - Tracks events and provides feature flags
3. **OneSignal Push Notifications** - Sends push notifications to users

All tools follow the configuration pattern from `env.config.js` and include proper error handling, logging, and privacy considerations.

**Next Steps:**
1. Add your API keys to environment variables
2. Test each tool in development
3. Deploy to staging environment for full testing
4. Monitor dashboards for incoming data
5. Configure additional features (feature flags, segments, etc.)
