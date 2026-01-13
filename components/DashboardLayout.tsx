'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Plus,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  CreditCard,
  MessageSquare,
  Users,
  Mail,
  BarChart3,
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin || false))
      .catch(() => setIsAdmin(false))
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Product', href: '/dashboard/products/new', icon: Plus },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Payment History', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ...(isAdmin ? [
      { name: 'Contact Messages', href: '/dashboard/admin/contact', icon: MessageSquare },
      { name: 'Subscribers', href: '/dashboard/admin/subscribers', icon: Users },
      { name: 'Email Campaigns', href: '/dashboard/admin/campaigns', icon: Mail },
      { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    ] : []),
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white border-r border-gray-200 shadow-xl lg:shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-8 border-b border-gray-200 bg-gradient-to-br from-primary-50 via-white to-blue-50/30">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative p-2 lg:p-2.5 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
              <div className="ml-2 lg:ml-3">
                <span className="block text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  expira
                </span>
                <span className="block text-xs text-gray-500 font-medium hidden lg:block">Admin Panel</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 lg:px-6 py-6 lg:py-8 space-y-2 overflow-y-auto">
            <div className="mb-4 lg:mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">Main Menu</p>
            </div>
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 lg:px-4 py-3 lg:py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {active && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 lg:p-6 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <button
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                router.push('/login')
              }}
              className="flex items-center w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <LogOut className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 xl:pl-72 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6 lg:px-8 xl:px-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Link
                href="/dashboard/notifications"
                className="relative p-2 lg:p-3 text-gray-600 hover:text-primary-600 rounded-lg lg:rounded-xl hover:bg-primary-50 transition-all group"
                title="Notifications"
              >
                <Bell className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 block h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-danger-500 ring-2 ring-white animate-pulse shadow-lg"></span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="p-2 lg:p-3 text-gray-600 hover:text-primary-600 rounded-lg lg:rounded-xl hover:bg-primary-50 transition-all group"
                title="Settings"
              >
                <Settings className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
              </Link>
              <div className="h-8 lg:h-10 w-px bg-gray-200 mx-1 lg:mx-2"></div>
              <div className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl hover:bg-gray-50 transition cursor-pointer group">
                <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs lg:text-sm shadow-lg flex-shrink-0">
                  JD
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 lg:py-10 px-4 sm:px-6 lg:px-8 xl:px-10 bg-gray-50/50 min-h-screen">{children}</main>
      </div>
    </div>
  )
}

