// Stripe Configuration for Competitive Pricing
export const STRIPE_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    description: 'Perfect for individuals and small projects',
    features: [
      'Up to 10 products',
      'Daily checks',
      'Email notifications',
      'Basic analytics',
      'Email support',
    ],
    limits: {
      products: 10,
      checksPerDay: 24,
      notifications: 'email',
      smsEnabled: false,
      smsPerMonth: 0,
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 29,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
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
    limits: {
      products: 100,
      checksPerDay: 24,
      notifications: 'email_sms',
      smsEnabled: true,
      smsPerMonth: 500,
    },
    popular: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
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
    limits: {
      products: -1, // unlimited
      checksPerDay: -1, // unlimited
      notifications: 'all',
      smsEnabled: true,
      smsPerMonth: -1, // unlimited
    },
  },
} as const

export type PlanId = keyof typeof STRIPE_PLANS

export const TRIAL_DAYS = 14

export const PRICING_FEATURES = {
  freeTrial: {
    days: 14,
    description: '14-day free trial on all plans',
  },
  moneyBack: {
    days: 30,
    description: '30-day money-back guarantee',
  },
  noCreditCard: {
    enabled: true,
    description: 'No credit card required for trial',
  },
  cancelAnytime: {
    enabled: true,
    description: 'Cancel anytime, no long-term contracts',
  },
} as const

