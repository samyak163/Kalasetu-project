# 💼 Real-World Usage Examples

This file contains practical, real-world examples of how to use LogRocket, PostHog, and OneSignal in the Kalasetu project.

---

## 🛒 E-Commerce Flow Example

### Scenario: User browsing and purchasing artisan products

```javascript
// ProductPage.jsx
import { usePostHogTracking } from '../hooks/usePostHogTracking';
import { trackLogRocketEvent } from '../lib/logrocket.js';

function ProductPage({ product }) {
  const { track } = usePostHogTracking();
  
  useEffect(() => {
    // Track product view
    track('Product Viewed', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
      artisan: product.artisanName
    });
    
    trackLogRocketEvent('Product View', {
      productId: product.id,
      source: 'direct'
    });
  }, [product.id]);
  
  const handleAddToCart = () => {
    track('Add to Cart', {
      productId: product.id,
      quantity: 1,
      price: product.price
    });
  };
  
  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### Backend: Send Order Confirmation Notification

```javascript
// orderController.js
import { trackEvent } from '../utils/posthog.js';
import { sendOrderNotification } from '../utils/notificationTemplates.js';

export const createOrder = async (req, res) => {
  const { items, userId, total } = req.body;
  
  // Create order in database
  const order = await Order.create({
    user: userId,
    items,
    total,
    status: 'pending'
  });
  
  // Track in PostHog
  trackEvent(userId, 'Order Created', {
    orderId: order._id,
    itemCount: items.length,
    total,
    paymentMethod: req.body.paymentMethod
  });
  
  // Send push notification
  await sendOrderNotification(userId, order._id, 'pending');
  
  res.json({ success: true, order });
};
```

---

## 🎨 Artisan Profile Views

### Scenario: Track when users view artisan profiles

```javascript
// ArtisanProfilePage.jsx
import { usePostHogTracking } from '../hooks/usePostHogTracking';
import { useParams } from 'react-router-dom';

function ArtisanProfilePage() {
  const { artisanId } = useParams();
  const { track } = usePostHogTracking();
  const [artisan, setArtisan] = useState(null);
  
  useEffect(() => {
    // Fetch artisan data
    fetchArtisan(artisanId).then(data => {
      setArtisan(data);
      
      // Track profile view
      track('Artisan Profile Viewed', {
        artisanId: data.id,
        artisanName: data.fullName,
        craft: data.craft,
        rating: data.rating,
        viewedBy: 'customer' // or 'guest'
      });
    });
  }, [artisanId]);
  
  const handleContactClick = () => {
    track('Contact Artisan Clicked', {
      artisanId: artisan.id,
      method: 'message'
    });
  };
  
  return (
    <div>
      <h1>{artisan?.fullName}</h1>
      <button onClick={handleContactClick}>Contact</button>
    </div>
  );
}
```

### Backend: Notify artisan of profile views

```javascript
// artisanController.js
import { trackEvent } from '../utils/posthog.js';
import { sendProfileViewNotification } from '../utils/notificationTemplates.js';

