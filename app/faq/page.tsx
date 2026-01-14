'use client'

import Link from 'next/link'
import { ArrowLeft, HelpCircle, Shield, CreditCard, Bell, Globe, Lock, Zap } from 'lucide-react'
import { Card } from '@/components/ui'

const faqs = [
  {
    category: 'General',
    icon: HelpCircle,
    questions: [
      {
        q: 'What is expira?',
        a: 'expira is a comprehensive monitoring platform that helps you track and manage the expiration dates of your websites, SSL certificates, domains, and APIs. We send automated alerts before expiration to prevent service disruptions.',
      },
      {
        q: 'How does expira work?',
        a: 'expira continuously monitors your registered products by checking their status at regular intervals. When an expiration date approaches, we send you notifications via email, SMS, or push notifications based on your preferences.',
      },
      {
        q: 'What types of products can I monitor?',
        a: 'You can monitor websites, SSL certificates, domains, and APIs. Simply add the URL or identifier, and expira will track expiration dates and send you alerts.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.',
      },
    ],
  },
  {
    category: 'Pricing & Billing',
    icon: CreditCard,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure Stripe payment processor.',
      },
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes, you can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer a 14-day money-back guarantee. If you\'re not satisfied with our service, contact us within 14 days of your subscription for a full refund.',
      },
      {
        q: 'What happens after my free trial ends?',
        a: 'After your 14-day free trial, you can choose to subscribe to a paid plan. If you don\'t subscribe, your account will be paused, and you\'ll need to subscribe to continue monitoring your products.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No hidden fees. The price you see is the price you pay. All plans include unlimited product monitoring and notifications.',
      },
    ],
  },
  {
    category: 'Notifications',
    icon: Bell,
    questions: [
      {
        q: 'How do I receive expiration alerts?',
        a: 'You can receive alerts via email, SMS (requires verified phone number), or browser push notifications. You can configure your notification preferences in your account settings.',
      },
      {
        q: 'How far in advance do you send expiration warnings?',
        a: 'By default, we send warnings 30 days before expiration. You can customize this period in your product settings.',
      },
      {
        q: 'Can I customize notification frequency?',
        a: 'Yes, you can set custom notification schedules for each product, including multiple reminders at different intervals (e.g., 30 days, 7 days, 1 day before expiration).',
      },
      {
        q: 'Do you send notifications for all products?',
        a: 'You can choose which products to monitor and receive notifications for. You can enable or disable notifications for individual products at any time.',
      },
    ],
  },
  {
    category: 'Security & Privacy',
    icon: Shield,
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes, we use industry-standard encryption (SSL/TLS) to protect all data in transit and at rest. We never store your passwords in plain text and follow security best practices.',
      },
      {
        q: 'What information do you collect?',
        a: 'We collect only the information necessary to provide our service: account information (email, name), product URLs you want to monitor, and notification preferences. See our Privacy Policy for details.',
      },
      {
        q: 'Do you share my data with third parties?',
        a: 'We do not sell your personal data. We only share data with trusted service providers (like payment processors) necessary to operate our service. See our Privacy Policy for complete details.',
      },
      {
        q: 'How can I delete my account?',
        a: 'You can delete your account at any time from your account settings. This will permanently delete all your data, including monitored products and notification history.',
      },
    ],
  },
  {
    category: 'Technical',
    icon: Zap,
    questions: [
      {
        q: 'How often do you check for expirations?',
        a: 'We check your products daily. For critical products approaching expiration, we increase the check frequency to ensure timely alerts.',
      },
      {
        q: 'What happens if a product expires?',
        a: 'If a product expires, we immediately send you an alert and mark the product status as "expired" in your dashboard. You can then take action to renew it.',
      },
      {
        q: 'Can I monitor products behind a firewall?',
        a: 'expira can only monitor publicly accessible products. If your product requires authentication or is behind a firewall, you may need to use our API integration instead.',
      },
      {
        q: 'Do you support API monitoring?',
        a: 'Yes, you can monitor API endpoints. We check the API status and can alert you if the API becomes unavailable or if SSL certificates expire.',
      },
      {
        q: 'What browsers are supported?',
        a: 'expira works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We also have a mobile-responsive interface.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center group">
              <Shield className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
              <span className="ml-2 text-xl font-bold text-gray-900">expira</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
              <ArrowLeft className="h-5 w-5 inline mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full mb-6">
            <HelpCircle className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about expira and how it can help protect your online products.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => {
            const Icon = category.icon
            return (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <Card key={index} className="p-6 shadow-lg border-0 hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                        <span className="text-primary-600 mr-2">Q:</span>
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 leading-relaxed pl-7">
                        <span className="text-primary-600 font-semibold mr-2">A:</span>
                        {faq.a}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 p-8 text-center bg-gradient-to-br from-primary-50 to-blue-50 border-0 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
          <p className="text-gray-600 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg">
                Contact Support
              </button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors border-2 border-primary-600">
                Start Free Trial
              </button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

