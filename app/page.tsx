'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Shield, Zap, Bell, Globe, Lock, TrendingUp, ArrowRight, AlertTriangle, Clock, Heart, Sparkles, Star, Users, Award, CreditCard, Code, X, Menu, Gift, Mail } from 'lucide-react'
import StructuredData from './components/StructuredData'

// Metadata is handled in layout.tsx

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterName, setNewsletterName] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setMobileMenuOpen(false)
      }
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterLoading(true)
    setNewsletterSuccess(false)

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          name: newsletterName,
          source: 'landing_page',
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setNewsletterSuccess(true)
        setNewsletterEmail('')
        setNewsletterName('')
        setTimeout(() => setNewsletterSuccess(false), 5000)
      } else {
        alert(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="Organization" />
      <StructuredData type="WebSite" />
      <StructuredData type="SoftwareApplication" />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Navigation - Enhanced */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-lg' 
          : 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Link href="/" className="flex items-center group relative z-10">
              <div className="relative">
                <Shield className="h-8 w-8 lg:h-9 lg:w-9 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="ml-2 text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                expira
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link 
                href="#problem" 
                onClick={(e) => smoothScroll(e, '#problem')}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium rounded-lg hover:bg-primary-50 relative group"
              >
                Problem
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="#features" 
                onClick={(e) => smoothScroll(e, '#features')}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium rounded-lg hover:bg-primary-50 relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="#pricing" 
                onClick={(e) => smoothScroll(e, '#pricing')}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium rounded-lg hover:bg-primary-50 relative group"
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/contact" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium rounded-lg hover:bg-primary-50 relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/affiliate" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium rounded-lg hover:bg-primary-50 relative group"
              >
                <Gift className="h-4 w-4 inline mr-1" />
                Affiliate
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium rounded-lg hover:bg-primary-50"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="ml-2 bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors relative z-10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'max-h-screen opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible'
          }`}>
            <div className="px-4 py-6 space-y-4">
              <Link 
                href="#problem" 
                onClick={(e) => smoothScroll(e, '#problem')}
                className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium"
              >
                Problem
              </Link>
              <Link 
                href="#features" 
                onClick={(e) => smoothScroll(e, '#features')}
                className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium"
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                onClick={(e) => smoothScroll(e, '#pricing')}
                className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium"
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium"
              >
                Contact
              </Link>
              <Link 
                href="/affiliate" 
                className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium"
              >
                <Gift className="h-4 w-4 inline mr-2" />
                Affiliate Program
              </Link>
              <Link 
                href="/login" 
                className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="block w-full text-center bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all mt-4"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <section className="pt-32 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements - Enhanced */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
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
                  className="group relative bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold overflow-hidden transition-all shadow-xl hover:shadow-2xl hover:shadow-primary-500/50 flex items-center justify-center transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  href="#features" 
                  onClick={(e) => smoothScroll(e, '#features')}
                  className="group bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Zap className="mr-2 h-5 w-5 text-primary-600 group-hover:rotate-12 transition-transform" />
                  Explore Features
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
                <li><Link href="/affiliate" className="hover:text-white transition">Affiliate Program</Link></li>
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
              <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
              <p className="text-sm mb-4">Stay updated with our latest features and tips.</p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {newsletterLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Subscribe
                    </>
                  )}
                </button>
                {newsletterSuccess && (
                  <p className="text-sm text-green-400">✓ Successfully subscribed!</p>
                )}
              </form>
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
