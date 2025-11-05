import Artisan from '../models/artisanModel.js';

export const getArtisanSEO = async (req, res) => {
  try {
    const { publicId } = req.params;
    const artisan = await Artisan.findOne({ publicId })
      .select('fullName bio skills location profileImageUrl rating reviewCount')
      .lean();
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan not found' });
    }

    const skillsList = Array.isArray(artisan.skills) ? artisan.skills.slice(0, 3).join(', ') : '';
    const description = artisan.bio
      ? String(artisan.bio).substring(0, 160)
      : `Connect with ${artisan.fullName}, a skilled artisan specializing in ${skillsList}.`;

    const seoData = {
      title: `${artisan.fullName} - Traditional Artisan | KalaSetu`,
      description,
      keywords: [
        artisan.fullName,
        ...(artisan.skills || []),
        'traditional artisan',
        'handicrafts',
        'KalaSetu',
        artisan?.location?.city,
        artisan?.location?.state,
      ]
        .filter(Boolean)
        .join(', '),
      image: artisan.profileImageUrl || artisan.profilePicture || 'https://kalasetu.com/default-artisan.jpg',
      url: `https://kalasetu.com/artisan/${publicId}`,
      type: 'profile',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: artisan.fullName,
        description: artisan.bio,
        image: artisan.profileImageUrl || artisan.profilePicture,
        url: `https://kalasetu.com/artisan/${publicId}`,
        aggregateRating:
          artisan.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: artisan.rating,
                reviewCount: artisan.reviewCount || 0,
              }
            : undefined,
        address:
          artisan?.location?.city || artisan?.location?.state
            ? {
                '@type': 'PostalAddress',
                addressLocality: artisan?.location?.city,
                addressRegion: artisan?.location?.state,
                addressCountry: 'IN',
              }
            : undefined,
      },
    };

    res.json({ success: true, seo: seoData });
  } catch (error) {
    console.error('SEO generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate SEO data' });
  }
};

export const getSitemapData = async (req, res) => {
  try {
    const artisans = await Artisan.find().select('publicId updatedAt').lean();
    const sitemapData = {
      static: [
        { url: '/', priority: 1.0, changefreq: 'daily' },
        { url: '/search', priority: 0.9, changefreq: 'daily' },
        { url: '/artisan/register', priority: 0.7, changefreq: 'monthly' },
        { url: '/user/register', priority: 0.7, changefreq: 'monthly' },
      ],
      artisans: artisans.map((a) => ({
        url: `/${a.publicId}`,
        lastmod: a.updatedAt,
        priority: 0.8,
        changefreq: 'weekly',
      })),
    };
    res.json({ success: true, sitemap: sitemapData });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate sitemap' });
  }
};


export const getSitemapXml = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://kalasetu.com';
    const artisans = await Artisan.find().select('publicId updatedAt').lean();

    let xml = '';
    xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const addUrl = (loc, changefreq = 'weekly', priority = '0.8', lastmod) => {
      xml += '<url>';
      xml += `<loc>${baseUrl}${loc}</loc>`;
      if (lastmod) xml += `<lastmod>${new Date(lastmod).toISOString()}</lastmod>`;
      xml += `<changefreq>${changefreq}</changefreq>`;
      xml += `<priority>${priority}</priority>`;
      xml += '</url>\n';
    };

    addUrl('/', 'daily', '1.0');
    addUrl('/search', 'daily', '0.9');
    addUrl('/artisan/register', 'monthly', '0.7');
    addUrl('/user/register', 'monthly', '0.7');
    addUrl('/privacy', 'monthly', '0.3');
    addUrl('/terms', 'monthly', '0.3');
    addUrl('/shipping', 'monthly', '0.3');
    addUrl('/refunds', 'monthly', '0.3');

    artisans.forEach((a) => addUrl(`/${a.publicId}`, 'weekly', '0.8', a.updatedAt));

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap XML error:', error);
    res.status(500).send('');
  }
};


