'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Globe, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Edit,
  Zap,
  Server,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, StatusIcon, Badge } from '@/components/ui'

interface Product {
  id: string
  name: string
  url: string
  type: string
  status: string
  expiresAt: string | null
  lastChecked: string
  createdAt: string
}

interface Check {
  id: string
  status: string
  message: string | null
  responseTime: number | null
  statusCode: number | null
  errorCode: string | null
  errorDetails: any
  httpHeaders: any
  dnsInfo: any
  sslInfo: any
  apiResponse: any
  contentInfo: any
  performance: any
  networkInfo: any
  checkedAt: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchChecks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      } else if (res.status === 404) {
        toast.error('Product not found')
        router.push('/dashboard')
      } else {
        toast.error('Failed to load product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fetchChecks = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/checks`)
      if (res.ok) {
        const data = await res.json()
        setChecks(data)
      }
    } catch (error) {
      console.error('Failed to load checks')
    }
  }

  const handleCheck = async () => {
    setChecking(true)
    try {
      const res = await fetch(`/api/products/${productId}/check`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Product checked successfully!')
        fetchProduct()
        fetchChecks()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to check product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setChecking(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Product deleted successfully')
        router.push('/dashboard')
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'active':
        return 'success'
      case 'warning':
        return 'warning'
      case 'expired':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website':
      case 'domain':
        return <Globe className="h-6 w-6" />
      case 'ssl':
        return <Lock className="h-6 w-6" />
      default:
        return <Globe className="h-6 w-6" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Product not found</p>
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const daysUntilExpiry = getDaysUntilExpiry(product.expiresAt)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition font-medium text-base lg:text-lg">
          <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link href={`/dashboard/products/${productId}/edit`} className="flex-1 sm:flex-initial">
            <Button variant="secondary" size="sm" className="shadow-md w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button onClick={handleCheck} loading={checking} size="sm" className="shadow-lg flex-1 sm:flex-initial">
            <RefreshCw className="h-4 w-4 mr-2" />
            {checking ? 'Checking...' : 'Check Now'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)} className="shadow-lg flex-1 sm:flex-initial">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Product Header */}
      <Card className="mb-6 lg:mb-8 shadow-xl border-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start space-x-4 lg:space-x-5 flex-1 w-full">
              <div className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-gradient-to-br shadow-xl flex-shrink-0 ${
                product.status === 'active' ? 'from-success-500 to-emerald-600 shadow-success-500/30' :
                product.status === 'warning' ? 'from-warning-500 to-orange-600 shadow-warning-500/30' :
                'from-danger-500 to-rose-600 shadow-danger-500/30'
              }`}>
                <div className="text-white">
                  {getTypeIcon(product.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">{product.name}</h1>
                  <Badge variant={getStatusVariant(product.status)} size="sm" className="shadow-md w-fit">
                    {product.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-primary-600 transition"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    {product.url}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <span className="text-sm capitalize">Type: {product.type}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Last checked: {formatDate(product.lastChecked)}</span>
                  </div>
                  {product.expiresAt && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Expires: {formatDate(product.expiresAt)}
                        {daysUntilExpiry !== null && (
                          <span className={`ml-2 font-semibold ${
                            daysUntilExpiry < 0 ? 'text-red-600' :
                            daysUntilExpiry <= 30 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center ml-4">
              <StatusIcon status={product.status as 'active' | 'warning' | 'expired'} size="lg" />
            </div>
          </div>
        </Card>

      {/* Check History */}
      <Card className="shadow-xl border-0">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check History</h2>
            <p className="text-sm text-gray-600">Recent checks and their results</p>
          </div>

          {checks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full mb-6">
                <RefreshCw className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No checks performed yet</h3>
              <p className="text-gray-600 mb-6">Run your first check to see the results here</p>
              <Button onClick={handleCheck} loading={checking}>
                <RefreshCw className="h-5 w-5 mr-2" />
                Run First Check
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {checks.map((check) => {
                const isExpanded = expandedChecks.has(check.id)
                const toggleExpand = () => {
                  const newExpanded = new Set(expandedChecks)
                  if (isExpanded) {
                    newExpanded.delete(check.id)
                  } else {
                    newExpanded.add(check.id)
                  }
                  setExpandedChecks(newExpanded)
                }

                return (
                  <div 
                    key={check.id} 
                    className={`p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50/30 transition-all group border-l-4 ${
                      check.status === 'success' ? 'border-success-500 hover:border-success-600' :
                      check.status === 'warning' ? 'border-warning-500 hover:border-warning-600' :
                      'border-danger-500 hover:border-danger-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-3">
                          <Badge variant={
                            check.status === 'success' ? 'success' :
                            check.status === 'warning' ? 'warning' : 'error'
                          } size="md" className="shadow-sm">
                            {check.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {formatDate(check.checkedAt)}
                          </span>
                          {check.responseTime !== null && (
                            <span className="text-sm text-gray-600 flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                              <Zap className="h-3.5 w-3.5 text-primary-600" />
                              {check.responseTime}ms
                            </span>
                          )}
                          {check.statusCode !== null && (
                            <span className={`text-sm font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                              check.statusCode >= 200 && check.statusCode < 300 
                                ? 'bg-success-100 text-success-700' 
                                : check.statusCode >= 300 && check.statusCode < 400
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-danger-100 text-danger-700'
                            }`}>
                              <Server className="h-3.5 w-3.5" />
                              {check.statusCode}
                            </span>
                          )}
                          {check.errorCode && (
                            <span className="text-xs font-semibold text-danger-700 bg-danger-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {check.errorCode}
                            </span>
                          )}
                        </div>
                        {check.message && (
                          <p className={`text-gray-700 leading-relaxed ${
                            check.status === 'success' ? 'text-gray-700' :
                            check.status === 'warning' ? 'text-warning-800' :
                            'text-danger-800'
                          }`}>
                            {check.message}
                          </p>
                        )}
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            {check.errorDetails && (
                              <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-5 w-5 text-danger-600" />
                                  <h4 className="font-semibold text-danger-900">Error Details</h4>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                  {check.errorDetails.code && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-danger-700">Code:</span>
                                      <code className="bg-danger-100 text-danger-800 px-2 py-0.5 rounded text-xs font-mono">
                                        {check.errorDetails.code}
                                      </code>
                                    </div>
                                  )}
                                  {check.errorDetails.message && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-medium text-danger-700">Message:</span>
                                      <span className="text-danger-800 flex-1">{check.errorDetails.message}</span>
                                    </div>
                                  )}
                                  {check.errorDetails.hostname && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-danger-700">Hostname:</span>
                                      <span className="text-danger-800">{check.errorDetails.hostname}</span>
                                    </div>
                                  )}
                                  {check.errorDetails.syscall && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-danger-700">Syscall:</span>
                                      <code className="bg-danger-100 text-danger-800 px-2 py-0.5 rounded text-xs font-mono">
                                        {check.errorDetails.syscall}
                                      </code>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Enhanced Data Collection Display */}
                            {check.performance && (
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Performance Metrics
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {check.performance.dnsTime !== undefined && (
                                      <div>
                                        <p className="text-xs text-blue-700 mb-1">DNS Lookup</p>
                                        <p className="text-lg font-bold text-blue-900">{check.performance.dnsTime}ms</p>
                                      </div>
                                    )}
                                    {check.performance.connectTime !== undefined && (
                                      <div>
                                        <p className="text-xs text-blue-700 mb-1">Connection</p>
                                        <p className="text-lg font-bold text-blue-900">{check.performance.connectTime}ms</p>
                                      </div>
                                    )}
                                    {check.performance.sslTime !== undefined && (
                                      <div>
                                        <p className="text-xs text-blue-700 mb-1">SSL Handshake</p>
                                        <p className="text-lg font-bold text-blue-900">{check.performance.sslTime}ms</p>
                                      </div>
                                    )}
                                    {check.performance.totalTime !== undefined && (
                                      <div>
                                        <p className="text-xs text-blue-700 mb-1">Total Time</p>
                                        <p className="text-lg font-bold text-blue-900">{check.performance.totalTime}ms</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* DNS Information */}
                            {check.dnsInfo && (
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    DNS Information
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    {check.dnsInfo.ipv4 && check.dnsInfo.ipv4.length > 0 && (
                                      <div>
                                        <span className="font-medium text-purple-700">IPv4:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {check.dnsInfo.ipv4.map((ip: string, idx: number) => (
                                            <code key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">
                                              {ip}
                                            </code>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {check.dnsInfo.ipv6 && check.dnsInfo.ipv6.length > 0 && (
                                      <div>
                                        <span className="font-medium text-purple-700">IPv6:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {check.dnsInfo.ipv6.map((ip: string, idx: number) => (
                                            <code key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">
                                              {ip}
                                            </code>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {check.dnsInfo.mx && check.dnsInfo.mx.length > 0 && (
                                      <div>
                                        <span className="font-medium text-purple-700">MX Records:</span>
                                        <div className="space-y-1 mt-1">
                                          {check.dnsInfo.mx.map((mx: any, idx: number) => (
                                            <div key={idx} className="text-purple-800 text-xs">
                                              {mx.exchange} (Priority: {mx.priority})
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                            )}

                            {/* SSL Information */}
                            {check.sslInfo && (
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    SSL Certificate
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    {check.sslInfo.issuer && (
                                      <div>
                                        <span className="font-medium text-green-700">Issuer:</span>
                                        <p className="text-green-900 mt-1">{check.sslInfo.issuer}</p>
                                      </div>
                                    )}
                                    {check.sslInfo.subject && (
                                      <div>
                                        <span className="font-medium text-green-700">Subject:</span>
                                        <p className="text-green-900 mt-1">{check.sslInfo.subject}</p>
                                      </div>
                                    )}
                                    {check.sslInfo.validFrom && (
                                      <div>
                                        <span className="font-medium text-green-700">Valid From:</span>
                                        <p className="text-green-900 mt-1">{new Date(check.sslInfo.validFrom).toLocaleDateString()}</p>
                                      </div>
                                    )}
                                    {check.sslInfo.validTo && (
                                      <div>
                                        <span className="font-medium text-green-700">Valid To:</span>
                                        <p className="text-green-900 mt-1">{new Date(check.sslInfo.validTo).toLocaleDateString()}</p>
                                      </div>
                                    )}
                                    {check.sslInfo.daysUntilExpiry !== undefined && (
                                      <div className="sm:col-span-2">
                                        <span className="font-medium text-green-700">Days Until Expiry:</span>
                                        <p className={`text-lg font-bold mt-1 ${
                                          check.sslInfo.daysUntilExpiry < 0 ? 'text-danger-600' :
                                          check.sslInfo.daysUntilExpiry <= 30 ? 'text-warning-600' :
                                          'text-green-900'
                                        }`}>
                                          {check.sslInfo.daysUntilExpiry} days
                                        </p>
                                      </div>
                                    )}
                                    {check.sslInfo.algorithm && (
                                      <div>
                                        <span className="font-medium text-green-700">Algorithm:</span>
                                        <p className="text-green-900 mt-1">{check.sslInfo.algorithm}</p>
                                      </div>
                                    )}
                                    {check.sslInfo.fingerprint && (
                                      <div>
                                        <span className="font-medium text-green-700">Fingerprint:</span>
                                        <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono block mt-1 break-all">
                                          {check.sslInfo.fingerprint}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Content Information */}
                            {check.contentInfo && (
                              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                                  <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Content Information
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    {check.contentInfo.title && (
                                      <div>
                                        <span className="font-medium text-amber-700">Page Title:</span>
                                        <p className="text-amber-900 mt-1">{check.contentInfo.title}</p>
                                      </div>
                                    )}
                                    {check.contentInfo.metaDescription && (
                                      <div>
                                        <span className="font-medium text-amber-700">Meta Description:</span>
                                        <p className="text-amber-900 mt-1">{check.contentInfo.metaDescription}</p>
                                      </div>
                                    )}
                                    {check.contentInfo.hasExpectedText !== undefined && (
                                      <div>
                                        <span className="font-medium text-amber-700">Expected Text Found:</span>
                                        <Badge variant={check.contentInfo.hasExpectedText ? 'success' : 'warning'} size="sm" className="ml-2">
                                          {check.contentInfo.hasExpectedText ? 'Yes' : 'No'}
                                        </Badge>
                                      </div>
                                    )}
                                    {check.contentInfo.contentType && (
                                      <div>
                                        <span className="font-medium text-amber-700">Content Type:</span>
                                        <p className="text-amber-900 mt-1">{check.contentInfo.contentType}</p>
                                      </div>
                                    )}
                                    {check.contentInfo.contentLength && (
                                      <div>
                                        <span className="font-medium text-amber-700">Content Length:</span>
                                        <p className="text-amber-900 mt-1">{(check.contentInfo.contentLength / 1024).toFixed(2)} KB</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* API Response */}
                            {check.apiResponse && (
                              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl p-4">
                                  <h4 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                                    <Server className="h-5 w-5" />
                                    API Response
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    {check.apiResponse.type && (
                                      <div>
                                        <span className="font-medium text-cyan-700">Response Type:</span>
                                        <Badge variant="info" size="sm" className="ml-2">
                                          {check.apiResponse.type.toUpperCase()}
                                        </Badge>
                                      </div>
                                    )}
                                    {check.apiResponse.keys && check.apiResponse.keys.length > 0 && (
                                      <div>
                                        <span className="font-medium text-cyan-700">Response Keys:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {check.apiResponse.keys.map((key: string, idx: number) => (
                                            <code key={idx} className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs font-mono">
                                              {key}
                                            </code>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {check.apiResponse.rootElement && (
                                      <div>
                                        <span className="font-medium text-cyan-700">Root Element:</span>
                                        <code className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs font-mono ml-2">
                                          {check.apiResponse.rootElement}
                                        </code>
                                      </div>
                                    )}
                                    {check.apiResponse.length && (
                                      <div>
                                        <span className="font-medium text-cyan-700">Response Length:</span>
                                        <p className="text-cyan-900 mt-1">{(check.apiResponse.length / 1024).toFixed(2)} KB</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Network Information */}
                            {check.networkInfo && (
                              <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Network Information
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    {check.networkInfo.ipAddress && (
                                      <div>
                                        <span className="font-medium text-gray-700">IP Address:</span>
                                        <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono block mt-1">
                                          {check.networkInfo.ipAddress}
                                        </code>
                                      </div>
                                    )}
                                    {check.networkInfo.server && (
                                      <div>
                                        <span className="font-medium text-gray-700">Server:</span>
                                        <p className="text-gray-900 mt-1">{check.networkInfo.server}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* HTTP Headers */}
                            {check.httpHeaders && Object.keys(check.httpHeaders).length > 0 && (
                              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
                                  <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                    <Server className="h-5 w-5" />
                                    HTTP Headers
                                  </h4>
                                  <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto">
                                    {Object.entries(check.httpHeaders).map(([key, value]) => (
                                      <div key={key} className="flex items-start gap-2 py-1 border-b border-indigo-100 last:border-0">
                                        <span className="font-semibold text-indigo-700 min-w-[150px]">{key}:</span>
                                        <code className="text-indigo-900 flex-1 break-all">{String(value)}</code>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                            )}

                            {/* Basic Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {check.responseTime !== null && (
                                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Zap className="h-4 w-4 text-primary-600" />
                                    <span className="text-sm font-semibold text-primary-900">Response Time</span>
                                  </div>
                                  <p className="text-lg font-bold text-primary-700">{check.responseTime}ms</p>
                                  <p className="text-xs text-primary-600 mt-1">
                                    {check.responseTime < 500 ? 'Excellent' :
                                     check.responseTime < 1000 ? 'Good' :
                                     check.responseTime < 2000 ? 'Fair' : 'Slow'}
                                  </p>
                                </div>
                              )}
                              
                              {check.statusCode !== null && (
                                <div className={`border rounded-lg p-3 ${
                                  check.statusCode >= 200 && check.statusCode < 300 
                                    ? 'bg-success-50 border-success-200' 
                                    : check.statusCode >= 300 && check.statusCode < 400
                                    ? 'bg-warning-50 border-warning-200'
                                    : 'bg-danger-50 border-danger-200'
                                }`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Server className={`h-4 w-4 ${
                                      check.statusCode >= 200 && check.statusCode < 300 
                                        ? 'text-success-600' 
                                        : check.statusCode >= 300 && check.statusCode < 400
                                        ? 'text-warning-600'
                                        : 'text-danger-600'
                                    }`} />
                                    <span className={`text-sm font-semibold ${
                                      check.statusCode >= 200 && check.statusCode < 300 
                                        ? 'text-success-900' 
                                        : check.statusCode >= 300 && check.statusCode < 400
                                        ? 'text-warning-900'
                                        : 'text-danger-900'
                                    }`}>
                                      HTTP Status
                                    </span>
                                  </div>
                                  <p className={`text-lg font-bold ${
                                    check.statusCode >= 200 && check.statusCode < 300 
                                      ? 'text-success-700' 
                                      : check.statusCode >= 300 && check.statusCode < 400
                                      ? 'text-warning-700'
                                      : 'text-danger-700'
                                  }`}>
                                    {check.statusCode}
                                  </p>
                                  <p className={`text-xs mt-1 ${
                                    check.statusCode >= 200 && check.statusCode < 300 
                                      ? 'text-success-600' 
                                      : check.statusCode >= 300 && check.statusCode < 400
                                      ? 'text-warning-600'
                                      : 'text-danger-600'
                                  }`}>
                                    {check.statusCode === 200 ? 'OK' :
                                     check.statusCode === 301 || check.statusCode === 302 ? 'Redirect' :
                                     check.statusCode === 404 ? 'Not Found' :
                                     check.statusCode === 500 ? 'Server Error' :
                                     'Other'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex items-start gap-2">
                        <StatusIcon 
                          status={
                            check.status === 'success' ? 'success' :
                            check.status === 'warning' ? 'warning' : 'error'
                          } 
                          size="lg"
                        />
                        <button
                          onClick={toggleExpand}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 shadow-2xl border-0">
            <div className="flex items-center mb-6">
              <div className="p-4 bg-danger-100 rounded-2xl mr-4 shadow-lg">
                <AlertCircle className="h-7 w-7 text-danger-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Delete Product</h3>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Are you sure you want to delete <strong className="text-gray-900">{product?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 shadow-md"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDeleteModal(false)
                  handleDelete()
                }}
                className="flex-1 shadow-lg"
                size="lg"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

