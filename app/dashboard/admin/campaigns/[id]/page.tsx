'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Users, Calendar, Send, Edit, Trash2, CheckCircle, XCircle, Clock, Eye, FileText, User, MousePointerClick, TrendingUp } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface Campaign {
  id: string
  subject: string
  content: string
  recipientType: string
  recipientEmails: string[] | null
  status: string
  sentCount: number
  failedCount: number
  totalRecipients: number
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string | null
    email: string
  }
  tracking?: {
    totalOpens: number
    uniqueOpens: number
    totalClicks: number
    uniqueClicks: number
    openRate: number
    clickRate: number
  }
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchCampaign = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`)
      if (res.ok) {
        const data = await res.json()
        setCampaign(data.campaign)
      } else if (res.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
      } else if (res.status === 404) {
        toast.error('Campaign not found')
        router.push('/dashboard/admin/campaigns')
      } else {
        toast.error('Failed to load campaign')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [campaignId, router])

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId, fetchCampaign])

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/send`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Campaign sent! ${data.sentCount || data.sent} emails sent, ${data.failedCount || data.failed} failed`)
        fetchCampaign()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send campaign')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Campaign deleted')
        router.push('/dashboard/admin/campaigns')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete campaign')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success" size="sm">Sent</Badge>
      case 'sending':
        return <Badge variant="warning" size="sm">Sending</Badge>
      case 'scheduled':
        return <Badge variant="info" size="sm">Scheduled</Badge>
      case 'draft':
        return <Badge variant="gray" size="sm">Draft</Badge>
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>
      default:
        return <Badge variant="gray" size="sm">{status}</Badge>
    }
  }

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'all':
        return 'All Users'
      case 'active':
        return 'Active Subscribers'
      case 'trialing':
        return 'Trialing Subscribers'
      case 'canceled':
        return 'Canceled Subscribers'
      case 'custom':
        return 'Custom Email List'
      default:
        return type
    }
  }

  if (loading && !campaign) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign not found</h2>
          <p className="text-gray-600 mb-6">The campaign you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard/admin/campaigns">
            <Button variant="outline">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <Link href="/dashboard/admin/campaigns" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaigns
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.subject}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-gray-600">Campaign details and statistics</p>
          </div>
          <div className="flex items-center gap-3">
            {campaign.status === 'draft' && (
              <>
                <Link href={`/dashboard/admin/campaigns/${campaign.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-5 w-5 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button onClick={handleSend} loading={sending} disabled={sending}>
                  <Send className="h-5 w-5 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </Button>
              </>
            )}
            {campaign.status === 'scheduled' && (
              <Link href={`/dashboard/admin/campaigns/${campaign.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-5 w-5 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-900 font-medium">{campaign.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{getRecipientTypeLabel(campaign.recipientType)}</span>
                </div>
              </div>
              {campaign.recipientType === 'custom' && campaign.recipientEmails && Array.isArray(campaign.recipientEmails) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Emails ({campaign.recipientEmails.length})</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="space-y-1">
                      {campaign.recipientEmails.map((email, index) => (
                        <div key={index} className="text-sm text-gray-700 font-mono">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{campaign.creator.name || campaign.creator.email}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Email Content */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Email Content</h2>
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.content }}
              />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              <FileText className="h-4 w-4 inline mr-1" />
              HTML content preview
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Total Recipients</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{campaign.totalRecipients}</span>
              </div>
              {campaign.status === 'sent' && (
                <>
                  <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success-600" />
                      <span className="text-sm font-medium text-gray-700">Sent</span>
                    </div>
                    <span className="text-lg font-bold text-success-600">{campaign.sentCount}</span>
                  </div>
                  {campaign.failedCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-danger-600" />
                        <span className="text-sm font-medium text-gray-700">Failed</span>
                      </div>
                      <span className="text-lg font-bold text-danger-600">{campaign.failedCount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Success Rate</span>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                      {campaign.totalRecipients > 0 
                        ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
                        : 0}%
                    </span>
                  </div>
                  {campaign.tracking && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-info-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-info-600" />
                          <span className="text-sm font-medium text-gray-700">Opens</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-info-600">{campaign.tracking.uniqueOpens}</span>
                          <span className="text-xs text-gray-500 ml-1">({campaign.tracking.totalOpens} total)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="h-5 w-5 text-warning-600" />
                          <span className="text-sm font-medium text-gray-700">Clicks</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-warning-600">{campaign.tracking.uniqueClicks}</span>
                          <span className="text-xs text-gray-500 ml-1">({campaign.tracking.totalClicks} total)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary-600" />
                          <span className="text-sm font-medium text-gray-700">Open Rate</span>
                        </div>
                        <span className="text-lg font-bold text-primary-600">{campaign.tracking.openRate}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="h-5 w-5 text-success-600" />
                          <span className="text-sm font-medium text-gray-700">Click Rate</span>
                        </div>
                        <span className="text-lg font-bold text-success-600">{campaign.tracking.clickRate}%</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Created</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{formatDate(campaign.createdAt)}</p>
              </div>
              {campaign.scheduledAt && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-info-400" />
                    <span className="text-sm font-medium text-gray-700">Scheduled</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{formatDate(campaign.scheduledAt)}</p>
                </div>
              )}
              {campaign.sentAt && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="h-4 w-4 text-success-400" />
                    <span className="text-sm font-medium text-gray-700">Sent</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{formatDate(campaign.sentAt)}</p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Last Updated</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{formatDate(campaign.updatedAt)}</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          {campaign.status === 'draft' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href={`/dashboard/admin/campaigns/${campaign.id}/edit`} className="block">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </Button>
                </Link>
                <Button onClick={handleSend} loading={sending} disabled={sending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline" onClick={handleDelete} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

