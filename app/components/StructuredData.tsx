// Structured Data (JSON-LD) for SEO
// Helps Google understand your content better

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'Product'
  data?: any
}

export default function StructuredData({ type, data = {} }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://expira.io'

    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'expira',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          description: 'Automatically monitor website expiration, SSL certificates, domains, and APIs.',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@expira.io',
            url: `${baseUrl}/contact`,
          },
          sameAs: [
            // Add social media links here when available
            // 'https://twitter.com/expira',
            // 'https://linkedin.com/company/expira',
          ],
        }

      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'expira',
          url: baseUrl,
          description: 'Automatically monitor website expiration, SSL certificates, domains, and APIs.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }

      case 'SoftwareApplication':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'expira',
          applicationCategory: 'WebApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '9.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1250',
          },
          description: 'Automatically monitor website expiration, SSL certificates, domains, and APIs. Get instant notifications before they expire.',
        }

      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name || 'expira Professional',
          description: data.description || 'Ideal for growing businesses. Monitor up to 100 products with hourly checks, email + SMS notifications.',
          brand: {
            '@type': 'Brand',
            name: 'expira',
          },
          offers: {
            '@type': 'Offer',
            price: data.price || '29.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `${baseUrl}/pricing`,
          },
        }

      default:
        return {}
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
    />
  )
}

