'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, MessageSquare, Send, CheckCircle, Clock, Archive, Eye, Reply, X, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, Badge } from '@/components/ui'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: string
  responses: Array<{
    id: string
    message: string
    createdAt: string
    user: {
      name: string | null
      email: string
    }
  }>
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/contact?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      } else if (res.status === 403) {
        toast.error('Admin access required')
      } else {
        toast.error('Failed to load messages')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (res.ok) {
        toast.success('Status updated')
        fetchMessages()
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status })
        }
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    setReplying(true)
    try {
      const res = await fetch('/api/admin/contact/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactMessageId: selectedMessage.id,
          message: replyText,
        }),
      })

      if (res.ok) {
        toast.success('Reply sent successfully!')
        setReplyText('')
        fetchMessages()
        // Refresh selected message
        const updatedMessage = messages.find(m => m.id === selectedMessage.id)
        if (updatedMessage) {
          setSelectedMessage(updatedMessage)
        }
      } else {
        toast.error('Failed to send reply')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setReplying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="primary" size="sm">New</Badge>
      case 'read':
        return <Badge variant="info" size="sm">Read</Badge>
      case 'replied':
        return <Badge variant="success" size="sm">Replied</Badge>
      case 'archived':
        return <Badge variant="gray" size="sm">Archived</Badge>
      default:
        return <Badge variant="gray" size="sm">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredMessages = messages.filter(msg => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        msg.name.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        msg.subject.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Contact Messages</h1>
            <p className="text-sm lg:text-lg text-gray-600">Manage and respond to customer inquiries</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card padding="none" className="overflow-hidden border-0 shadow-lg">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'new', 'read', 'replied', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      statusFilter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="divide-y divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages found</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      selectedMessage?.id === message.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{message.name}</p>
                        <p className="text-sm text-gray-600 truncate">{message.email}</p>
                      </div>
                      {getStatusBadge(message.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 truncate">{message.subject}</p>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{message.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                      {message.responses.length > 0 && (
                        <span className="text-xs text-primary-600 font-semibold">
                          {message.responses.length} {message.responses.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="border-0 shadow-lg">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedMessage.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(selectedMessage.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMessage.status)}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                        className="p-2 text-gray-600 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition"
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <p className="text-sm font-semibold text-gray-900">From:</p>
                  <p className="text-sm text-gray-600">{selectedMessage.name}</p>
                </div>
              </div>

              {/* Message Content */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Message:</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Responses */}
              {selectedMessage.responses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Responses:</h3>
                  <div className="space-y-4">
                    {selectedMessage.responses.map((response) => (
                      <div key={response.id} className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success-600" />
                            <span className="text-sm font-semibold text-gray-900">
                              {response.user.name || response.user.email}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(response.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Reply:</h3>
                <textarea
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-4"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReply}
                    loading={replying}
                    className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {replying ? 'Sending...' : 'Send Reply'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setReplyText('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <div className="text-center py-20">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a message</h3>
                <p className="text-gray-600">Choose a message from the list to view details and reply</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

