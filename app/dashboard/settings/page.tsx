'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Bell, CreditCard, User, Calendar, AlertCircle, CheckCircle, XCircle, ExternalLink, RefreshCw, Phone, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, Input, Badge } from '@/components/ui'

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

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  phoneVerified: boolean
  image: string | null
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchSubscription()
    } else if (activeTab === 'profile') {
      fetchProfile()
    }
  }, [activeTab])

  const fetchProfile = async () => {
    setProfileLoading(true)
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

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

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Profile updated successfully!')
        setProfile(data)
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">Manage your account settings and preferences</p>
      </div>

      <Card padding="none" className="shadow-xl border-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
            <nav className="flex -mb-px px-6">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'billing', label: 'Billing', icon: CreditCard },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-5 border-b-2 font-semibold text-sm transition-all relative ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 mr-2 ${activeTab === tab.id ? 'text-primary-600' : ''}`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-blue-600"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                </div>
                {profileLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                      <p className="text-gray-600">Loading profile...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Input
                      label="Full Name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="john@example.com"
                      icon={<User className="h-5 w-5" />}
                    />
                    <div>
                      <Input
                        label="Phone Number (for SMS notifications)"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1234567890"
                        icon={<Phone className="h-5 w-5" />}
                      />
                      <p className="text-xs text-gray-500 mt-1.5 ml-1">
                        Use E.164 format (e.g., +1234567890). SMS notifications require a verified phone number.
                      </p>
                      {profile?.phone && (
                        <div className="mt-2 flex items-center gap-2">
                          {profile.phoneVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-success-700 bg-success-100 px-2.5 py-1 rounded-lg">
                              <Check className="h-3.5 w-3.5" />
                              Phone verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-warning-700 bg-warning-100 px-2.5 py-1 rounded-lg">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Phone not verified
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="pt-4">
                      <Button onClick={handleSave} loading={loading} size="lg" className="shadow-lg">
                        <Save className="h-5 w-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive email alerts for product expirations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">SMS Notifications</h3>
                      <p className="text-sm text-gray-600">Receive SMS alerts for critical issues</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Push Notifications</h3>
                      <p className="text-sm text-gray-600">Receive browser push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSave} loading={loading} size="lg" className="shadow-lg">
                    <Save className="h-5 w-5 mr-2" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing Information</h3>
                </div>

                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                      <p className="text-gray-600">Loading subscription...</p>
                    </div>
                  </div>
                ) : !subscription ? (
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
                ) : (
                  <>
                    {/* Current Plan */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Current Plan</h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <Card className={`border-0 shadow-xl ${
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
                      </Card>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                      {paymentMethod ? (
                        <Card className="border-0 shadow-lg">
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
                        </Card>
                      ) : (
                        <Card className="border-0 shadow-lg">
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
                        </Card>
                      )}
                    </div>

                    {/* Billing History */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Billing History</h3>
                      <Card className="border-0 shadow-lg">
                        <div className="text-center py-6">
                          <p className="text-gray-600 mb-4">Manage your invoices and billing history</p>
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
                        </div>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>
    </div>
  )
}

