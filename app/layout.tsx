import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import VisitorTracker from '@/components/VisitorTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://expira.io'),
  title: {
    default: 'expira - Monitor & Verify Your Online Products',
    template: '%s | expira',
  },
  description: 'Automatically monitor website expiration, SSL certificates, domains, and APIs. Get instant notifications before they expire. Never miss an expiration again with expira.',
  keywords: [
    'website monitoring',
    'SSL certificate monitoring',
    'domain expiration',
    'API monitoring',
    'uptime monitoring',
    'website uptime',
    'domain monitoring',
    'SSL monitoring',
    'expiration tracking',
    'website health check',
    'domain expiry',
    'certificate expiry',
    'automated monitoring',
    'website status',
    'domain status',
  ],
  authors: [{ name: 'expira', url: 'https://expira.io' }],
  creator: 'expira',
  publisher: 'expira',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://expira.io',
    siteName: 'expira',
    title: 'expira - Monitor & Verify Your Online Products',
    description: 'Automatically monitor website expiration, SSL certificates, domains, and APIs. Get instant notifications before they expire.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'expira - Monitor & Verify Your Online Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'expira - Monitor & Verify Your Online Products',
    description: 'Automatically monitor website expiration, SSL certificates, domains, and APIs. Get instant notifications before they expire.',
    images: ['/og-image.png'],
    creator: '@expira',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  alternates: {
    canonical: 'https://expira.io',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WHGMM3NB'

  return (
    <html lang="en">
      <head>
        {/* Preload translations for faster loading */}
        <link rel="preload" href="/messages/en.json" as="fetch" crossOrigin="anonymous" />
        {/* Google Tag Manager - Inline script in head as recommended by Google */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
        {/* Preload current locale translations */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var locale=document.cookie.split('; ').find(function(r){return r.startsWith('NEXT_LOCALE=');});if(locale){locale=locale.split('=')[1];if(locale&&locale!=='en'){var link=document.createElement('link');link.rel='preload';link.href='/messages/'+locale+'.json';link.as='fetch';link.crossOrigin='anonymous';document.head.appendChild(link);}}})();`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <VisitorTracker />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

