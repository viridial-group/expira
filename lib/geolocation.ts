// Geolocation utility to get country and city from IP address

interface GeolocationData {
  country: string | null
  city: string | null
}

// Simple in-memory cache to reduce API calls
const geolocationCache = new Map<string, { data: GeolocationData; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get geolocation data from IP address using ipapi.co (free tier)
 * Falls back to other services if needed
 * Uses caching to reduce API calls
 */
export async function getLocationFromIP(ipAddress: string | null | undefined): Promise<GeolocationData> {
  // Default response
  const defaultData: GeolocationData = {
    country: null,
    city: null,
  }

  // Skip if IP is invalid or localhost
  if (!ipAddress || ipAddress === 'unknown' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
    return defaultData
  }

  // Check cache first
  const cached = geolocationCache.get(ipAddress)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    // Try ipapi.co first (free, no API key needed for basic usage)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
    
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      headers: {
        'User-Agent': 'expira/1.0',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    // Handle rate limiting (429) gracefully - skip to fallback
    if (response.status === 429) {
      // Silently fall back to ip-api.com for rate limited requests
      throw new Error('RATE_LIMITED')
    }

    if (!response.ok) {
      throw new Error(`ipapi.co returned ${response.status}`)
    }

    const data = await response.json()

    // Check for error response
    if (data.error) {
      throw new Error(data.reason || 'Unknown error from ipapi.co')
    }

    const result: GeolocationData = {
      country: data.country_name || data.country_code || null,
      city: data.city || null,
    }

    // Cache the result
    geolocationCache.set(ipAddress, { data: result, timestamp: Date.now() })

    return result
  } catch (error: any) {
    // Don't log abort errors (timeouts) or rate limit errors
    if (error?.name !== 'AbortError' && error?.message !== 'RATE_LIMITED') {
      // Only log non-rate-limit errors
      if (!error?.message?.includes('429')) {
        console.error('Error fetching geolocation from ipapi.co:', error)
      }
    }
    
    // Fallback to ip-api.com (free, no API key needed)
    try {
      const fallbackController = new AbortController()
      const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 2000)
      
      const fallbackResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city`, {
        headers: {
          'User-Agent': 'expira/1.0',
        },
        signal: fallbackController.signal,
      })
      
      clearTimeout(fallbackTimeoutId)

      // Handle rate limiting (429) gracefully
      if (fallbackResponse.status === 429) {
        // Return default data if both services are rate limited
        return defaultData
      }

      if (!fallbackResponse.ok) {
        throw new Error(`ip-api.com returned ${fallbackResponse.status}`)
      }

      const fallbackData = await fallbackResponse.json()

      if (fallbackData.status === 'success') {
        const result: GeolocationData = {
          country: fallbackData.country || null,
          city: fallbackData.city || null,
        }

        // Cache the result
        geolocationCache.set(ipAddress, { data: result, timestamp: Date.now() })

        return result
      }
    } catch (fallbackError: any) {
      // Don't log abort errors (timeouts) or rate limit errors
      if (fallbackError?.name !== 'AbortError' && !fallbackError?.message?.includes('429')) {
        console.error('Error fetching geolocation from ip-api.com:', fallbackError)
      }
    }

    // Return default if all services fail
    return defaultData
  }
}

