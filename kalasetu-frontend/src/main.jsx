import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Initialize Sentry before React
import { initSentry } from './lib/sentry.js';
initSentry();

// Initialize LogRocket before React
import { initLogRocket } from './lib/logrocket.js';
initLogRocket();

// Initialize PostHog
import { initPostHog } from './lib/posthog.js';
initPostHog();

// Initialize OneSignal
import { initOneSignal } from './lib/onesignal.js';
initOneSignal();

// Import Sentry ErrorBoundary
import * as Sentry from '@sentry/react';
import ErrorFallback from './components/ErrorFallback.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthContextProvider>
            <ChatProvider>
              <Sentry.ErrorBoundary fallback={ErrorFallback}>
                <App />
              </Sentry.ErrorBoundary>
            </ChatProvider>
          </AuthContextProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);