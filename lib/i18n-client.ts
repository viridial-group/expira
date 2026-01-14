'use client'

import { useState, useEffect, useMemo } from 'react'
import { locales, type Locale } from '@/i18n'

let messagesCache: Record<string, Record<string, any>> = {}
let loadingPromises: Record<string, Promise<Record<string, any>>> = {}

// Preload English messages immediately on module load
if (typeof window !== 'undefined') {
  // Preload English as fallback
  if (!messagesCache['en'] && !loadingPromises['en']) {
    loadingPromises['en'] = fetch('/messages/en.json')
      .then(res => res.json())
      .then(data => {
        messagesCache['en'] = data
        return data
      })
      .catch(() => {
        console.error('Failed to preload English messages')
        return {}
      })
  }
  
  // Also preload the current locale from cookie if different from English
  const cookieLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1] as Locale
  
  if (cookieLocale && locales.includes(cookieLocale) && cookieLocale !== 'en' && !messagesCache[cookieLocale] && !loadingPromises[cookieLocale]) {
    loadingPromises[cookieLocale] = fetch(`/messages/${cookieLocale}.json`)
      .then(res => res.json())
      .then(data => {
        messagesCache[cookieLocale] = data
        return data
      })
      .catch(() => {
        console.error(`Failed to preload ${cookieLocale} messages`)
        return messagesCache['en'] || {}
      })
  }
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en'
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale
    return (cookieLocale && locales.includes(cookieLocale)) ? cookieLocale : 'en'
  })
  
  const [messages, setMessages] = useState<Record<string, any>>(() => {
    // Try to get from cache immediately
    return messagesCache[locale] || messagesCache['en'] || {}
  })
  
  const [loading, setLoading] = useState(!messagesCache[locale])

  useEffect(() => {
    // Wait for preloaded messages if available
    const initMessages = async () => {
      const preloadPromise = loadingPromises[locale]
      if (preloadPromise) {
        try {
          const data = await preloadPromise
          if (data && Object.keys(data).length > 0) {
            setMessages(data)
            setLoading(false)
            return
          }
        } catch (error) {
          // Continue to loadMessages
        }
      }
      loadMessages(locale)
    }
    
    initMessages()
  }, [locale])

  const loadMessages = async (loc: Locale) => {
    // If already cached, use it immediately
    if (messagesCache[loc]) {
      setMessages(messagesCache[loc])
      setLoading(false)
      return
    }

    // If already loading, wait for it
    const existingPromise = loadingPromises[loc]
    if (existingPromise) {
      try {
        const data = await existingPromise
        if (data && Object.keys(data).length > 0) {
          setMessages(data)
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
      return
    }

    // Start loading
    setLoading(true)
    
    try {
      const promise = fetch(`/messages/${loc}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load ${loc}`)
          return res.json()
        })
        .then(data => {
          messagesCache[loc] = data
          return data
        })
        .catch(error => {
          console.error('Failed to load messages:', error)
          // Fallback to English
          if (loc !== 'en' && messagesCache['en']) {
            return messagesCache['en']
          }
          return {}
        })
      
      loadingPromises[loc] = promise
      const data = await promise
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
      // Fallback to English
      if (messagesCache['en']) {
        setMessages(messagesCache['en'])
      }
    } finally {
      setLoading(false)
    }
  }

  const changeLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return
    
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    setLocale(newLocale)
    await loadMessages(newLocale)
  }

  const t = useMemo(() => {
    return (key: string, defaultValueOrOptions?: string | { defaultValue?: string | any[] }): string | any[] => {
      const keys = key.split('.')
      let value: any = messages
      
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) break
      }
      
      // Handle both { defaultValue: '...' } and plain string as second param
      let defaultValue: string | any[] | undefined
      if (typeof defaultValueOrOptions === 'string') {
        defaultValue = defaultValueOrOptions
      } else if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object') {
        defaultValue = defaultValueOrOptions.defaultValue
      }
      
      // Return array if value is array, otherwise return string
      if (Array.isArray(value)) {
        return value
      }
      
      // If value exists, return it
      if (value !== undefined && value !== null) {
        return value
      }
      
      // If we have a default value, use it
      if (defaultValue !== undefined) {
        return defaultValue
      }
      
      // During loading and no default, return empty string to avoid showing keys
      if (loading) {
        return ''
      }
      
      // Last resort: return the key (shouldn't happen if translations are loaded)
      return key
    }
  }, [messages, loading])

  return { locale, messages, loading, changeLocale, t }
}

