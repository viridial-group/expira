'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Plus, Send, Edit, Trash2, Eye, Calendar, Users, CheckCircle, Clock, XCircle, ArrowLeft, Filter } from 'lucide-react'
import { Card, Badge, Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

interface Campaign {
  id: string
  subject: string
  recipientType: string
  status: string
  sentCount: number
  failedCount: number
  totalRecipients: number
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  creator: {
    name: string | null
    email: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminCampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>('')

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/campaigns?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
        setPagination(prev => data.pagination || prev)
      } else if (res.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
      } else {
        toast.error('Failed to load campaigns')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, router])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Campaign deleted')
        fetchCampaigns()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete campaign')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleSend = async (id: string) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Campaign sent! ${data.sent} emails sent, ${data.failed} failed`)
        fetchCampaigns()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send campaign')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const stats = {
    total: pagination.total,
    sent: campaigns.filter(c => c.status === 'sent').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Campaigns</h1>
            <p className="text-gray-600">Create and manage email campaigns</p>
          </div>
          <Link href="/dashboard/admin/campaigns/new">
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sent</p>
              <p className="text-2xl font-bold text-success-600">{stats.sent}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Drafts</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Edit className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Scheduled</p>
              <p className="text-2xl font-bold text-info-600">{stats.scheduled}</p>
            </div>
            <div className="p-3 bg-info-100 rounded-xl">
              <Clock className="h-6 w-6 text-info-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Campaigns List */}
      <Card className="shadow-xl border-0">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Mail className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">Create your first email campaign to get started.</p>
            <Link href="/dashboard/admin/campaigns/new">
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{campaign.subject}</div>
                        <div className="text-sm text-gray-500 capitalize">{campaign.recipientType} users</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {campaign.totalRecipients}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.status === 'sent' ? (
                          <div className="text-sm">
                            <div className="text-success-600 font-medium">{campaign.sentCount} sent</div>
                            {campaign.failedCount > 0 && (
                              <div className="text-danger-600 text-xs">{campaign.failedCount} failed</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(campaign.createdAt)}</div>
                        {campaign.sentAt && (
                          <div className="text-xs text-gray-500">Sent: {formatDate(campaign.sentAt)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {campaign.status === 'draft' && (
                            <>
                              <Link href={`/dashboard/admin/campaigns/${campaign.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSend(campaign.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(campaign.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {campaign.status === 'sent' && (
                            <Link href={`/dashboard/admin/campaigns/${campaign.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} campaigns
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

