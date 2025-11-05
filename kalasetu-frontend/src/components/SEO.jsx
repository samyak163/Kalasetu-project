import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'KalaSetu - Artisan Marketplace',
  description = 'Discover and book local artisans for crafts and services.',
  image = '/vite.svg',
  url = 'https://kalasetu.com/',
  type = 'website',
  keywords = 'artisans, crafts, booking, local services',
  jsonLd = null
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;


