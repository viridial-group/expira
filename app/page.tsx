import Link from 'next/link'
import Image from 'next/image'
import { Check, Shield, Zap, Bell, Globe, Lock, TrendingUp, ArrowRight, AlertTriangle, Clock, Heart, Sparkles, Star, Users, Award, CreditCard, Code, X } from 'lucide-react'
import StructuredData from './components/StructuredData'

export const metadata = {
  title: 'expira - Never Miss an Expiration Again | Website & SSL Monitoring',
  description: 'Automatically monitor websites, SSL certificates, domains, and APIs. Get instant email and SMS notifications before they expire. Trusted by 10,000+ businesses. Start your 14-day free trial today.',
  keywords: 'website monitoring, SSL certificate monitoring, domain expiration, API monitoring, uptime monitoring, website uptime, domain monitoring, SSL monitoring, expiration tracking, website health check',
  openGraph: {
    title: 'expira - Never Miss an Expiration Again',
    description: 'Automatically monitor websites, SSL certificates, domains, and APIs. Get instant notifications before they expire.',
    url: 'https://expira.io',
    siteName: 'expira',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'expira - Monitor & Verify Your Online Products',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function Home() {
  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="Organization" />
      <StructuredData type="WebSite" />
      <StructuredData type="SoftwareApplication" />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">expira</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#problem" className="text-gray-600 hover:text-primary-600 transition font-medium">Problem</Link>
              <Link href="#features" className="text-gray-600 hover:text-primary-600 transition font-medium">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-primary-600 transition font-medium">Pricing</Link>
              <Link href="/login" className="text-gray-600 hover:text-primary-600 transition font-medium">Login</Link>
              <Link href="/register" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Moved to top */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 rounded-full text-sm font-semibold mb-8 shadow-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Trusted by 10,000+ businesses worldwide
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                Never Miss an
                <span className="block bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                  Expiration Again
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                Automatically monitor websites, SSL certificates, domains, and APIs. 
                Get instant notifications before they expire and keep your online presence secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/register" 
                  className="group bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center transform hover:-translate-y-1"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#demo" 
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-primary-300 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Watch Demo
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  14-day free trial
                </div>
              </div>
            </div>
            
            {/* Hero Visual with SVG */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary-500 via-blue-500 to-purple-500 rounded-3xl shadow-2xl p-1">
                <div className="bg-white rounded-3xl p-8">
                  {/* Dashboard Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="font-bold text-gray-900">All Systems Operational</span>
                      </div>
                      <span className="text-sm text-gray-500">Last checked: 2 min ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-6 w-6 text-primary-600" />
                        <div>
                          <div className="font-medium text-gray-900">expira.io</div>
                          <div className="text-sm text-gray-500">Expires in 45 days</div>
                        </div>
                      </div>
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-6 w-6 text-primary-600" />
                        <div>
                          <div className="font-medium text-gray-900">ssl.expira.io</div>
                          <div className="text-sm text-gray-500">Expires in 20 days</div>
                        </div>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-6 w-6 text-primary-600" />
                        <div>
                          <div className="font-medium text-gray-900">api.expira.io</div>
                          <div className="text-sm text-gray-500">Expires in 10 days</div>
                        </div>
                      </div>
                      <X className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            The Hidden Costs of Missed Expirations
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
            Expired domains, SSL certificates, and unnoticed API downtimes can lead to severe consequences for your business.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <AlertTriangle className="h-12 w-12 text-danger-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Security Vulnerabilities</h3>
              <p className="text-gray-600">
                Expired SSL certificates expose your website to security risks, eroding customer trust and leading to data breaches.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <Users className="h-12 w-12 text-warning-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Loss of Customer Trust</h3>
              <p className="text-gray-600">
                Website downtime or security warnings drive customers away, damaging your brand reputation and loyalty.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <CreditCard className="h-12 w-12 text-primary-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Financial Losses</h3>
              <p className="text-gray-600">
                Missed renewals can result in costly recovery fees, lost sales, and significant revenue impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Your All-in-One Monitoring Solution
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              expira provides comprehensive monitoring to ensure your online assets are always secure and operational.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="flex items-start p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-4 bg-primary-100 rounded-xl mr-5 flex-shrink-0">
                <Globe className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Website & Domain Monitoring</h3>
                <p className="text-gray-600">
                  Track your website uptime and domain expiration dates. Get alerts before they go offline or expire.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-4 bg-green-100 rounded-xl mr-5 flex-shrink-0">
                <Lock className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">SSL Certificate Tracking</h3>
                <p className="text-gray-600">
                  Never let an SSL certificate expire unnoticed. We&apos;ll notify you well in advance.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-4 bg-yellow-100 rounded-xl mr-5 flex-shrink-0">
                <Code className="h-7 w-7 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">API Endpoint Monitoring</h3>
                <p className="text-gray-600">
                  Ensure your critical APIs are always responsive and returning the correct data.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-4 bg-purple-100 rounded-xl mr-5 flex-shrink-0">
                <Bell className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Notifications</h3>
                <p className="text-gray-600">
                  Receive alerts via email, SMS, or in-app notifications for any critical changes.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-4 bg-red-100 rounded-xl mr-5 flex-shrink-0">
                <Clock className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customizable Check Intervals</h3>
                <p className="text-gray-600">
                  Set how often your products are monitored, from daily to real-time checks.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-4 bg-blue-100 rounded-xl mr-5 flex-shrink-0">
                <TrendingUp className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analytics & Reports</h3>
                <p className="text-gray-600">
                  Access comprehensive reports and analytics to understand your product&apos;s performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-12 leading-tight">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center transform transition-all hover:scale-105 hover:shadow-xl">
              <Image src="https://randomuser.me/api/portraits/men/32.jpg" alt="Client 1" width={80} height={80} className="w-20 h-20 rounded-full mb-6 border-4 border-primary-100" />
              <p className="text-lg text-gray-700 italic mb-4">
                &quot;expira has saved us countless hours and potential disasters. The notifications are spot on!&quot;
              </p>
              <div className="flex items-center text-yellow-500 mb-2">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="font-semibold text-gray-900">John Smith</p>
              <p className="text-sm text-gray-600">CEO, Tech Solutions</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center transform transition-all hover:scale-105 hover:shadow-xl">
              <Image src="https://randomuser.me/api/portraits/women/44.jpg" alt="Client 2" width={80} height={80} className="w-20 h-20 rounded-full mb-6 border-4 border-primary-100" />
              <p className="text-lg text-gray-700 italic mb-4">
                &quot;Reliable and easy to use. expira is an essential tool for our online presence.&quot;
              </p>
              <div className="flex items-center text-yellow-500 mb-2">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5" />
              </div>
              <p className="font-semibold text-gray-900">Jane Doe</p>
              <p className="text-sm text-gray-600">Marketing Director, Global Corp</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center transform transition-all hover:scale-105 hover:shadow-xl">
              <Image src="https://randomuser.me/api/portraits/men/47.jpg" alt="Client 3" width={80} height={80} className="w-20 h-20 rounded-full mb-6 border-4 border-primary-100" />
              <p className="text-lg text-gray-700 italic mb-4">
                &quot;The best monitoring service we&apos;ve used. Highly recommend expira to any business.&quot;
              </p>
              <div className="flex items-center text-yellow-500 mb-2">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="font-semibold text-gray-900">Peter Jones</p>
              <p className="text-sm text-gray-600">CTO, Innovate Ltd</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
            Choose the plan that fits your needs. All plans include a 14-day free trial with no credit card required.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
          >
            View All Plans
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Ready to Protect Your Online Assets?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed">
            Join thousands of businesses that trust expira to keep their products secure.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-10 py-4 bg-white text-primary-600 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-primary-400" />
                <span className="ml-2 text-white font-bold text-lg">expira</span>
              </div>
              <p className="text-sm leading-relaxed">
                Monitor and protect your online products with confidence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <p className="text-sm">123 Main St, Anytown USA</p>
              <p className="text-sm">info@expira.io</p>
              <p className="text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} expira. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
