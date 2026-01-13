// Enhanced data collection utilities for different product types

import https from 'https'
import { URL } from 'url'
import dns from 'dns'
import { promisify } from 'util'

const dnsLookup = promisify(dns.lookup)
const dnsResolve4 = promisify(dns.resolve4)
const dnsResolve6 = promisify(dns.resolve6)
const dnsResolveMx = promisify(dns.resolveMx)

export interface CollectedData {
  httpHeaders?: Record<string, string>
  dnsInfo?: {
    ipv4?: string[]
    ipv6?: string[]
    mx?: Array<{ exchange: string; priority: number }>
    cname?: string[]
    txt?: string[]
  }
  sslInfo?: {
    issuer?: string
    subject?: string
    validFrom?: string
    validTo?: string
    serialNumber?: string
    fingerprint?: string
    algorithm?: string
    daysUntilExpiry?: number
  }
  apiResponse?: any
  contentInfo?: {
    title?: string
    metaDescription?: string
    hasExpectedText?: boolean
    contentType?: string
    contentLength?: number
  }
  performance?: {
    dnsTime?: number
    connectTime?: number
    sslTime?: number
    transferTime?: number
    totalTime?: number
  }
  networkInfo?: {
    ipAddress?: string
    server?: string
    location?: string
  }
}

/**
 * Collect DNS information for a domain
 */
export async function collectDNSInfo(hostname: string): Promise<CollectedData['dnsInfo']> {
  const dnsInfo: CollectedData['dnsInfo'] = {}
  
  try {
    // IPv4 addresses
    try {
      const ipv4 = await dnsResolve4(hostname)
      dnsInfo.ipv4 = ipv4
    } catch (e) {
      // No IPv4 records
    }

    // IPv6 addresses
    try {
      const ipv6 = await dnsResolve6(hostname)
      dnsInfo.ipv6 = ipv6
    } catch (e) {
      // No IPv6 records
    }

    // MX records
    try {
      const mx = await dnsResolveMx(hostname)
      dnsInfo.mx = mx.map(record => ({
        exchange: record.exchange,
        priority: record.priority,
      }))
    } catch (e) {
      // No MX records
    }

    // Primary IP lookup
    try {
      const { address } = await dnsLookup(hostname)
      dnsInfo.ipv4 = dnsInfo.ipv4 || [address]
    } catch (e) {
      // DNS lookup failed
    }
  } catch (error) {
    console.error('DNS collection error:', error)
  }

  return Object.keys(dnsInfo).length > 0 ? dnsInfo : undefined
}

/**
 * Collect SSL certificate information
 */
export async function collectSSLInfo(url: string): Promise<CollectedData['sslInfo']> {
  if (!url.startsWith('https://')) {
    return undefined
  }

  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      const startTime = Date.now()
      
      const req = https.request({
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname,
        method: 'HEAD',
        rejectUnauthorized: false, // Allow self-signed certs for info collection
      }, (res) => {
        const cert = (res.socket as any).getPeerCertificate(true)
        const sslTime = Date.now() - startTime

        if (cert) {
          const validTo = new Date(cert.valid_to)
          const now = new Date()
          const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          resolve({
            issuer: cert.issuer?.CN || cert.issuer?.O || JSON.stringify(cert.issuer),
            subject: cert.subject?.CN || cert.subject?.O || JSON.stringify(cert.subject),
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            serialNumber: cert.serialNumber,
            fingerprint: cert.fingerprint,
            algorithm: cert.pubkey?.algoName || cert.signature?.algorithm,
            daysUntilExpiry,
          })
        } else {
          resolve(undefined)
        }
      })

      req.on('error', () => {
        resolve(undefined)
      })

      req.setTimeout(5000, () => {
        req.destroy()
        resolve(undefined)
      })

      req.end()
    } catch (error) {
      resolve(undefined)
    }
  })
}

/**
 * Collect HTTP headers
 */
export function collectHTTPHeaders(headers: Headers): Record<string, string> {
  const httpHeaders: Record<string, string> = {}
  
  headers.forEach((value, key) => {
    httpHeaders[key] = value
  })

  return httpHeaders
}

/**
 * Collect content information from HTML
 */
export function collectContentInfo(html: string, expectedText?: string): CollectedData['contentInfo'] {
  const contentInfo: CollectedData['contentInfo'] = {}

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    contentInfo.title = titleMatch[1].trim()
  }

  // Extract meta description
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (metaMatch) {
    contentInfo.metaDescription = metaMatch[1].trim()
  }

  // Check for expected text
  if (expectedText) {
    contentInfo.hasExpectedText = html.includes(expectedText)
  }

  // Extract content type from meta or headers
  const contentTypeMatch = html.match(/<meta[^>]*http-equiv=["']content-type["'][^>]*content=["']([^"']+)["']/i)
  if (contentTypeMatch) {
    contentInfo.contentType = contentTypeMatch[1].trim()
  }

  contentInfo.contentLength = html.length

  return Object.keys(contentInfo).length > 0 ? contentInfo : undefined
}

/**
 * Parse and collect API response data
 */
export function collectAPIResponse(responseText: string, contentType?: string): CollectedData['apiResponse'] {
  if (!responseText) return undefined

  const apiResponse: any = {
    raw: responseText.substring(0, 1000), // First 1000 chars
    length: responseText.length,
  }

  // Try to parse JSON
  if (contentType?.includes('json') || responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(responseText)
      apiResponse.parsed = parsed
      apiResponse.type = 'json'
      apiResponse.keys = Object.keys(parsed).slice(0, 10) // First 10 keys
    } catch (e) {
      // Not valid JSON
    }
  }

  // Try to parse XML
  if (contentType?.includes('xml') || responseText.trim().startsWith('<?xml')) {
    apiResponse.type = 'xml'
    // Extract root element
    const rootMatch = responseText.match(/<([^>\s]+)[^>]*>/)
    if (rootMatch) {
      apiResponse.rootElement = rootMatch[1]
    }
  }

  return apiResponse
}

/**
 * Collect performance metrics
 */
export function collectPerformanceMetrics(
  dnsTime: number,
  connectTime: number,
  sslTime: number,
  transferTime: number
): CollectedData['performance'] {
  return {
    dnsTime,
    connectTime,
    sslTime,
    transferTime,
    totalTime: dnsTime + connectTime + sslTime + transferTime,
  }
}

/**
 * Collect network information
 */
export function collectNetworkInfo(ipAddress?: string, server?: string): CollectedData['networkInfo'] {
  if (!ipAddress && !server) return undefined

  return {
    ipAddress,
    server,
  }
}

