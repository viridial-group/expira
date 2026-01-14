import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://expira.io'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/contact',
          '/affiliate',
          '/faq',
          '/terms',
          '/privacy',
          '/login',
          '/register',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/_next/',
          '/admin/',
          '/reset-password',
          '/forgot-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/pricing',
          '/contact',
          '/affiliate',
          '/faq',
          '/terms',
          '/privacy',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/login',
          '/register',
          '/reset-password',
          '/forgot-password',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/pricing',
          '/contact',
          '/affiliate',
          '/faq',
          '/terms',
          '/privacy',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/login',
          '/register',
          '/reset-password',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

