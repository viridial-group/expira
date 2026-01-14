import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | expira',
  description: 'Read expira\'s Privacy Policy. Learn how we collect, use, and protect your personal information when you use our monitoring service. GDPR and CCPA compliant.',
  keywords: 'expira privacy policy, data protection, GDPR compliance, privacy rights, data security, CCPA compliance',
  openGraph: {
    title: 'Privacy Policy | expira',
    description: 'How expira protects your privacy and handles your personal information.',
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
    canonical: 'https://expira.io/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

