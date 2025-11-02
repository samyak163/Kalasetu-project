# Integration Setup Guide

This document outlines the setup for Algolia Search and Sentry Error Tracking integrations.

## Prerequisites

### Backend Dependencies
```bash
cd kalasetu-backend
npm install algoliasearch @sentry/node @sentry/profiling-node
```

### Frontend Dependencies
```bash
cd kalasetu-frontend
npm install algoliasearch react-instantsearch @sentry/react
```

## Environment Variables

### Backend (.env)

Add these to your `kalasetu-backend/.env` file:

```env
# Algolia Search
ALGOLIA_APP_ID=your_app_id_here
ALGOLIA_ADMIN_KEY=your_admin_api_key_here
ALGOLIA_SEARCH_KEY=your_search_api_key_here
ALGOLIA_INDEX_NAME=artisans

# Sentry Error Tracking
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development  # or production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Frontend (.env)

Add these to your `kalasetu-frontend/.env` file:

```env
# Algolia Search
VITE_ALGOLIA_APP_ID=your_app_id_here
VITE_ALGOLIA_SEARCH_KEY=your_search_api_key_here
VITE_ALGOLIA_INDEX_NAME=artisans

# Sentry Error Tracking
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=development  # or production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Setup Instructions

### 1. Algolia Setup

1. Sign up for a free Algolia account at https://www.algolia.com
2. Create a new application
3. Go to API Keys section
4. Copy your Application ID
5. Generate a new Admin API Key (save it securely!)
6. Generate a new Search-Only API Key for frontend
7. Create an index named `artisans`

### 2. Bulk Index Existing Artisans

If you have existing artisans in your database, run the bulk indexing script:

```bash
cd kalasetu-backend
node scripts/indexArtisans.js
```

This will:
- Configure the Algolia index settings
- Fetch all artisans from your database
- Bulk index them to Algolia

### 3. Sentry Setup

1. Sign up for a free Sentry account at https://sentry.io
2. Create a new project (select Node.js for backend, React for frontend)
3. Copy the DSN from your project settings
4. Add the DSN to your environment variables

### 4. Test the Integrations

#### Test Algolia Search (Backend)
```bash
curl http://localhost:5000/api/search/artisans?query=pottery
```

#### Test Algolia Facets (Backend)
```bash
curl http://localhost:5000/api/search/facets
```

#### Test Sentry Error Capture
To test if Sentry is capturing errors properly:
1. Trigger an error in your application
2. Check your Sentry dashboard for the error
3. In development mode, errors are logged but not sent to Sentry

## Usage

### Using Algolia Search in Frontend

```jsx
import ArtisanSearch from './components/ArtisanSearch';

function App() {
  return (
    <div>
      <ArtisanSearch />
    </div>
  );
}
```

### Using Sentry Manually

#### Backend
```javascript
import { captureException, captureMessage } from './utils/sentry.js';

try {
  // your code
} catch (error) {
  captureException(error, { context: { userId: req.user.id } });
}

// Or capture a message
captureMessage('Something important happened', 'info');
```

#### Frontend
```javascript
import { captureException, captureMessage } from './lib/sentry.js';

try {
  // your code
} catch (error) {
  captureException(error);
}

// Or capture a message
captureMessage('User clicked button', 'info');
```

## Features

### Algolia Search

✅ Automatic indexing on artisan creation
✅ Typo-tolerant search
✅ Fast results
✅ Search highlighting
✅ Faceted search support
✅ Configurable index settings

### Sentry Error Tracking

✅ Automatic error capture
✅ User context tracking
✅ Performance monitoring
✅ Session replay (frontend)
✅ Development mode filtering
✅ Error filtering

## Troubleshooting

### Algolia Not Indexing

1. Check that `SEARCH_CONFIG.enabled` is `true` in `env.config.js`
2. Verify your API keys are correct
3. Check the backend logs for Algolia errors
4. Ensure the index exists in your Algolia dashboard

### Sentry Not Capturing Errors

1. Check that `ERROR_TRACKING_CONFIG.enabled` is `true`
2. Verify your DSN is correct
3. In development mode, errors are only logged, not sent
4. Check browser console for Sentry initialization messages

### Import Errors

If you see import errors for Algolia or Sentry:
1. Make sure you've installed the dependencies
2. Restart your development server
3. Clear node_modules and reinstall if needed

## Configuration

Both services can be disabled or configured via the `env.config.js` files:

- Set `enabled: false` to disable a service
- Modify configuration objects to change behavior
- Add or remove integrations as needed

## Additional Resources

- [Algolia Documentation](https://www.algolia.com/doc/)
- [Sentry Documentation](https://docs.sentry.io/)
- [Algolia Search UI Components](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react-hooks/)

