'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, Input } from '@/components/ui'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [reset, setReset] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setVerifying(false)
      return
    }

    // Verify token
    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await res.json()
        
        if (res.ok && data.valid) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          toast.error(data.error || 'Invalid or expired reset token')
        }
      } catch (error) {
        setTokenValid(false)
        toast.error('Failed to verify token')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setReset(true)
        toast.success('Password reset successfully!')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="rounded-2xl shadow-xl" padding="lg">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Verifying reset token...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">expira</span>
            </Link>
          </div>

          <Card className="rounded-2xl shadow-xl" padding="lg">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-danger-100 to-red-100 rounded-full mb-6">
                <AlertCircle className="h-8 w-8 text-danger-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This password reset link is invalid or has expired. Please request a new password reset link.
              </p>
              <div className="space-y-3">
                <Link href="/forgot-password" className="block">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button variant="secondary" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (reset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="rounded-2xl shadow-xl" padding="lg">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-100 to-emerald-100 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your password has been reset successfully. You will be redirected to the login page shortly.
              </p>
              <Link href="/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-primary-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">expira</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>

        <Card className="rounded-2xl shadow-xl" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
              minLength={8}
            />
            <p className="text-xs text-gray-500 -mt-4">Password must be at least 8 characters</p>

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
              minLength={8}
            />

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

