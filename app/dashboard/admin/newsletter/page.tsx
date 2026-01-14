'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Download, Search, Trash2, Users, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  source: string | null
  status: string
  subscribedAt: string
  unsubscribedAt: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function NewsletterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/newsletter?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
        setPagination(prev => data.pagination || prev)
      } else if (res.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
      } else {
        toast.error('Failed to load subscribers')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, search, router])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        status: statusFilter,
      })

      const res = await fetch(`/api/admin/newsletter/export?${params}`)
      if (res.ok) {
        if (format === 'csv') {
          const blob = await res.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
          toast.success('Subscribers exported successfully')
        } else {
          const data = await res.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
          toast.success('Subscribers exported successfully')
        }
      } else {
        toast.error('Failed to export subscribers')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return

    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Subscriber deleted')
        fetchSubscribers()
      } else {
        toast.error('Failed to delete subscriber')
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
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>
      case 'unsubscribed':
        return <Badge variant="gray" size="sm">Unsubscribed</Badge>
      case 'bounced':
        return <Badge variant="error" size="sm">Bounced</Badge>
      default:
        return <Badge variant="gray" size="sm">{status}</Badge>
    }
  }

  const stats = {
    total: pagination.total,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    bounced: subscribers.filter(s => s.status === 'bounced').length,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h1>
            <p className="text-gray-600">Manage your email list and export subscribers</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleExport('csv')} variant="outline">
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => handleExport('json')} variant="outline">
              <Download className="h-5 w-5 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-success-600">{stats.active.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unsubscribed</p>
              <p className="text-2xl font-bold text-warning-600">{stats.unsubscribed.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-xl">
              <XCircle className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bounced</p>
              <p className="text-2xl font-bold text-danger-600">{stats.bounced.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-xl">
              <XCircle className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-xl border-0 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination({ ...pagination, page: 1 })
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination({ ...pagination, page: 1 })
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Subscribers List */}
      <Card className="shadow-xl border-0">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Mail className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No subscribers found</h3>
            <p className="text-gray-600">No subscribers match your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subscribed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{subscriber.name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 capitalize">{subscriber.source || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(subscriber.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{formatDate(subscriber.subscribedAt)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(subscriber.id)}
                          className="text-danger-600 hover:text-danger-700 transition-colors"
                          title="Delete subscriber"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscribers
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

