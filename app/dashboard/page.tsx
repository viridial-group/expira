'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Globe, Lock, TrendingUp, Search, Filter, MoreVertical, Calendar, Clock } from 'lucide-react'
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
}

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Product deleted')
        fetchProducts()
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
        return <Globe className="h-5 w-5" />
      case 'ssl':
        return <Lock className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    warning: products.filter(p => p.status === 'warning').length,
    expired: products.filter(p => p.status === 'expired').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Monitor and manage all your products in one place</p>
          </div>
          <Link href="/dashboard/products/new" className="w-full sm:w-auto">
            <Button size="md" className="shadow-lg w-full sm:w-auto">
              <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-10">
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 border-0 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-full -mr-16 -mt-16 lg:-mr-20 lg:-mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl lg:rounded-2xl shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-1 lg:mb-2 uppercase tracking-wide">Total Products</p>
                <p className="text-3xl lg:text-5xl font-extrabold text-gray-900">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center text-xs lg:text-sm">
              <span className="px-2 py-1 lg:px-3 lg:py-1.5 bg-success-100 text-success-700 rounded-lg font-semibold">All monitored</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 border-0 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-success-500/20 to-emerald-500/20 rounded-full -mr-16 -mt-16 lg:-mr-20 lg:-mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-success-500 to-emerald-600 rounded-xl lg:rounded-2xl shadow-xl shadow-success-500/30 group-hover:scale-110 transition-transform">
                <StatusIcon status="active" size="lg" className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-1 lg:mb-2 uppercase tracking-wide">Active</p>
                <p className="text-3xl lg:text-5xl font-extrabold text-success-600">{stats.active}</p>
              </div>
            </div>
            <div className="flex items-center text-xs lg:text-sm">
              <span className="px-2 py-1 lg:px-3 lg:py-1.5 bg-success-100 text-success-700 rounded-lg font-semibold">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
              </span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 border-0 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-warning-500/20 to-orange-500/20 rounded-full -mr-16 -mt-16 lg:-mr-20 lg:-mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-warning-500 to-orange-600 rounded-xl lg:rounded-2xl shadow-xl shadow-warning-500/30 group-hover:scale-110 transition-transform">
                <StatusIcon status="warning" size="lg" className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-1 lg:mb-2 uppercase tracking-wide">Warning</p>
                <p className="text-3xl lg:text-5xl font-extrabold text-warning-600">{stats.warning}</p>
              </div>
            </div>
            <div className="flex items-center text-xs lg:text-sm">
              <span className="px-2 py-1 lg:px-3 lg:py-1.5 bg-warning-100 text-warning-700 rounded-lg font-semibold">Needs attention</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 border-0 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-danger-500/20 to-rose-500/20 rounded-full -mr-16 -mt-16 lg:-mr-20 lg:-mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-danger-500 to-rose-600 rounded-xl lg:rounded-2xl shadow-xl shadow-danger-500/30 group-hover:scale-110 transition-transform">
                <StatusIcon status="expired" size="lg" className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-1 lg:mb-2 uppercase tracking-wide">Expired</p>
                <p className="text-3xl lg:text-5xl font-extrabold text-danger-600">{stats.expired}</p>
              </div>
            </div>
            <div className="flex items-center text-xs lg:text-sm">
              <span className="px-2 py-1 lg:px-3 lg:py-1.5 bg-danger-100 text-danger-700 rounded-lg font-semibold">Action required</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Products List */}
      <Card padding="none" className="overflow-hidden shadow-xl border-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Your Products</h2>
              <p className="text-xs sm:text-sm text-gray-600">Manage and monitor all your products</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-9 lg:pl-11 pr-3 lg:pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full sm:w-48 lg:w-56 shadow-sm"
                />
              </div>
              <button className="p-2 lg:p-2.5 border border-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-50 transition shadow-sm flex-shrink-0">
                <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full mb-6">
              <Globe className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by adding your first product to monitor. We&apos;ll keep track of expiration dates and send you alerts.
            </p>
            <Link href="/dashboard/products/new">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product, index) => {
              const daysUntilExpiry = product.expiresAt 
                ? Math.ceil((new Date(product.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null
              
              return (
                <Link
                  key={product.id}
                  href={`/dashboard/products/${product.id}`}
                  className="block p-6 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-blue-50/50 transition-all group border-l-4 border-transparent hover:border-primary-500 hover:shadow-md"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5 flex-1 min-w-0">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform flex-shrink-0 ${
                        product.status === 'active' ? 'from-success-500 to-emerald-600 shadow-success-500/30' :
                        product.status === 'warning' ? 'from-warning-500 to-orange-600 shadow-warning-500/30' :
                        'from-danger-500 to-rose-600 shadow-danger-500/30'
                      }`}>
                        <div className="text-white">
                          {getTypeIcon(product.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors truncate">
                            {product.name}
                          </h3>
                          <Badge variant={getStatusVariant(product.status)} size="sm">
                            {product.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">{product.url}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span className="capitalize">{product.type}</span>
                          </span>
                          {product.expiresAt && (
                            <span className={`flex items-center gap-1 ${
                              daysUntilExpiry !== null && daysUntilExpiry < 30 ? 'text-red-600 font-semibold' : ''
                            }`}>
                              <Calendar className="h-3 w-3" />
                              <span>
                                {daysUntilExpiry !== null && daysUntilExpiry > 0 
                                  ? `${daysUntilExpiry} days left`
                                  : daysUntilExpiry === 0
                                  ? 'Expires today'
                                  : 'Expired'
                                }
                              </span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Checked {new Date(product.lastChecked).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <StatusIcon status={product.status as 'active' | 'warning' | 'expired'} size="lg" />
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(product.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete product"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
