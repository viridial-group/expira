'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowLeft, Shield, Zap, Lock, CreditCard, Calendar, Sparkles, MessageSquare } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import toast from 'react-hot-toast'

// Check if user is authenticated
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me')
    return res.ok
  } catch {
    return false
  }
}

const plans = {
  starter: {
    name: 'Starter',
    price: 9,
    period: 'month',
    description: 'Perfect for individuals and small projects',
    features: [
      'Up to 10 products',
      'Daily checks',
      'Email notifications',
      'Basic analytics',
      'Email support',
    ],
    smsInfo: 'SMS notifications available in Professional plan',
    popular: false,
  },
  professional: {
    name: 'Professional',
    price: 29,
    period: 'month',
    description: 'Ideal for growing businesses',
    features: [
      'Up to 100 products',
      'Hourly checks',
      'Email + SMS notifications',
      'Up to 500 SMS/month',
      'Advanced analytics',
      'Priority support',
      'API access',
    ],
    smsInfo: '500 SMS included per month',
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For large organizations',
    features: [
      'Unlimited products',
      'Real-time monitoring',
      'All notification types',
      'Unlimited SMS',
      'Custom reports',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    smsInfo: 'Unlimited SMS included',
    popular: false,
  },
}

function ReviewPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') as keyof typeof plans | null
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[keyof typeof plans] | null>(null)

  useEffect(() => {
    const verifyAuth = async () => {
      if (!planId || !plans[planId]) {
        router.push('/pricing')
        return
      }

      // Set the plan first so it shows even if not authenticated
      setSelectedPlan(plans[planId])

      // Check auth but don't redirect - let user see the page
      // The checkout button will handle the redirect if needed
    }

    verifyAuth()
  }, [planId, router])

  const handleCheckout = async () => {
    if (!planId) return

    // Check authentication before proceeding
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      toast.error('Please login to continue')
      router.push(`/login?redirect=${encodeURIComponent(`/pricing/review?plan=${planId}`)}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const savings = selectedPlan.price * 12 * 0.2 // 20% annual savings estimate
  const monthlyTotal = selectedPlan.price
  const annualTotal = selectedPlan.price * 12

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">expira</span>
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">
              <ArrowLeft className="h-5 w-5 inline mr-2" />
              Back to Pricing
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            14-day free trial • No credit card required
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Review Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You&apos;re one step away from securing your online presence. Review your selection and proceed to checkout.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Plan Summary */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedPlan.name} Plan</h2>
                    <p className="text-primary-100">{selectedPlan.description}</p>
                  </div>
                  {selectedPlan.popular && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                </div>
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold">${selectedPlan.price}</span>
                  <span className="text-xl text-primary-100 ml-2">/{selectedPlan.period}</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">What&apos;s included:</h3>
                <ul className="space-y-3">
                  {selectedPlan.features.map((feature, index) => {
                    const isSMS = feature.toLowerCase().includes('sms')
                    return (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center shadow-sm ${
                            isSMS 
                              ? 'bg-gradient-to-br from-primary-500 to-blue-600' 
                              : 'bg-gradient-to-br from-success-500 to-emerald-600'
                          }`}>
                            {isSMS ? (
                              <MessageSquare className="h-4 w-4 text-white" />
                            ) : (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                        <span className={`ml-3 ${isSMS ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {selectedPlan.smsInfo && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary-600" />
                      <p className="text-sm text-primary-700 font-medium">{selectedPlan.smsInfo}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 sticky top-24">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-semibold text-gray-900">Monthly</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Price</span>
                    <span className="font-bold text-gray-900">${selectedPlan.price}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-success-50 to-emerald-50 rounded-xl p-4 mb-6 border border-success-200">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-success-600 mr-2" />
                    <span className="font-semibold text-success-900">Free Trial</span>
                  </div>
                  <p className="text-sm text-success-700">
                    Start with a 14-day free trial. Cancel anytime during the trial with no charges.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleCheckout}
                    loading={loading}
                    size="lg"
                    className="w-full shadow-lg bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700"
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    {loading ? 'Processing...' : 'Proceed to Secure Checkout'}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Secure payment powered by Stripe
                  </p>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    You&apos;ll be asked to login if you&apos;re not already signed in
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6 border-0 shadow-md">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Secure Payment</h4>
            <p className="text-sm text-gray-600">256-bit SSL encryption for all transactions</p>
          </Card>
          <Card className="text-center p-6 border-0 shadow-md">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-success-100 rounded-full mb-4">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">14-Day Trial</h4>
            <p className="text-sm text-gray-600">Try risk-free with our money-back guarantee</p>
          </Card>
          <Card className="text-center p-6 border-0 shadow-md">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-warning-100 rounded-full mb-4">
              <Zap className="h-6 w-6 text-warning-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Cancel Anytime</h4>
            <p className="text-sm text-gray-600">No long-term contracts or hidden fees</p>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="border-0 shadow-md">
          <div className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">When will I be charged?</h4>
                <p className="text-sm text-gray-600">
                  You&apos;ll be charged after your 14-day free trial ends. You can cancel anytime during the trial with no charges.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Can I change plans later?</h4>
                <p className="text-sm text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">What payment methods do you accept?</h4>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards, debit cards, and other payment methods through Stripe.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  )
}

