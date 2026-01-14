import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | expira',
  description: 'Read expira\'s Terms of Service. Understand the terms and conditions for using our monitoring platform for websites, SSL certificates, domains, and APIs.',
  keywords: 'expira terms of service, terms and conditions, user agreement, service terms',
  openGraph: {
    title: 'Terms of Service | expira',
    description: 'Terms and conditions for using expira monitoring service.',
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
    canonical: 'https://expira.io/terms',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

