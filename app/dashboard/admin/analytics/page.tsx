'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Eye, TrendingUp, Globe, Clock, BarChart3, Calendar, ExternalLink } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface Visitor {
  id: string
  sessionId: string
  ipAddress: string | null
  country: string | null
  city: string | null
  firstVisit: string
  lastVisit: string
  visitCount: number
  totalPageViews: number
  lastPage: string | null
}

interface PageView {
  path: string
  views: number
}

interface Referrer {
  referrer: string
  count: number
}

interface DailyVisit {
  date: string
  count: number
}

interface CountryVisit {
  country: string
  count: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
    period: 30,
  })
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [topPages, setTopPages] = useState<PageView[]>([])
  const [referrers, setReferrers] = useState<Referrer[]>([])
  const [visitsByDay, setVisitsByDay] = useState<DailyVisit[]>([])
  const [visitsByCountry, setVisitsByCountry] = useState<CountryVisit[]>([])
  const [days, setDays] = useState(30)
  const [page, setPage] = useState(1)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics/visitors?days=${days}&page=${page}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setVisitors(data.visitors || [])
        setTopPages(data.topPages || [])
        setReferrers(data.referrers || [])
        setVisitsByDay(data.visitsByDay || [])
        setVisitsByCountry(data.visitsByCountry || [])
      } else if (res.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
      } else {
        toast.error('Failed to load analytics')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [days, page, router])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Visitor Analytics</h1>
            <p className="text-gray-600">Track and analyze website visitors</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Visits</p>
              <p className="text-2xl font-bold text-success-600">{stats.totalVisits.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-xl">
              <Eye className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unique Visitors</p>
              <p className="text-2xl font-bold text-info-600">{stats.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-info-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-info-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Visits/Visitor</p>
              <p className="text-2xl font-bold text-warning-600">
                {stats.totalVisitors > 0 
                  ? (stats.totalVisits / stats.totalVisitors).toFixed(1)
                  : '0'}
              </p>
            </div>
            <div className="p-3 bg-warning-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top Pages */}
        <Card className="shadow-xl border-0">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Top Pages</h2>
            <p className="text-sm text-gray-600">Most visited pages</p>
          </div>
          <div className="p-6">
            {topPages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No page views yet</p>
            ) : (
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{page.path}</p>
                      </div>
                    </div>
                    <Badge variant="primary" size="sm">{page.views.toLocaleString()} views</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Top Referrers */}
        <Card className="shadow-xl border-0">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Top Referrers</h2>
            <p className="text-sm text-gray-600">Where visitors come from</p>
          </div>
          <div className="p-6">
            {referrers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No referrer data yet</p>
            ) : (
              <div className="space-y-3">
                {referrers.map((ref, index) => (
                  <div key={ref.referrer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div className="max-w-xs truncate">
                        <p className="font-medium text-gray-900 truncate">{ref.referrer || 'Direct'}</p>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">{ref.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Visits by Country Chart */}
      <Card className="shadow-xl border-0 mb-6">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Visits by Country</h2>
          <p className="text-sm text-gray-600">Geographic distribution of visitors</p>
        </div>
        <div className="p-6">
          {visitsByCountry.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No country data yet</p>
          ) : (
            <div className="space-y-4">
              {visitsByCountry.map((item, index) => {
                const maxCount = visitsByCountry[0]?.count || 1
                const percentage = (item.count / maxCount) * 100
                
                return (
                  <div key={item.country} className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{item.count.toLocaleString()} visits</span>
                        <Badge variant="primary" size="sm">
                          {((item.count / stats.totalVisits) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Recent Visitors */}
      <Card className="shadow-xl border-0">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Visitors</h2>
          <p className="text-sm text-gray-600">Latest visitor activity</p>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : visitors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No visitors yet</h3>
            <p className="text-gray-600">Visitor data will appear here once people start visiting your site.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visits</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Page Views</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Page</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-gray-900">{visitor.ipAddress || 'Unknown'}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {visitor.city && visitor.country 
                            ? `${visitor.city}, ${visitor.country}`
                            : visitor.country || visitor.city || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="primary" size="sm">{visitor.visitCount}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{visitor.totalPageViews}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 max-w-xs truncate">
                          {visitor.lastPage || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(visitor.lastVisit)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

