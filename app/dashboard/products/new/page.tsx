'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Globe, Lock, Zap, Code, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, Input } from '@/components/ui'

interface CustomField {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'date'
  value: string | number | boolean
  category: string
}

const productTypeConfig: Record<string, {
  icon: any
  categories: {
    name: string
    fields: {
      key: string
      label: string
      type: 'text' | 'number' | 'boolean' | 'date'
      placeholder?: string
    }[]
  }[]
}> = {
  website: {
    icon: Globe,
    categories: [
      {
        name: 'Content Verification',
        fields: [
          { key: 'expectedText', label: 'Expected Text', type: 'text', placeholder: 'Text that must appear on page' },
          { key: 'expectedTitle', label: 'Expected Page Title', type: 'text', placeholder: 'Expected <title> content' },
          { key: 'expectedMeta', label: 'Expected Meta Description', type: 'text', placeholder: 'Expected meta description' },
        ],
      },
      {
        name: 'Performance',
        fields: [
          { key: 'maxResponseTime', label: 'Max Response Time (ms)', type: 'number', placeholder: '1000' },
          { key: 'minResponseTime', label: 'Min Response Time (ms)', type: 'number', placeholder: '100' },
        ],
      },
      {
        name: 'HTTP Status',
        fields: [
          { key: 'expectedStatusCode', label: 'Expected Status Code', type: 'number', placeholder: '200' },
          { key: 'allowedStatusCodes', label: 'Allowed Status Codes', type: 'text', placeholder: '200,201,202' },
        ],
      },
    ],
  },
  domain: {
    icon: Globe,
    categories: [
      {
        name: 'Domain Settings',
        fields: [
          { key: 'expectedRegistrar', label: 'Expected Registrar', type: 'text', placeholder: 'NameCheap, GoDaddy, etc.' },
          { key: 'minDaysUntilExpiry', label: 'Alert Before Expiry (days)', type: 'number', placeholder: '30' },
        ],
      },
    ],
  },
  ssl: {
    icon: Lock,
    categories: [
      {
        name: 'Certificate Validation',
        fields: [
          { key: 'minDaysUntilExpiry', label: 'Alert Before Expiry (days)', type: 'number', placeholder: '30' },
          { key: 'expectedIssuer', label: 'Expected Certificate Issuer', type: 'text', placeholder: 'Let\'s Encrypt, DigiCert, etc.' },
          { key: 'requireValidChain', label: 'Require Valid Certificate Chain', type: 'boolean' },
        ],
      },
    ],
  },
  api: {
    icon: Code,
    categories: [
      {
        name: 'API Response',
        fields: [
          { key: 'expectedStatusCode', label: 'Expected Status Code', type: 'number', placeholder: '200' },
          { key: 'expectedResponseFormat', label: 'Expected Response Format', type: 'text', placeholder: 'JSON, XML, etc.' },
          { key: 'expectedJsonKey', label: 'Expected JSON Key', type: 'text', placeholder: 'status, data, etc.' },
          { key: 'expectedJsonValue', label: 'Expected JSON Value', type: 'text', placeholder: 'success, ok, etc.' },
        ],
      },
      {
        name: 'Performance',
        fields: [
          { key: 'maxResponseTime', label: 'Max Response Time (ms)', type: 'number', placeholder: '500' },
          { key: 'timeout', label: 'Request Timeout (ms)', type: 'number', placeholder: '5000' },
        ],
      },
      {
        name: 'Authentication',
        fields: [
          { key: 'requireAuth', label: 'Require Authentication', type: 'boolean' },
          { key: 'authHeader', label: 'Auth Header Name', type: 'text', placeholder: 'Authorization' },
        ],
      },
    ],
  },
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'website' as 'website' | 'domain' | 'ssl' | 'api',
    expiresAt: '',
  })
  const [customFields, setCustomFields] = useState<Record<string, CustomField>>({})

  const addCustomField = (category: string, field: { key: string; label: string; type: 'text' | 'number' | 'boolean' | 'date'; placeholder?: string }) => {
    const fieldKey = `${category}_${field.key}`
    setCustomFields({
      ...customFields,
      [fieldKey]: {
        key: field.key,
        label: field.label,
        type: field.type,
        value: field.type === 'boolean' ? false : field.type === 'number' ? 0 : '',
        category,
      },
    })
  }

  const removeCustomField = (fieldKey: string) => {
    const newFields = { ...customFields }
    delete newFields[fieldKey]
    setCustomFields(newFields)
  }

  const updateCustomField = (fieldKey: string, value: string | number | boolean) => {
    setCustomFields({
      ...customFields,
      [fieldKey]: {
        ...customFields[fieldKey],
        value,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build customFields object
      const customFieldsObj: Record<string, any> = {}
      Object.entries(customFields).forEach(([key, field]) => {
        if (field.value !== '' && field.value !== null && field.value !== undefined) {
          // Group by category
          if (!customFieldsObj[field.category]) {
            customFieldsObj[field.category] = {}
          }
          customFieldsObj[field.category][field.key] = field.value
        }
      })

      const productData: any = {
        name: formData.name,
        url: formData.url,
        type: formData.type,
      }

      if (formData.expiresAt) {
        productData.expiresAt = formData.expiresAt
      }

      if (Object.keys(customFieldsObj).length > 0) {
        productData.customFields = customFieldsObj
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (res.ok) {
        toast.success('Product added successfully!')
        router.push('/dashboard')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to add product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentConfig = productTypeConfig[formData.type]
  const Icon = currentConfig?.icon || Globe

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center">
          <Icon className="h-6 w-6 text-primary-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>
      </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <Input
                label="Product Name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Website"
              />

              <Input
                label="URL"
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value as any })
                      setCustomFields({}) // Reset custom fields when type changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="website">Website</option>
                    <option value="domain">Domain</option>
                    <option value="ssl">SSL Certificate</option>
                    <option value="api">API</option>
                  </select>
                </div>

                <div>
                  <Input
                    label="Expiration Date (Optional)"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Custom Fields by Category */}
          {currentConfig && (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Custom Fields</h2>
                <p className="text-sm text-gray-500">Add custom checks for this product type</p>
              </div>

              {currentConfig.categories.map((category) => {
                const categoryFields = Object.entries(customFields).filter(
                  ([_, field]) => field.category === category.name
                )

                return (
                  <div key={category.name} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.fields.map((field) => {
                          const fieldKey = `${category.name}_${field.key}`
                          const isAdded = customFields[fieldKey]
                          return (
                            <button
                              key={field.key}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  removeCustomField(fieldKey)
                                } else {
                                  addCustomField(category.name, field)
                                }
                              }}
                              className={`text-sm px-3 py-1 rounded-lg transition ${
                                isAdded
                                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <X className="h-3 w-3 inline mr-1" />
                                  Remove {field.label}
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 inline mr-1" />
                                  Add {field.label}
                                </>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {categoryFields.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {categoryFields.map(([fieldKey, field]) => (
                          <div key={fieldKey} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                              </label>
                              {field.type === 'text' && (
                                <input
                                  type="text"
                                  value={field.value as string}
                                  onChange={(e) => updateCustomField(fieldKey, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                  placeholder={category.fields.find(f => f.key === field.key)?.placeholder}
                                />
                              )}
                              {field.type === 'number' && (
                                <input
                                  type="number"
                                  value={field.value as number}
                                  onChange={(e) => updateCustomField(fieldKey, parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                  placeholder={category.fields.find(f => f.key === field.key)?.placeholder}
                                />
                              )}
                              {field.type === 'boolean' && (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value as boolean}
                                    onChange={(e) => updateCustomField(fieldKey, e.target.checked)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-600">Enable this check</span>
                                </label>
                              )}
                              {field.type === 'date' && (
                                <input
                                  type="date"
                                  value={field.value as string}
                                  onChange={(e) => updateCustomField(fieldKey, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCustomField(fieldKey)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} className="flex-1">
              {loading ? (
                <>
                  <Zap className="h-5 w-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
    </div>
  )
}

