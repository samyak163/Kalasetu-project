import { useEffect, useState } from 'react';
import { isFeatureEnabled, getFeatureFlagPayload } from '../lib/posthog.js';
import PropTypes from 'prop-types';

/**
 * Component to conditionally render based on feature flags
 */
export default function FeatureFlag({ flagKey, children, fallback = null }) {
  const [enabled, setEnabled] = useState(false);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFlag = () => {
      const isEnabled = isFeatureEnabled(flagKey);
      const flagPayload = getFeatureFlagPayload(flagKey);

      setEnabled(isEnabled);
      setPayload(flagPayload);
      setLoading(false);
    };

    checkFlag();
  }, [flagKey]);

  if (loading) {
    return null; // or a loading spinner
  }

  if (!enabled) {
    return fallback;
  }

  // Pass payload to children if it's a function
  if (typeof children === 'function') {
    return children(payload);
  }

  return children;
}

FeatureFlag.propTypes = {
  flagKey: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  fallback: PropTypes.node,
};
