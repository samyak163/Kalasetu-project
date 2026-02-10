import { useEffect } from 'react';

const SEOHelmet = ({ 
  title = 'KalaSetu - Connecting Traditional Artisans',
  description = 'Discover and connect with skilled traditional artisans across India. KalaSetu bridges the gap between artisans and customers.',
  keywords = 'artisans, handicrafts, traditional crafts, India, KalaSetu',
  image = 'https://kalasetu.com/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : 'https://kalasetu.com',
  type = 'website',
  structuredData = null
}) => {
  useEffect(() => {
    document.title = title;
    const updateMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, keywords, image, url, type, structuredData]);
  return null;
};

export default SEOHelmet;


