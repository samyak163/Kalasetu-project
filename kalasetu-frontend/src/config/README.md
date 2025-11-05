# Configuration Directory

This directory contains centralized configuration files for the Kalasetu frontend application.

## Files

### `env.config.js`

Central configuration file that exports all environment variables and service configurations.

## Usage

### Importing Configurations

```javascript
// Import specific configurations
import { API_CONFIG, FIREBASE_CONFIG, CLOUDINARY_CONFIG } from '../config/env.config.js';

// Or import everything
import config from '../config/env.config.js';
```

### Example Usage

#### API Configuration
```javascript
import { API_CONFIG } from '../config/env.config.js';
import axios from 'axios';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});
```

#### Firebase Configuration
```javascript
import { FIREBASE_CONFIG } from '../config/env.config.js';
import { initializeApp } from 'firebase/app';

const app = initializeApp(FIREBASE_CONFIG);
```

#### Cloudinary Configuration
```javascript
import { CLOUDINARY_CONFIG } from '../config/env.config.js';

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.defaultFolder);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  return response.json();
};
```

## Available Configurations

### Active Services (Configured)
- ✅ `API_CONFIG` - Backend API configuration
- ✅ `FIREBASE_CONFIG` - Firebase authentication
- ✅ `CLOUDINARY_CONFIG` - Image upload service

### Future Services (Prepared but disabled)
- 🔧 `SEARCH_CONFIG` - Algolia/Meilisearch (Search & Discovery)
- 🔧 `SMS_CONFIG` - Twilio/MSG91/Kaleyra (SMS notifications)
- 🔧 `EMAIL_CONFIG` - Resend/SendGrid/SES (Email service)
- 🔧 `PUSH_CONFIG` - OneSignal/FCM (Push notifications)
- 🔧 `ANALYTICS_CONFIG` - Mixpanel/PostHog/Amplitude (Analytics)
- 🔧 `ERROR_TRACKING_CONFIG` - Sentry (Error tracking)
- 🔧 `SESSION_REPLAY_CONFIG` - LogRocket/FullStory (Session replay)
- 🔧 `MAPS_CONFIG` - Google Maps/Mapbox (Maps & location)
- 🔧 `CHAT_CONFIG` - Stream/SendBird/Socket.io (Real-time chat)
- 🔧 `VIDEO_CONFIG` - Agora/Twilio/Daily (Video calls)
- 🔧 `SUPPORT_CONFIG` - Intercom/Zendesk/Freshdesk (USER support)
- 🔧 `AB_TESTING_CONFIG` - Optimizely/PostHog/VWO (A/B testing)
- 🔧 `APP_CONFIG` - General app metadata

## Environment Variables

### Required (Active Services)
```env
# API
VITE_API_URL=https://your-api-url.com

# Firebase
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### Optional (Future Services)
Refer to `env.config.js` for all available environment variables for future integrations.

## Enabling New Services

To enable a new service:

1. Set the `enabled` flag to `true` in the config
2. Add the required environment variables to your `.env` file
3. Import and use the configuration in your components

Example:
```javascript
import { SEARCH_CONFIG } from '../config/env.config.js';

// Enable in env.config.js
export const SEARCH_CONFIG = {
  enabled: true, // Changed from false
  apiKey: import.meta.env.VITE_ALGOLIA_API_KEY,
  appId: import.meta.env.VITE_ALGOLIA_APP_ID,
  indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'artisans',
};
```

## Benefits

- ✅ **Centralized Configuration**: All environment variables in one place
- ✅ **Type Safety**: Easy to validate and document configurations
- ✅ **Scalability**: Ready for future integrations
- ✅ **Maintainability**: Easy to update and manage
- ✅ **Developer Experience**: Clear structure and documentation
- ✅ **Migration Path**: Prepared for 15+ future services

## Notes

- All configurations use Vite's `import.meta.env` syntax
- Future services are disabled by default (`enabled: false`)
- Default values are provided where applicable
- Service configurations follow a consistent pattern
