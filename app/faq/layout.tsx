import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | expira',
  description: 'Find answers to common questions about expira, our monitoring service for websites, SSL certificates, domains, and APIs. Learn about pricing, features, and how to get started.',
  keywords: 'expira FAQ, monitoring service questions, SSL certificate monitoring, domain expiration alerts, API monitoring help',
  openGraph: {
    title: 'FAQ - Frequently Asked Questions | expira',
    description: 'Find answers to common questions about expira monitoring service.',
    type: 'website',
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
  alternates: {
    canonical: 'https://expira.io/faq',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

