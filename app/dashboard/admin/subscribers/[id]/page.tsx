'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Calendar, CreditCard, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface Subscription {
  id: string
  status: string
  planId: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
    phone: string | null
    phoneVerified: boolean
    createdAt: string
    updatedAt: string
  }
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    description: string | null
    planId: string | null
    periodStart: string | null
    periodEnd: string | null
    createdAt: string
    stripePaymentIntentId: string | null
    stripeInvoiceId: string | null
  }>
}

export default function SubscriberDetailPage() {
  const router = useRouter()
  const params = useParams()
  const subscriberId = params.id as string

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscriber = useCallback(async () => {
    if (!subscriberId) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/subscribers/${subscriberId}`)
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      } else if (res.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
      } else if (res.status === 404) {
        toast.error('Subscriber not found')
        router.push('/dashboard/admin/subscribers')
      } else {
        toast.error('Failed to load subscriber details')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [subscriberId, router])

  useEffect(() => {
    fetchSubscriber()
  }, [fetchSubscriber])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="md">Active</Badge>
      case 'trialing':
        return <Badge variant="info" size="md">Trialing</Badge>
      case 'canceled':
        return <Badge variant="error" size="md">Canceled</Badge>
      case 'past_due':
        return <Badge variant="warning" size="md">Past Due</Badge>
      default:
        return <Badge variant="gray" size="md">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="success" size="sm">Succeeded</Badge>
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>
      case 'refunded':
        return <Badge variant="info" size="sm">Refunded</Badge>
      default:
        return <Badge variant="gray" size="sm">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg">Loading subscriber details...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscriber Not Found</h1>
        <p className="text-gray-600 mb-6">The subscriber you are looking for does not exist.</p>
        <Link href="/dashboard/admin/subscribers">
          <Button>Back to Subscribers</Button>
        </Link>
      </div>
    )
  }

  const totalPaid = subscription.payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <Link href="/dashboard/admin/subscribers" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Subscribers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriber Details</h1>
            <p className="text-gray-600">View detailed information about this subscriber</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Details */}
          <Card className="shadow-xl border-0">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">User Information</h2>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-semibold text-gray-900">{subscription.user.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{subscription.user.email}</p>
                  </div>
                </div>
                {subscription.user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.user.phone}
                        {subscription.user.phoneVerified && (
                          <Badge variant="success" size="sm" className="ml-2">Verified</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(subscription.user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Subscription Details */}
          <Card className="shadow-xl border-0">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Details</h2>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(subscription.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan</span>
                  <span className="text-lg font-semibold text-gray-900 capitalize">{subscription.planId}</span>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Period End</span>
                    <span className="text-lg font-semibold text-gray-900">{formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cancellation</span>
                    <Badge variant="warning" size="sm">Cancels at period end</Badge>
                  </div>
                )}
                {subscription.stripeCustomerId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stripe Customer ID</span>
                    <a
                      href={`https://dashboard.stripe.com/customers/${subscription.stripeCustomerId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      {subscription.stripeCustomerId.substring(0, 20)}...
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                {subscription.stripeSubscriptionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stripe Subscription ID</span>
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      {subscription.stripeSubscriptionId.substring(0, 20)}...
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created At</span>
                  <span className="text-lg font-semibold text-gray-900">{formatDate(subscription.createdAt)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="shadow-xl border-0">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment History</h2>
              <p className="text-sm text-gray-600">{subscription.payments.length} payment(s) total</p>
            </div>
            <div className="p-8">
              {subscription.payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscription.payments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <CreditCard className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{formatAmount(payment.amount, payment.currency)}</p>
                            <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                          </div>
                        </div>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                      {payment.description && (
                        <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
                      )}
                      {payment.periodStart && payment.periodEnd && (
                        <p className="text-xs text-gray-500">
                          Period: {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                        </p>
                      )}
                      {payment.stripeInvoiceId && (
                        <a
                          href={`https://dashboard.stripe.com/invoices/${payment.stripeInvoiceId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-700 flex items-center mt-2"
                        >
                          View invoice
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-xl border-0 sticky top-24">
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="font-semibold text-gray-900">{subscription.payments.length}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-bold text-gray-900">
                    {formatAmount(totalPaid, subscription.payments[0]?.currency || 'usd')}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Successful</span>
                  <span className="font-semibold text-success-600">
                    {subscription.payments.filter(p => p.status === 'succeeded').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-semibold text-danger-600">
                    {subscription.payments.filter(p => p.status === 'failed').length}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

