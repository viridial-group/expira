'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CreditCard, Calendar, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, Badge } from '@/components/ui'

interface Subscription {
  id: string
  planId: string
  planName: string
  price: number
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
}

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    setSubscriptionLoading(true)
    try {
      const res = await fetch('/api/subscriptions/current')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
        setPaymentMethod(data.paymentMethod)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const handleBillingPortal = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setBillingLoading(false)
    }
  }

  const handleCancelSubscription = async (action: 'cancel' | 'reactivate') => {
    if (action === 'cancel' && !confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.')) {
      return
    }

    setCancelLoading(true)
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Subscription updated successfully')
        fetchSubscription()
      } else {
        toast.error(data.error || 'Failed to update subscription')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setCancelLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>
      case 'trialing':
        return <Badge variant="primary" size="sm">Trial</Badge>
      case 'past_due':
        return <Badge variant="warning" size="sm">Past Due</Badge>
      case 'canceled':
        return <Badge variant="error" size="sm">Canceled</Badge>
      default:
        return <Badge variant="warning" size="sm">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getCardBrandIcon = (brand: string) => {
    return <CreditCard className="h-6 w-6" />
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Billing</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">Manage your subscription, payment methods, and billing history</p>
      </div>

      {subscriptionLoading ? (
        <Card className="shadow-xl border-0">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading subscription...</p>
            </div>
          </div>
        </Card>
      ) : !subscription ? (
        <Card className="shadow-xl border-0">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full mb-6">
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">Get started with a plan to unlock all features</p>
            <Link href="/pricing">
              <Button size="lg" className="shadow-lg">
                View Plans
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="shadow-xl border-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Current Plan</h3>
              {getStatusBadge(subscription.status)}
            </div>
            <div className={`p-6 rounded-xl ${
              subscription.status === 'active' || subscription.status === 'trialing'
                ? 'bg-gradient-to-br from-primary-500 to-blue-600 text-white'
                : 'bg-gray-100'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className={`font-bold text-xl mb-1 ${subscription.status === 'active' || subscription.status === 'trialing' ? 'text-white' : 'text-gray-900'}`}>
                    {subscription.planName} Plan
                  </p>
                  <p className={subscription.status === 'active' || subscription.status === 'trialing' ? 'text-primary-100' : 'text-gray-600'}>
                    ${subscription.price}/month
                  </p>
                  {subscription.currentPeriodEnd && (
                    <p className={`text-sm mt-2 flex items-center gap-2 ${
                      subscription.status === 'active' || subscription.status === 'trialing' ? 'text-primary-100' : 'text-gray-600'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      {subscription.status === 'trialing' ? 'Trial ends' : 'Renews'} on {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <p className={`text-sm mt-2 flex items-center gap-2 ${
                      subscription.status === 'active' || subscription.status === 'trialing' 
                        ? 'text-yellow-200' 
                        : 'text-warning-600'
                    }`}>
                      <AlertCircle className="h-4 w-4" />
                      Will cancel on {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button 
                      variant={subscription.status === 'active' || subscription.status === 'trialing' ? 'secondary' : 'primary'} 
                      size="sm" 
                      className={subscription.status === 'active' || subscription.status === 'trialing' ? 'bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto' : 'w-full sm:w-auto'}
                    >
                      Change Plan
                    </Button>
                  </Link>
                  {subscription.cancelAtPeriodEnd ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancelSubscription('reactivate')}
                      loading={cancelLoading}
                      className={subscription.status === 'active' || subscription.status === 'trialing' ? 'bg-white/20 text-white hover:bg-white/30 w-full sm:w-auto' : 'w-full sm:w-auto'}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reactivate
                    </Button>
                  ) : (
                    subscription.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancelSubscription('cancel')}
                        loading={cancelLoading}
                        className={subscription.status === 'active' || subscription.status === 'trialing' ? 'bg-white/20 text-white hover:bg-white/30 w-full sm:w-auto' : 'w-full sm:w-auto'}
                      >
                        Cancel Subscription
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-xl border-0">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Payment Method</h3>
            {paymentMethod ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl mr-4">
                    {getCardBrandIcon(paymentMethod.brand)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg capitalize">
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="shadow-md"
                  onClick={handleBillingPortal}
                  loading={billingLoading}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No payment method on file</p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleBillingPortal}
                  loading={billingLoading}
                >
                  Add Payment Method
                </Button>
              </div>
            )}
          </Card>

          {/* Billing History */}
          <Card className="shadow-xl border-0">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Billing History</h3>
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Manage your invoices and billing history</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleBillingPortal}
                  loading={billingLoading}
                  className="shadow-md"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Billing Portal
                </Button>
                <Link href="/dashboard/payments">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="shadow-md"
                  >
                    View Payment History
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

