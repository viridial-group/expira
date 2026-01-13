'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  const pathname = usePathname()
  const visitStartTimeRef = useRef<number>(Date.now())
  const hasTrackedRef = useRef<boolean>(false)

  useEffect(() => {
    // Reset tracking for new page
    visitStartTimeRef.current = Date.now()
    hasTrackedRef.current = false

    const trackVisit = async (duration: number | null = null) => {
      if (hasTrackedRef.current) return
      hasTrackedRef.current = true

      try {
        await fetch('/api/tracking/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: typeof window !== 'undefined' ? (document.referrer || null) : null,
            duration,
          }),
        })
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error('Failed to track visit:', error)
      }
    }

    // Track immediately on page load
    trackVisit(null)

    // Track on page unload with duration
    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - visitStartTimeRef.current) / 1000)
      if (navigator.sendBeacon && duration > 0) {
        const data = JSON.stringify({
          path: pathname,
          referrer: document.referrer || null,
          duration,
        })
        navigator.sendBeacon('/api/tracking/visit', data)
      }
    }

    // Track after 30 seconds
    const timeoutId = setTimeout(() => {
      const duration = Math.floor((Date.now() - visitStartTimeRef.current) / 1000)
      trackVisit(duration)
    }, 30000)

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      clearTimeout(timeoutId)
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        // Track on route change
        const duration = Math.floor((Date.now() - visitStartTimeRef.current) / 1000)
        if (duration > 1 && !hasTrackedRef.current) {
          trackVisit(duration)
        }
      }
    }
  }, [pathname])

  return null // This component doesn't render anything
}

