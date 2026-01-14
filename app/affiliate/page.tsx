'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Gift, Users, DollarSign, CheckCircle, Copy, Share2, ArrowRight, TrendingUp, Star, Zap, Target, Percent, Clock, Mail, MessageSquare } from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import toast from 'react-hot-toast'

export default function AffiliatePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/user/profile')
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true)
          // Get affiliate code
          return fetch('/api/affiliate/code')
        }
        return null
      })
      .then(res => {
        if (res && res.ok) {
          return res.json()
        }
        return null
      })
      .then(data => {
        if (data?.code) {
          setAffiliateCode(data.code)
        }
      })
      .catch(() => {
        // User not logged in
      })
      .finally(() => setLoading(false))
  }, [])

  const copyAffiliateLink = () => {
    if (!affiliateCode) {
      toast.error('Please sign up first to get your affiliate link')
      return
    }
    
    const link = `${window.location.origin}/register?ref=${affiliateCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Affiliate link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const affiliateLink = affiliateCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://expira.io'}/register?ref=${affiliateCode}`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center group">
              <Shield className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
              <span className="ml-2 text-xl font-bold text-gray-900">expira</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">Home</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</Link>
              {isLoggedIn ? (
                <Link href="/dashboard/affiliate">
                  <Button variant="primary">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">Login</Link>
                  <Link href="/register">
                    <Button variant="primary">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 rounded-full text-sm font-semibold mb-8">
            <Gift className="h-4 w-4 mr-2" />
            Earn Money by Sharing expira
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Join Our
            <span className="block bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Affiliate Program
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Share expira with your network and earn commissions on every subscription. 
            Start earning today with our generous affiliate program.
          </p>
          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="secondary" size="lg" className="flex items-center">
                  Learn More
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Percent className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Up to 15%</h3>
              <p className="text-gray-600">Commission on First Subscription</p>
            </Card>
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">5%</h3>
              <p className="text-gray-600">Recurring Commission</p>
            </Card>
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Instant</h3>
              <p className="text-gray-600">Payout Processing</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start earning commissions in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="mt-4">
                <Users className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign Up</h3>
                <p className="text-gray-600">
                  Create your free expira account and get your unique affiliate code automatically.
                </p>
              </div>
            </Card>

            <Card className="p-8 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="mt-4">
                <Share2 className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Share Your Link</h3>
                <p className="text-gray-600">
                  Share your unique affiliate link with your network via email, social media, or your website.
                </p>
              </div>
            </Card>

            <Card className="p-8 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="mt-4">
                <DollarSign className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Earn Commissions</h3>
                <p className="text-gray-600">
                  Get paid when your referrals subscribe. Track your earnings in real-time.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Commission Structure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent and competitive commission rates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-2 border-primary-200">
              <div className="text-center mb-6">
                <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">First Subscription</h3>
                <div className="text-4xl font-extrabold text-primary-600 mb-2">15%</div>
                <p className="text-gray-600">One-time commission on the first subscription payment</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Highest commission rate
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Paid immediately after conversion
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-2 border-blue-200">
              <div className="text-center mb-6">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Recurring Payments</h3>
                <div className="text-4xl font-extrabold text-blue-600 mb-2">5%</div>
                <p className="text-gray-600">Ongoing commission on every renewal payment</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Passive income stream
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Lifetime commissions
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <Gift className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Signup Bonus</h3>
                <div className="text-4xl font-extrabold text-purple-600 mb-2">10%</div>
                <p className="text-gray-600">Bonus commission for successful referrals</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Additional earnings
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Stack with other commissions
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Get Your Link */}
      {isLoggedIn && affiliateCode && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Your Affiliate Link is Ready!
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Start sharing and earning commissions today
            </p>
            <Card className="p-8 bg-white text-gray-900">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Affiliate Code</p>
                <p className="text-3xl font-bold font-mono text-primary-600 mb-4">{affiliateCode}</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your Affiliate Link</p>
                  <p className="text-sm text-gray-900 break-all font-mono">{affiliateLink}</p>
                </div>
                <Button
                  onClick={copyAffiliateLink}
                  variant="primary"
                  className="w-full flex items-center justify-center"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copy Affiliate Link
                    </>
                  )}
                </Button>
              </div>
              <Link href="/dashboard/affiliate">
                <Button variant="secondary" className="w-full">
                  View Full Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      )}

      {/* CTA for Non-Logged In Users */}
      {!isLoggedIn && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl mb-10 text-white/90">
              Sign up for free and get your affiliate link instantly
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="secondary" size="lg" className="flex items-center">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Already have an account? Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How do I get my affiliate link?</h3>
              <p className="text-gray-600">
                Simply sign up for a free expira account and your unique affiliate code will be automatically generated. 
                You can find your affiliate link in your dashboard under &quot;Affiliate Program&quot;.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">When do I get paid?</h3>
              <p className="text-gray-600">
                Commissions are tracked in real-time. Once a referral subscribes, your commission is marked as pending. 
                After approval, payments are processed according to our payout schedule.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is there a minimum payout?</h3>
              <p className="text-gray-600">
                Currently, there is no minimum payout threshold. All approved commissions are eligible for payment.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I track my referrals?</h3>
              <p className="text-gray-600">
                Yes! Your affiliate dashboard provides detailed analytics including total referrals, conversion rates, 
                earnings, and commission history.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-400" />
            <span className="ml-2 text-white font-bold text-lg">expira</span>
          </div>
          <p className="text-sm mb-4">
            &copy; {new Date().getFullYear()} expira. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

