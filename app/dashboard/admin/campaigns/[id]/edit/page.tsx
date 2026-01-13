'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Send, Mail } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

interface Campaign {
  id: string
  subject: string
  content: string
  recipientType: string
  recipientEmails: any
  scheduledAt: string | null
  status: string
}

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipientType: 'all',
    recipientEmails: '',
    scheduledAt: '',
  })

  const fetchCampaign = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`)
      if (res.ok) {
        const data = await res.json()
        const campaign = data.campaign
        setFormData({
          subject: campaign.subject,
          content: campaign.content,
          recipientType: campaign.recipientType,
          recipientEmails: Array.isArray(campaign.recipientEmails)
            ? campaign.recipientEmails.join(', ')
            : '',
          scheduledAt: campaign.scheduledAt
            ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
            : '',
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        subject: formData.subject,
        content: formData.content,
        recipientType: formData.recipientType,
      }

      if (formData.recipientType === 'custom') {
        const emails = formData.recipientEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0)
        
        if (emails.length === 0) {
          toast.error('Please enter at least one email address')
          setLoading(false)
          return
        }
        payload.recipientEmails = emails
      }

      if (formData.scheduledAt) {
        payload.scheduledAt = formData.scheduledAt
      }

      const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Campaign updated successfully!')
        router.push('/dashboard/admin/campaigns')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update campaign')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/send`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Campaign sent! ${data.sent} emails sent, ${data.failed} failed`)
        router.push('/dashboard/admin/campaigns')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to send campaign')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSending(false)
    }
  }

  if (loading && !formData.subject) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg">Loading campaign...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <Link href="/dashboard/admin/campaigns" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Email Campaign</h1>
        <p className="text-gray-600">Update your email campaign</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content (HTML) *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter HTML email content..."
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  You can use HTML tags. For personalized content, use variables like {'{'}{'{'}userName{'}'}{'}'} which will be replaced with the user&apos;s name.
                </p>
              </div>
            </div>
          </Card>

          {/* Recipients */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recipients</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Type *
                </label>
                <select
                  required
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Subscribers</option>
                  <option value="trialing">Trialing Subscribers</option>
                  <option value="canceled">Canceled Subscribers</option>
                  <option value="custom">Custom Email List</option>
                </select>
              </div>

              {formData.recipientType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Addresses (comma-separated) *
                  </label>
                  <textarea
                    required
                    value={formData.recipientEmails}
                    onChange={(e) => setFormData({ ...formData, recipientEmails: e.target.value })}
                    placeholder="user1@example.com, user2@example.com, ..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter email addresses separated by commas
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule (Optional)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Send Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to save as draft. You can send it later.
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard/admin/campaigns">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="outline"
                loading={loading}
                disabled={loading}
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={handleSend}
                loading={sending}
                disabled={sending || loading}
              >
                <Send className="h-5 w-5 mr-2" />
                Send Now
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

