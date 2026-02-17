import { useEffect } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_DESCRIPTION = 'Connect with skilled traditional artisans across India';
const SITE_NAME = 'KalaSetu - India\'s Artisan Marketplace';

/**
 * Sets and manages meta tags for SEO and social sharing.
 * Uses direct DOM manipulation — no external dependencies.
 */
const SEOHead = ({ title, description, image, url }) => {
  useEffect(() => {
    const originalTitle = document.title;
    const formattedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const metaDescription = description || DEFAULT_DESCRIPTION;

    // Set document title
    document.title = formattedTitle;

    // Track only newly created tags for cleanup; pre-existing ones are updated but not removed
    const createdTags = [];
    const previousValues = [];

    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (el) {
        // Tag existed — save previous value for restore
        previousValues.push({ el, attr, key, content: el.getAttribute('content') });
        el.setAttribute('content', content);
      } else {
        // New tag — track for removal on unmount
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('content', content);
        document.head.appendChild(el);
        createdTags.push(el);
      }
    };

    setMeta('name', 'description', metaDescription);
    setMeta('property', 'og:title', formattedTitle);
    setMeta('property', 'og:description', metaDescription);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', formattedTitle);
    setMeta('name', 'twitter:description', metaDescription);

    return () => {
      // Restore original title
      document.title = originalTitle;

      // Remove tags we created
      createdTags.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });

      // Restore previous values for pre-existing tags
      previousValues.forEach(({ el, content }) => {
        el.setAttribute('content', content);
      });
    };
  }, [title, description, image, url]);

  return null;
};

SEOHead.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
};

export default SEOHead;
