import { useEffect } from 'react';
import { trackLogRocketEvent, addLogRocketTag } from '../lib/logrocket.js';

/**
 * Custom hook for tracking page views and events
 */
export const useLogRocketTracking = () => {
  // Track page views
  useEffect(() => {
    trackLogRocketEvent('Page View', {
      path: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer,
    });
  }, []);

  // Track user interactions
  const trackClick = (elementName, properties = {}) => {
    trackLogRocketEvent('Button Click', {
      element: elementName,
      ...properties,
    });
  };

  const trackFormSubmit = (formName, success = true, properties = {}) => {
    trackLogRocketEvent('Form Submit', {
      form: formName,
      success,
      ...properties,
    });
  };

  const trackError = (errorType, errorMessage, properties = {}) => {
    trackLogRocketEvent('Error Occurred', {
      type: errorType,
      message: errorMessage,
      ...properties,
    });
    addLogRocketTag('has-error', 'true');
  };

  return {
    trackClick,
    trackFormSubmit,
    trackError,
  };
};
