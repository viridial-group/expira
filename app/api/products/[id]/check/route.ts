import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'
import https from 'https'
import { URL } from 'url'
import {
  collectDNSInfo,
  collectSSLInfo,
  collectHTTPHeaders,
  collectContentInfo,
  collectAPIResponse,
  collectPerformanceMetrics,
  collectNetworkInfo,
  CollectedData,
} from '@/lib/check-collectors'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const now = new Date()
    let status = 'active'
    let message = 'Product is healthy'
    let checkStatus = 'success'
    let responseTime: number | null = null
    let statusCode: number | null = null
    let errorCode: string | null = null
    let errorDetails: any = null
    
    // Enhanced data collection
    const collectedData: CollectedData = {}
    let httpHeaders: Record<string, string> | null = null
    let responseText = ''
    let contentType = ''
    const performanceTimings = {
      dnsStart: 0,
      dnsEnd: 0,
      connectStart: 0,
      connectEnd: 0,
      sslStart: 0,
      sslEnd: 0,
      transferStart: 0,
      transferEnd: 0,
    }

    // Check if website/URL is accessible
    try {
      const url = product.url.startsWith('http') ? product.url : `https://${product.url}`
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      
      // Collect DNS information
      performanceTimings.dnsStart = Date.now()
      collectedData.dnsInfo = await collectDNSInfo(hostname)
      performanceTimings.dnsEnd = Date.now()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const startTime = Date.now()
        performanceTimings.connectStart = startTime
        
        const response = await fetch(url, {
          method: product.type === 'api' ? 'GET' : 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'expira/1.0',
          },
        })
        
        performanceTimings.connectEnd = Date.now()
        responseTime = Date.now() - startTime
        statusCode = response.status
        contentType = response.headers.get('content-type') || ''
        
        // Collect HTTP headers
        httpHeaders = collectHTTPHeaders(response.headers)
        collectedData.httpHeaders = httpHeaders
        
        // Collect network info
        const server = response.headers.get('server') || undefined
        const ipAddress = collectedData.dnsInfo?.ipv4?.[0]
        collectedData.networkInfo = collectNetworkInfo(ipAddress, server)

        clearTimeout(timeoutId)

        // For API and website types, get full response
        if (product.type === 'api' || product.type === 'website') {
          try {
            const fullResponse = await fetch(url, {
              method: 'GET',
              signal: controller.signal,
              redirect: 'follow',
              headers: {
                'User-Agent': 'expira/1.0',
              },
            })
            responseText = await fullResponse.text()
            
            // Collect content info for websites
            if (product.type === 'website') {
              const customFields = product.customFields as any
              const expectedText = customFields?.['Content Verification']?.expectedText
              collectedData.contentInfo = collectContentInfo(responseText, expectedText)
            }
            
            // Collect API response for APIs
            if (product.type === 'api') {
              collectedData.apiResponse = collectAPIResponse(responseText, contentType)
            }
          } catch (e) {
            // Fallback to HEAD response
          }
        }

        if (!response.ok) {
          status = 'warning'
          checkStatus = 'warning'
          message = `Website returned status ${response.status}: ${response.statusText}`
        } else {
          message = `Website is accessible (Status: ${response.status}, Response time: ${responseTime}ms)`
        }

        // Check SSL certificate for HTTPS URLs
        if (url.startsWith('https://')) {
          try {
            performanceTimings.sslStart = Date.now()
            const sslInfo = await collectSSLInfo(url)
            performanceTimings.sslEnd = Date.now()
            
            if (sslInfo) {
              collectedData.sslInfo = sslInfo
              
              // Check SSL expiry
              if (sslInfo.daysUntilExpiry !== undefined) {
                if (sslInfo.daysUntilExpiry < 0) {
                  status = 'expired'
                  checkStatus = 'error'
                  message = `SSL certificate expired ${Math.abs(sslInfo.daysUntilExpiry)} days ago`
                } else if (sslInfo.daysUntilExpiry <= 30) {
                  if (status === 'active') {
                    status = 'warning'
                    checkStatus = 'warning'
                  }
                  message = `${message}. SSL certificate expires in ${sslInfo.daysUntilExpiry} days`
                }
              }
            }
            
            // Also do a strict check
            await new Promise<void>((resolve, reject) => {
              const req = https.request({
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname,
                method: 'HEAD',
                rejectUnauthorized: true,
              }, (res: any) => {
                resolve()
              })

              req.on('error', (error: any) => {
                errorCode = error.code || 'UNKNOWN_ERROR'
                errorDetails = {
                  code: error.code,
                  message: error.message,
                  syscall: error.syscall,
                  hostname: urlObj.hostname,
                }
                
                if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                  status = 'expired'
                  checkStatus = 'error'
                  message = `Domain not found or not accessible: ${error.message}`
                } else if (error.code === 'CERT_HAS_EXPIRED') {
                  status = 'expired'
                  checkStatus = 'error'
                  message = 'SSL certificate has expired'
                } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.code === 'CERT_SIGNATURE_FAILURE') {
                  status = 'warning'
                  checkStatus = 'warning'
                  message = 'SSL certificate verification failed'
                } else {
                  status = 'warning'
                  checkStatus = 'warning'
                  message = `Connection error: ${error.message}`
                }
                reject(error)
              })

              req.setTimeout(10000, () => {
                req.destroy()
                status = 'warning'
                checkStatus = 'warning'
                message = 'Connection timeout'
                reject(new Error('Timeout'))
              })

              req.end()
            })
          } catch (sslError: any) {
            // SSL check errors are already handled above
            if (status === 'active') {
              status = 'warning'
              checkStatus = 'warning'
              message = `SSL check failed: ${sslError.message}`
            }
          }
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        errorCode = fetchError.code || fetchError.name || 'FETCH_ERROR'
        errorDetails = {
          name: fetchError.name,
          code: fetchError.code,
          message: fetchError.message,
          stack: fetchError.stack,
        }
        
        if (fetchError.name === 'AbortError') {
          status = 'warning'
          checkStatus = 'warning'
          message = 'Request timeout - website took too long to respond'
        } else if (fetchError.code === 'ENOTFOUND' || fetchError.message?.includes('getaddrinfo ENOTFOUND') || fetchError.message?.includes('Failed to fetch')) {
          status = 'expired'
          checkStatus = 'error'
          message = 'Domain not found - the website does not exist or DNS lookup failed'
        } else if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('ECONNREFUSED')) {
          status = 'expired'
          checkStatus = 'error'
          message = 'Connection refused - the website is not accessible'
        } else if (fetchError.code === 'CERT_HAS_EXPIRED' || fetchError.message?.includes('certificate has expired')) {
          status = 'expired'
          checkStatus = 'error'
          message = 'SSL certificate has expired'
        } else if (fetchError.message?.includes('network') || fetchError.message?.includes('fetch')) {
          status = 'expired'
          checkStatus = 'error'
          message = `Unable to access website: ${fetchError.message}`
        } else {
          status = 'warning'
          checkStatus = 'warning'
          message = `Unable to access website: ${fetchError.message || 'Unknown error'}`
        }
      }
    } catch (error: any) {
      status = 'expired'
      checkStatus = 'error'
      message = `Failed to check website: ${error.message}`
    }

    // Calculate performance metrics
    const dnsTime = performanceTimings.dnsEnd - performanceTimings.dnsStart
    const connectTime = performanceTimings.connectEnd - performanceTimings.connectStart
    const sslTime = performanceTimings.sslEnd - performanceTimings.sslStart
    const transferTime = responseTime !== null ? Math.max(0, responseTime - (dnsTime + connectTime + sslTime)) : 0
    
    collectedData.performance = collectPerformanceMetrics(
      dnsTime,
      connectTime,
      sslTime,
      transferTime
    )

    // Check custom fields if set (organized by categories)
    const productWithCustomFields = product as any
    if (productWithCustomFields.customFields && typeof productWithCustomFields.customFields === 'object') {
      const customFieldsData = productWithCustomFields.customFields
      let actualStatusCode = statusCode || 0
      let responseHeaders: Headers | null = null

      // Use already collected responseText if available, otherwise fetch
      if (!responseText && product.type !== 'api') {
        try {
          const url = product.url.startsWith('http') ? product.url : `https://${product.url}`
          const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: {
              'User-Agent': 'expira/1.0',
            },
          })
          actualStatusCode = response.status
          if (!statusCode) statusCode = response.status
          responseHeaders = response.headers
          responseText = await response.text()
          
          // Update content info if not already collected
          if (!collectedData.contentInfo && product.type === 'website') {
            const expectedText = customFieldsData['Content Verification']?.expectedText
            collectedData.contentInfo = collectContentInfo(responseText, expectedText)
          }
        } catch (error) {
          // Error already handled above
        }
      }

      // Iterate through all categories
      Object.entries(customFieldsData).forEach(([categoryName, categoryFields]: [string, any]) => {
        if (typeof categoryFields !== 'object') return

        // Content Verification fields
        if (categoryFields.expectedText && responseText && !responseText.includes(categoryFields.expectedText)) {
          status = 'warning'
          checkStatus = 'warning'
          message = `${message}. Expected text "${categoryFields.expectedText}" not found in response`
        }

        if (categoryFields.expectedTitle && responseText) {
          const titleMatch = responseText.match(/<title[^>]*>([^<]+)<\/title>/i)
          const actualTitle = titleMatch ? titleMatch[1].trim() : ''
          if (actualTitle !== categoryFields.expectedTitle) {
            status = 'warning'
            checkStatus = 'warning'
            message = `${message}. Expected title "${categoryFields.expectedTitle}", got "${actualTitle}"`
          }
        }

        if (categoryFields.expectedMeta && responseText) {
          const metaMatch = responseText.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
          const actualMeta = metaMatch ? metaMatch[1].trim() : ''
          if (!actualMeta.includes(categoryFields.expectedMeta)) {
            status = 'warning'
            checkStatus = 'warning'
            message = `${message}. Expected meta description containing "${categoryFields.expectedMeta}" not found`
          }
        }

        // HTTP Status fields
        if (categoryFields.expectedStatusCode && actualStatusCode !== categoryFields.expectedStatusCode) {
          status = 'warning'
          checkStatus = 'warning'
          message = `${message}. Expected status code ${categoryFields.expectedStatusCode}, got ${actualStatusCode}`
        }

        if (categoryFields.allowedStatusCodes) {
          const allowedCodes = categoryFields.allowedStatusCodes.split(',').map((c: string) => parseInt(c.trim()))
          if (!allowedCodes.includes(actualStatusCode)) {
            status = 'warning'
            checkStatus = 'warning'
            message = `${message}. Status code ${actualStatusCode} not in allowed list: ${categoryFields.allowedStatusCodes}`
          }
        }

        // Performance fields
        if (categoryFields.maxResponseTime && responseTime !== null && responseTime > categoryFields.maxResponseTime) {
          status = 'warning'
          checkStatus = 'warning'
          message = `${message}. Response time ${responseTime}ms exceeds maximum ${categoryFields.maxResponseTime}ms`
        }

        if (categoryFields.minResponseTime && responseTime !== null && responseTime < categoryFields.minResponseTime) {
          status = 'warning'
          checkStatus = 'warning'
          message = `${message}. Response time ${responseTime}ms is below minimum ${categoryFields.minResponseTime}ms`
        }

        // API Response fields
        if (categoryFields.expectedResponseFormat) {
          const contentType = responseHeaders?.get('content-type') || ''
          if (categoryFields.expectedResponseFormat.toLowerCase() === 'json' && !contentType.includes('json')) {
            status = 'warning'
            checkStatus = 'warning'
            message = `${message}. Expected JSON format, got ${contentType}`
          }
        }

        if (categoryFields.expectedJsonKey && responseText) {
          try {
            const jsonData = JSON.parse(responseText)
            if (!(categoryFields.expectedJsonKey in jsonData)) {
              status = 'warning'
              checkStatus = 'warning'
              message = `${message}. Expected JSON key "${categoryFields.expectedJsonKey}" not found`
            } else if (categoryFields.expectedJsonValue && jsonData[categoryFields.expectedJsonKey] !== categoryFields.expectedJsonValue) {
              status = 'warning'
              checkStatus = 'warning'
              message = `${message}. Expected JSON value "${categoryFields.expectedJsonValue}" for key "${categoryFields.expectedJsonKey}", got "${jsonData[categoryFields.expectedJsonKey]}"`
            }
          } catch (e) {
            // Not valid JSON, error already handled
          }
        }

        if (categoryFields.timeout && responseTime !== null && responseTime > categoryFields.timeout) {
          status = 'warning'
          checkStatus = 'warning'
          message = `${message}. Request exceeded timeout of ${categoryFields.timeout}ms`
        }
      })
    }

    // Check expiration date if set
    if (product.expiresAt) {
      const expiresAt = new Date(product.expiresAt)
      const daysUntilExpiry = Math.floor(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntilExpiry < 0) {
        if (status === 'active') {
          status = 'expired'
          checkStatus = 'error'
        }
        message = `${message}. Product expiration date has passed (${Math.abs(daysUntilExpiry)} days ago)`
      } else if (daysUntilExpiry <= 30) {
        if (status === 'active') {
          status = 'warning'
          checkStatus = 'warning'
        }
        message = `${message}. Product expires in ${daysUntilExpiry} days`
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        status,
        lastChecked: now,
      },
    })

    // Create check record with enhanced data
    await prisma.check.create({
      data: {
        productId: product.id,
        status: checkStatus,
        message,
        responseTime,
        statusCode,
        errorCode,
        errorDetails: errorDetails ? JSON.parse(JSON.stringify(errorDetails)) : null,
        httpHeaders: collectedData.httpHeaders ? JSON.parse(JSON.stringify(collectedData.httpHeaders)) : null,
        dnsInfo: collectedData.dnsInfo ? JSON.parse(JSON.stringify(collectedData.dnsInfo)) : null,
        sslInfo: collectedData.sslInfo ? JSON.parse(JSON.stringify(collectedData.sslInfo)) : null,
        apiResponse: collectedData.apiResponse ? JSON.parse(JSON.stringify(collectedData.apiResponse)) : null,
        contentInfo: collectedData.contentInfo ? JSON.parse(JSON.stringify(collectedData.contentInfo)) : null,
        performance: collectedData.performance ? JSON.parse(JSON.stringify(collectedData.performance)) : null,
        networkInfo: collectedData.networkInfo ? JSON.parse(JSON.stringify(collectedData.networkInfo)) : null,
      },
    })

    // Send notifications if needed
    if (status !== 'active') {
      // Send email notification
      await createNotification(
        user.id,
        'email',
        `Product Check: ${product.name}`,
        message
      )

      // Send SMS notification for critical errors
      if (status === 'expired' || checkStatus === 'error') {
        await createNotification(
          user.id,
          'sms',
          `Product Check: ${product.name}`,
          message
        )
      }

      // Send push notification for all errors and expirations
      await createNotification(
        user.id,
        'push',
        `Product Check: ${product.name}`,
        message
      )
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message,
    })
  } catch (error) {
    console.error('Error checking product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

