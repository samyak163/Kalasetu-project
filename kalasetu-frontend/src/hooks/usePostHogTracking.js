import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPostHogEvent, trackPageView } from '../lib/posthog.js';

/**
 * Custom hook for PostHog tracking
 */
export const usePostHogTracking = () => {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname, {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location]);

  // Track custom events
  const track = (eventName, properties = {}) => {
    trackPostHogEvent(eventName, properties);
  };

  const trackClick = (elementName, properties = {}) => {
    track('Button Clicked', {
      element: elementName,
      ...properties,
    });
  };

  const trackFormSubmit = (formName, success = true, properties = {}) => {
    track('Form Submitted', {
      form: formName,
      success,
      ...properties,
    });
  };

  const trackSearch = (query, resultsCount, properties = {}) => {
    track('Search Performed', {
      query,
      resultsCount,
      ...properties,
    });
  };

  return {
    track,
    trackClick,
    trackFormSubmit,
    trackSearch,
  };
};
