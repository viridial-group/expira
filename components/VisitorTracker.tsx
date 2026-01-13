'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Global tracking state to prevent multiple tracking
const trackingState = new Map<string, {
  tracked: boolean
  startTime: number
}>()

export default function VisitorTracker() {
  const pathname = usePathname()
  const visitStartTimeRef = useRef<number>(Date.now())
  const trackingKeyRef = useRef<string>(`${pathname}-${Date.now()}`)

  useEffect(() => {
    // Generate unique key for this page visit
    const currentKey = `${pathname}-${Date.now()}`
    trackingKeyRef.current = currentKey
    
    // Reset tracking for new page
    visitStartTimeRef.current = Date.now()
    
    // Check if we already tracked this exact visit
    const state = trackingState.get(currentKey)
    if (state?.tracked) {
      return // Already tracked, don't track again
    }

    // Initialize tracking state
    trackingState.set(currentKey, {
      tracked: false,
      startTime: Date.now(),
    })

    const trackVisit = async (duration: number | null = null) => {
      const state = trackingState.get(currentKey)
      if (!state || state.tracked) return
      
      state.tracked = true
      trackingState.set(currentKey, state)

      try {
        const response = await fetch('/api/tracking/visit', {
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

        // Only track once per session per path
        if (response.ok) {
          // Clean up old tracking states (keep only last 10)
          if (trackingState.size > 10) {
            const keys = Array.from(trackingState.keys())
            keys.slice(0, keys.length - 10).forEach(key => trackingState.delete(key))
          }
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error('Failed to track visit:', error)
        // Reset tracked state on error so we can retry
        const state = trackingState.get(currentKey)
        if (state) {
          state.tracked = false
          trackingState.set(currentKey, state)
        }
      }
    }

    // Track immediately on page load (only once)
    const initialTimeout = setTimeout(() => {
      trackVisit(null)
    }, 100) // Small delay to ensure page is loaded

    // Track on page unload with duration
    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - visitStartTimeRef.current) / 1000)
      if (navigator.sendBeacon && duration > 0) {
        const state = trackingState.get(currentKey)
        if (!state || !state.tracked) {
          const data = JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            duration,
          })
          navigator.sendBeacon('/api/tracking/visit', data)
        }
      }
    }

    // Track after 30 seconds (only if not already tracked)
    const timeoutId = setTimeout(() => {
      const duration = Math.floor((Date.now() - visitStartTimeRef.current) / 1000)
      trackVisit(duration)
    }, 30000)

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      clearTimeout(initialTimeout)
      clearTimeout(timeoutId)
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        // Track on route change (only if not already tracked and duration > 1s)
        const duration = Math.floor((Date.now() - visitStartTimeRef.current) / 1000)
        const state = trackingState.get(currentKey)
        if (duration > 1 && state && !state.tracked) {
          trackVisit(duration)
        }
      }
    }
  }, [pathname])

  return null // This component doesn't render anything
}

