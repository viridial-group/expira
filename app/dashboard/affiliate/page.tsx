'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gift, Users, DollarSign, Copy, CheckCircle, XCircle, Clock, TrendingUp, Share2, ExternalLink } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface AffiliateStats {
  code: string
  totalReferrals: number
  totalEarnings: number
  pendingEarnings: number
  approvedEarnings: number
  paidEarnings: number
  convertedReferrals: number
  pendingReferrals: number
  totalCommissions: number
  pendingCommissions: number
}

interface Referral {
  id: string
  referredUser: {
    id: string
    email: string
    name: string | null
    createdAt: string
  }
  status: string
  hasConverted: boolean
  createdAt: string
  convertedAt: string | null
}

interface Commission {
  id: string
  amount: number
  commissionType: string
  commissionRate: number
  status: string
  payment: {
    amount: number
    currency: string
    createdAt: string
  } | null
  createdAt: string
  approvedAt: string | null
  paidAt: string | null
}

export default function AffiliatePage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setReferrals(data.referrals || [])
        setCommissions(data.commissions || [])
      } else {
        toast.error('Failed to load affiliate stats')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const copyAffiliateLink = () => {
    if (!stats?.code) return
    
    const link = `${window.location.origin}/register?ref=${stats.code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Affiliate link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; label: string }> = {
      pending: { variant: 'gray', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      paid: { variant: 'success', label: 'Paid' },
      cancelled: { variant: 'error', label: 'Cancelled' },
      converted: { variant: 'success', label: 'Converted' },
      completed: { variant: 'success', label: 'Completed' },
    }

    const statusInfo = variants[status] || { variant: 'gray', label: status }
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load affiliate information</p>
      </div>
    )
  }

  const affiliateLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://expira.io'}/register?ref=${stats.code}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Program</h1>
          <p className="text-gray-600 mt-1">Invite friends and earn commissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <Badge variant="success">{stats.convertedReferrals} converted</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</h3>
          <p className="text-gray-600 mt-1">Total Referrals</p>
          <p className="text-sm text-gray-500 mt-2">{stats.pendingReferrals} pending</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <Badge variant="success">Active</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalEarnings)}</h3>
          <p className="text-gray-600 mt-1">Total Earnings</p>
          <p className="text-sm text-gray-500 mt-2">
            {formatAmount(stats.paidEarnings)} paid
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <Badge variant="gray">{stats.pendingCommissions} pending</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatAmount(stats.pendingEarnings)}</h3>
          <p className="text-gray-600 mt-1">Pending Earnings</p>
          <p className="text-sm text-gray-500 mt-2">
            {formatAmount(stats.approvedEarnings)} approved
          </p>
        </Card>
      </div>

      {/* Affiliate Code Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Gift className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Affiliate Code</h2>
              <p className="text-gray-600 text-sm">Share your code with friends to earn commissions</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Your Code</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{stats.code}</p>
            </div>
            <Button
              onClick={copyAffiliateLink}
              variant="primary"
              className="flex items-center"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Share2 className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">Your Affiliate Link</p>
              <p className="text-sm text-blue-700 break-all">{affiliateLink}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Commission Rates</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center justify-between">
              <span>First Subscription:</span>
              <span className="font-semibold text-gray-900">15%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Recurring Payments:</span>
              <span className="font-semibold text-gray-900">5%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Signup Bonus:</span>
              <span className="font-semibold text-gray-900">10%</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Referrals Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Referrals</h2>
          <Badge variant="gray">{referrals.length} total</Badge>
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No referrals yet</p>
            <p className="text-sm text-gray-500 mt-2">Share your affiliate link to start earning!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Signed Up</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Converted</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{referral.referredUser.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{referral.referredUser.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(referral.status)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(referral.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {referral.convertedAt ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          {formatDate(referral.convertedAt)}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not converted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Commissions Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Commissions</h2>
          <Badge variant="gray">{commissions.length} total</Badge>
        </div>

        {commissions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No commissions yet</p>
            <p className="text-sm text-gray-500 mt-2">Commissions are generated when your referrals subscribe</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900">{formatAmount(commission.amount)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="gray" className="capitalize">
                        {commission.commissionType}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {(commission.commissionRate * 100).toFixed(0)}%
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(commission.status)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(commission.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

