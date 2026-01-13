import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
  return (
    <html lang="en">
      <body className={inter.className}>
        <VisitorTracker />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