// Call this daily via cron job
export const sendDailyProfileStats = async () => {
  const artisans = await Artisan.find({ verified: true });
  
  for (const artisan of artisans) {
    const viewsToday = await ProfileView.countDocuments({
      artisanId: artisan._id,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    
    if (viewsToday > 0) {
      // Track in analytics
      trackEvent(artisan._id.toString(), 'Daily Profile Views', {
        count: viewsToday,
        date: new Date().toISOString().split('T')[0]
      });
      
      // Send notification
      await sendProfileViewNotification(
        artisan._id.toString(), 
        viewsToday
      );
    }
  }
};
```

---

## 🔍 Search Analytics

### Scenario: Track search queries and results

```javascript
// ArtisanSearch.jsx
import { usePostHogTracking } from '../hooks/usePostHogTracking';
import { trackLogRocketEvent } from '../lib/logrocket.js';

function ArtisanSearch() {
  const { trackSearch } = usePostHogTracking();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = async () => {
    const searchResults = await searchArtisans(query);
    setResults(searchResults);
    
    // Track search
    trackSearch(query, searchResults.length, {
      filters: { craft: selectedCraft, location: selectedLocation },
      resultsFound: searchResults.length > 0,
      responseTime: Date.now() - searchStartTime
    });
    
    // Track in LogRocket too
    trackLogRocketEvent('Search Performed', {
      query,
      resultsCount: searchResults.length,
      hasFilters: !!selectedCraft || !!selectedLocation
    });
  };
  
  const handleResultClick = (artisan, position) => {
    track('Search Result Clicked', {
      query,
      artisanId: artisan.id,
      position,
      craft: artisan.craft
    });
  };
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      {results.map((artisan, index) => (
        <div onClick={() => handleResultClick(artisan, index)}>
          {artisan.name}
        </div>
      ))}
    </div>
  );
}
```

---

## 💬 Messaging System

### Scenario: Track messages and notify users

```javascript
// MessageThread.jsx
import { usePostHogTracking } from '../hooks/usePostHogTracking';

function MessageThread({ recipientId }) {
  const { track } = usePostHogTracking();
  const [message, setMessage] = useState('');
  
  const sendMessage = async () => {
    const response = await api.post('/api/messages', {
      recipientId,
      content: message
    });
    
    // Track message sent
    track('Message Sent', {
      recipientId,
      messageLength: message.length,
      hasAttachment: false,
      threadId: response.data.threadId
    });
    
    setMessage('');
  };
  
  return (
    <div>
      <textarea 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

### Backend: Send message notification

```javascript
// messageController.js
import { sendMessageNotification } from '../utils/notificationTemplates.js';
import { trackEvent } from '../utils/posthog.js';

export const sendMessage = async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.user._id;
  
  // Save message
  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    content
  });
  
  // Get sender info
  const sender = await User.findById(senderId);
  
  // Track analytics
  trackEvent(recipientId.toString(), 'Message Received', {
    senderId: senderId.toString(),
    senderName: sender.fullName,
    messageLength: content.length
  });
  
  // Send push notification
  await sendMessageNotification(
    recipientId.toString(),
    sender.fullName,
    content
  );
  
  res.json({ success: true, message });
};
```

---

## ⭐ Review System

### Scenario: Track reviews and notify artisans

```javascript
// ReviewForm.jsx
import { usePostHogTracking } from '../hooks/usePostHogTracking';
import { trackLogRocketEvent } from '../lib/logrocket.js';

function ReviewForm({ artisanId }) {
  const { track } = usePostHogTracking();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const submitReview = async () => {
    try {
      await api.post('/api/reviews', {
        artisanId,
        rating,
        comment
      });
      
      // Track successful review
      track('Review Submitted', {
        artisanId,
        rating,
        hasComment: comment.length > 0,
        commentLength: comment.length
      });
      
      trackLogRocketEvent('Review Success', {
        rating,
        artisanId
      });
      
    } catch (error) {
      // Track failed review
      track('Review Failed', {
        artisanId,
        error: error.message
      });
    }
  };
  
  return (
    <div>
      <StarRating value={rating} onChange={setRating} />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={submitReview}>Submit Review</button>
    </div>
  );
}
```

### Backend: Process review and notify artisan

```javascript
// reviewController.js
import { sendReviewNotification } from '../utils/notificationTemplates.js';
import { trackEvent } from '../utils/posthog.js';

export const createReview = async (req, res) => {
  const { artisanId, rating, comment } = req.body;
  const reviewerId = req.user._id;
  
  // Create review
  const review = await Review.create({
    artisan: artisanId,
    reviewer: reviewerId,
    rating,
    comment
  });
  
  // Get reviewer info
  const reviewer = await User.findById(reviewerId);
  
  // Track in analytics
  trackEvent(artisanId.toString(), 'Review Received', {
    rating,
    hasComment: comment.length > 0,
    reviewerId: reviewerId.toString()
  });
  
  // Send notification to artisan
  await sendReviewNotification(
    artisanId.toString(),
    reviewer.fullName,
    rating
  );
  
  res.json({ success: true, review });
};
```

---

## 🎭 Feature Flag Examples

### A/B Test: New Checkout Flow

```javascript
// CheckoutPage.jsx
import FeatureFlag from '../components/FeatureFlag';

function CheckoutPage() {
  return (
    <FeatureFlag 
      flagKey="new-checkout-flow"
      fallback={<OldCheckout />}
    >
      <NewCheckout />
    </FeatureFlag>
  );
}
```

### Gradual Rollout: Premium Features

```javascript
// Dashboard.jsx
import FeatureFlag from '../components/FeatureFlag';

function ArtisanDashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show to premium users only */}
      <FeatureFlag flagKey="premium-analytics">
        {(payload) => (
          <PremiumAnalytics tier={payload?.tier} />
        )}
      </FeatureFlag>
      
      {/* Beta feature - 10% rollout */}
      <FeatureFlag 
        flagKey="ai-recommendations"
        fallback={<p>Coming soon!</p>}
      >
        <AIRecommendations />
      </FeatureFlag>
    </div>
  );
}
```

### Backend Feature Flag

```javascript
// artisanController.js
import { isFeatureEnabled } from '../utils/posthog.js';

export const getArtisanRecommendations = async (req, res) => {
  const userId = req.user._id.toString();
  
  // Check if AI recommendations are enabled for this user
  const hasAI = await isFeatureEnabled(userId, 'ai-recommendations');
  
  let recommendations;
  if (hasAI) {
    recommendations = await getAIRecommendations(userId);
  } else {
    recommendations = await getBasicRecommendations(userId);
  }
  
  res.json({ recommendations, usedAI: hasAI });
};
```

---

## 🎯 Error Tracking Integration

### Scenario: Track errors with context

```javascript
// ErrorBoundary or error handler
import { captureLogRocketException } from '../lib/logrocket.js';
import { captureException } from '../lib/sentry.js';
import { trackPostHogEvent } from '../lib/posthog.js';

function handleError(error, errorInfo) {
  // Capture in Sentry with LogRocket session URL
  captureException(error, {
    errorInfo,
    componentStack: errorInfo.componentStack
  });
  
  // Capture in LogRocket
  captureLogRocketException(error, {
    component: errorInfo.componentStack,
    timestamp: Date.now()
  });
  
  // Track in PostHog
  trackPostHogEvent('Error Occurred', {
    errorMessage: error.message,
    errorType: error.name,
    component: errorInfo.componentStack
  });
}
```

---

## 📊 Dashboard Analytics Example

### Scenario: Track dashboard interactions

```javascript
// ArtisanDashboard.jsx
import { usePostHogTracking } from '../hooks/usePostHogTracking';
import { useLogRocketTracking } from '../hooks/useLogRocketTracking';

function ArtisanDashboard() {
  const { track } = usePostHogTracking();
  const { trackClick } = useLogRocketTracking();
  
  useEffect(() => {
    // Track dashboard visit
    track('Dashboard Visited', {
      timestamp: Date.now(),
      userType: 'artisan'
    });
  }, []);
  
  const handleViewOrders = () => {
    track('Orders Tab Clicked', { source: 'dashboard' });
    trackClick('orders-tab');
  };
  
  const handleViewAnalytics = () => {
    track('Analytics Tab Clicked', { source: 'dashboard' });
    trackClick('analytics-tab');
  };
  
  const handleUpdateProfile = () => {
    track('Update Profile Clicked', { source: 'dashboard' });
    trackClick('update-profile-button');
  };
  
  return (
    <div>
      <button onClick={handleViewOrders}>Orders</button>
      <button onClick={handleViewAnalytics}>Analytics</button>
      <button onClick={handleUpdateProfile}>Update Profile</button>
    </div>
  );
}
```

---

## 🔄 Complete User Journey Example

### Registration → Login → Action → Notification

```javascript
// 1. Registration
// userAuthController.js (Backend)
export const register = async (req, res) => {
  const { email, fullName, password } = req.body;
  
  // Create user
  const user = await User.create({ email, fullName, password });
  
  // Identify in PostHog
  identifyUser(user._id.toString(), {
    email: user.email,
    name: user.fullName,
    accountType: 'customer',
    createdAt: user.createdAt
  });
  
  // Track registration
  trackEvent(user._id.toString(), 'User Registered', {
    method: 'email',
    source: req.body.source || 'organic'
  });
  
  // Send welcome notification
  await sendWelcomeNotification(user._id.toString(), user.fullName);
  
  res.json({ success: true, user });
};

// 2. Login (Frontend)
// CustomerLoginPage.jsx
const handleLogin = async (credentials) => {
  try {
    const response = await userLogin(credentials);
    
    // Track successful login
    track('User Logged In', {
      method: 'email',
      timestamp: Date.now()
    });
    
    navigate('/');
  } catch (error) {
    // Track failed login
    track('Login Failed', {
      error: error.message,
      method: 'email'
    });
  }
};

// 3. Action (Frontend)
// ProductPage.jsx
const handlePurchase = async () => {
  try {
    const order = await createOrder(cartItems);
    
    // Track purchase
    track('Purchase Completed', {
      orderId: order.id,
      total: order.total,
      items: order.items.length
    });
    
    trackLogRocketEvent('Purchase', {
      total: order.total,
      paymentMethod: order.paymentMethod
    });
    
  } catch (error) {
    // Track failed purchase
    track('Purchase Failed', {
      error: error.message,
      cartValue: calculateTotal()
    });
  }
};

// 4. Backend processes and sends notification
// orderController.js
export const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  
  const order = await Order.findByIdAndUpdate(orderId, { status });
  
  // Track status change
  trackEvent(order.userId.toString(), 'Order Status Updated', {
    orderId,
    status,
    previousStatus: order.status
  });
  
  // Send notification
  await sendOrderNotification(order.userId.toString(), orderId, status);
  
  res.json({ success: true, order });
};
```

---

## 🎉 Success!

These examples show how to integrate LogRocket, PostHog, and OneSignal throughout your application. Mix and match based on your needs!

**Remember:**
- Track meaningful events, not everything
- Use descriptive event names
- Include relevant context in properties
- Test thoroughly before deploying
- Monitor your dashboards regularly

Happy tracking! 🚀
