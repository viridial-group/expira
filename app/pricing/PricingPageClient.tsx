'use client'

import Link from 'next/link'
import { Check, Shield, Zap, Sparkles, TrendingUp, Lock, ArrowRight, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui'

export default function PricingPageClient() {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      period: '/month',
      description: 'Perfect for individuals and small projects',
      features: [
        'Up to 10 products',
        'Daily checks',
        'Email notifications',
        'Basic analytics',
        'Email support',
      ],
      smsInfo: 'SMS notifications available in Professional plan',
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      period: '/month',
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
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      period: '/month',
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
      cta: 'Contact Sales',
      popular: false,
    },
  ]

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
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">Home</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">Login</Link>
              <Link href="/register">
                <Button>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            14-day free trial • No credit card required
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial with no credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-xl border-0 p-8 relative transform transition-all hover:scale-105 hover:shadow-2xl ${
                plan.popular ? 'ring-2 ring-primary-500 scale-105 lg:scale-110' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                {plan.popular && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-success-600" />
                    Best value for growing teams
                  </p>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => {
                  const isSMS = feature.toLowerCase().includes('sms')
                  return (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          isSMS 
                            ? 'bg-gradient-to-br from-primary-500 to-blue-600' 
                            : 'bg-gradient-to-br from-success-500 to-emerald-600'
                        }`}>
                          {isSMS ? (
                            <MessageSquare className="h-3 w-3 text-white" />
                          ) : (
                            <Check className="h-3 w-3 text-white" />
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
              {plan.smsInfo && (
                <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary-600" />
                    <p className="text-sm text-primary-700 font-medium">{plan.smsInfo}</p>
                  </div>
                </div>
              )}
              <Link href={plan.cta === 'Contact Sales' ? '/contact' : `/pricing/review?plan=${plan.id}`}>
                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full shadow-lg"
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What happens after the free trial?',
                a: 'After your 14-day free trial, you can choose to subscribe to a paid plan or your account will be paused.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee on all paid plans.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and PayPal.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
