'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Mail, MessageSquare, Send, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Message sent successfully! We will get back to you soon.')
        setSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <Shield className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">expira</span>
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
                <ArrowLeft className="h-5 w-5 inline mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="text-center p-12 shadow-xl border-0">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-success-100 to-emerald-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-success-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for contacting us. We&apos;ve received your message and will get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="shadow-lg">
                  Back to Home
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setSubmitted(false)}
                className="shadow-md"
              >
                Send Another Message
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">expira</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">Home</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full mb-6">
            <MessageSquare className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or need help? We&apos;re here to assist you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 p-6 mb-6">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl mr-4">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-sm text-gray-600">support@expira.io</p>
                </div>
              </div>
            </Card>
            <Card className="shadow-xl border-0 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Response Time</h3>
              <p className="text-sm text-gray-600 mb-2">
                We typically respond within 24 hours during business days.
              </p>
              <p className="text-sm text-gray-600">
                For urgent matters, please mention &quot;URGENT&quot; in your subject line.
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    label="Your Name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    icon={<Mail className="h-5 w-5" />}
                  />
                </div>
                <Input
                  label="Subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help you?"
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your question or issue..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  loading={loading}
                  size="lg"
                  className="w-full shadow-lg bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

