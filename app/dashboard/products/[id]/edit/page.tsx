'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Globe, Lock, Zap, Code, Save, Loader } from 'lucide-react'
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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'website' as 'website' | 'domain' | 'ssl' | 'api',
    expiresAt: '',
  })
  const [customFields, setCustomFields] = useState<Record<string, CustomField>>({})

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const product = await res.json()
        setFormData({
          name: product.name,
          url: product.url,
          type: product.type,
          expiresAt: product.expiresAt ? new Date(product.expiresAt).toISOString().split('T')[0] : '',
        })

        // Load custom fields from product
        if (product.customFields && typeof product.customFields === 'object') {
          const loadedFields: Record<string, CustomField> = {}
          Object.entries(product.customFields).forEach(([categoryName, categoryFields]: [string, any]) => {
            if (typeof categoryFields === 'object') {
              Object.entries(categoryFields).forEach(([fieldKey, fieldValue]: [string, any]) => {
                const fieldId = `${categoryName}_${fieldKey}`
                // Find field config
                const config = productTypeConfig[product.type]
                if (config) {
                  const category = config.categories.find(c => c.name === categoryName)
                  if (category) {
                    const fieldConfig = category.fields.find(f => f.key === fieldKey)
                    if (fieldConfig) {
                      loadedFields[fieldId] = {
                        key: fieldKey,
                        label: fieldConfig.label,
                        type: fieldConfig.type,
                        value: fieldValue,
                        category: categoryName,
                      }
                    }
                  }
                }
              })
            }
          })
          setCustomFields(loadedFields)
        }
      } else {
        toast.error('Failed to load product')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

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
    setSaving(true)

    try {
      // Build customFields object
      const customFieldsObj: Record<string, any> = {}
      Object.entries(customFields).forEach(([key, field]) => {
        if (field.value !== '' && field.value !== null && field.value !== undefined) {
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

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (res.ok) {
        toast.success('Product updated successfully!')
        router.push(`/dashboard/products/${productId}`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const currentConfig = productTypeConfig[formData.type]
  const Icon = currentConfig?.icon || Globe

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/products/${productId}`} className="inline-flex items-center text-gray-600 hover:text-primary-600 transition font-medium mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Product
        </Link>
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl mr-3 shadow-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <Link href={`/dashboard/products/${productId}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
      </form>
    </div>
  )
}

