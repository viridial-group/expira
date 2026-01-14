'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, FileText } from 'lucide-react'

export default function TermsPage() {
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
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing and using expira (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of expira&apos;s website, services, and applications (collectively, the &quot;Service&quot;). By using the Service, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                expira is a monitoring platform that helps users track expiration dates for websites, SSL certificates, domains, and APIs. The Service provides automated alerts and notifications to help prevent service disruptions.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Billing</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Free Trial:</strong> We offer a 14-day free trial period. No credit card is required to start your trial.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Subscription Plans:</strong> After the trial period, you may choose to subscribe to a paid plan. Subscription fees are billed in advance on a monthly or annual basis, as selected.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Cancellation:</strong> You may cancel your subscription at any time from your account settings. Cancellation will take effect at the end of your current billing period. No refunds will be provided for the current billing period.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Refunds:</strong> We offer a 14-day money-back guarantee for new subscriptions. Refund requests must be submitted within 14 days of your initial subscription.
              </p>
              <p className="text-gray-600 leading-relaxed">
                <strong>Price Changes:</strong> We reserve the right to modify subscription fees. We will provide at least 30 days&apos; notice of any price changes. Continued use of the Service after the price change constitutes acceptance of the new pricing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any malicious code, viruses, or harmful data</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Monitor products without proper authorization</li>
                <li>Resell or redistribute the Service without our written consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Service, including its original content, features, and functionality, is owned by expira and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Content</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You retain ownership of any content you submit to the Service (&quot;User Content&quot;). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your User Content solely for the purpose of providing the Service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You are solely responsible for your User Content and warrant that you have all necessary rights to submit such content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We strive to maintain high availability of the Service but do not guarantee uninterrupted or error-free operation. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We are not liable for any damages resulting from Service unavailability or interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, EXPIRA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold harmless expira, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any breach of these Terms or for any other reason we deem necessary.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your right to use the Service will cease immediately. You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-none space-y-2 text-gray-600">
                <li>Email: legal@expira.io</li>
                <li>Website: <Link href="/contact" className="text-primary-600 hover:underline">expira.io/contact</Link></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

