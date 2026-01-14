'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Mail, Lock, User, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, Input } from '@/components/ui'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const affiliateCodeParam = searchParams.get('ref') // Get affiliate code from URL
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    affiliateCode: affiliateCodeParam || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          affiliateCode: formData.affiliateCode || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Account created successfully!')
        // Auto-login after registration
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          })

          if (loginRes.ok) {
            toast.success('Welcome! Redirecting...')
            // Redirect to the specified page or default to dashboard
            router.push(redirect || '/dashboard')
          } else {
            // If auto-login fails, redirect to login page
            router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login')
          }
        } catch {
          router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login')
        }
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-primary-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">expira</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start monitoring your products today</p>
        </div>

        <Card className="rounded-2xl shadow-xl" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<User className="h-5 w-5" />}
              placeholder="John Doe"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail className="h-5 w-5" />}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              icon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              icon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
            />

            <Input
              label="Code de Parrainage (Optionnel)"
              type="text"
              value={formData.affiliateCode}
              onChange={(e) => setFormData({ ...formData, affiliateCode: e.target.value.toUpperCase() })}
              icon={<Gift className="h-5 w-5" />}
              placeholder="CODE123"
            />

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

