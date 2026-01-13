// Geolocation utility to get country and city from IP address

interface GeolocationData {
  country: string | null
  city: string | null
}

/**
 * Get geolocation data from IP address using ipapi.co (free tier)
 * Falls back to other services if needed
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

  try {
    // Try ipapi.co first (free, no API key needed for basic usage)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      headers: {
        'User-Agent': 'expira/1.0',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`ipapi.co returned ${response.status}`)
    }

    const data = await response.json()

    // Check for error response
    if (data.error) {
      throw new Error(data.reason || 'Unknown error from ipapi.co')
    }

    return {
      country: data.country_name || data.country_code || null,
      city: data.city || null,
    }
  } catch (error: any) {
    // Don't log abort errors (timeouts)
    if (error?.name !== 'AbortError') {
      console.error('Error fetching geolocation from ipapi.co:', error)
    }
    
    // Fallback to ip-api.com (free, no API key needed)
    try {
      const fallbackController = new AbortController()
      const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 3000)
      
      const fallbackResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city`, {
        headers: {
          'User-Agent': 'expira/1.0',
        },
        signal: fallbackController.signal,
      })
      
      clearTimeout(fallbackTimeoutId)

      if (!fallbackResponse.ok) {
        throw new Error(`ip-api.com returned ${fallbackResponse.status}`)
      }

      const fallbackData = await fallbackResponse.json()

      if (fallbackData.status === 'success') {
        return {
          country: fallbackData.country || null,
          city: fallbackData.city || null,
        }
      }
    } catch (fallbackError: any) {
      // Don't log abort errors (timeouts)
      if (fallbackError?.name !== 'AbortError') {
        console.error('Error fetching geolocation from ip-api.com:', fallbackError)
      }
    }

    // Return default if all services fail
    return defaultData
  }
}

