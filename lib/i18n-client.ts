'use client'

import { useState, useEffect } from 'react'
import { locales, type Locale } from '@/i18n'

let messagesCache: Record<string, Record<string, any>> = {}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>('en')
  const [messages, setMessages] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get locale from cookie or default to 'en'
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale

    const currentLocale = (cookieLocale && locales.includes(cookieLocale)) 
      ? cookieLocale 
      : 'en'

    setLocale(currentLocale)
    loadMessages(currentLocale)
  }, [])

  const loadMessages = async (loc: Locale) => {
    if (messagesCache[loc]) {
      setMessages(messagesCache[loc])
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/messages/${loc}.json`)
      const data = await response.json()
      messagesCache[loc] = data
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
      // Fallback to English
      if (loc !== 'en') {
        const enResponse = await fetch('/messages/en.json')
        const enData = await enResponse.json()
        messagesCache['en'] = enData
        setMessages(enData)
      }
    } finally {
      setLoading(false)
    }
  }

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    loadMessages(newLocale)
    window.location.reload()
  }

  const t = (key: string, defaultValueOrOptions?: string | { defaultValue?: string | any[] }): string | any[] => {
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
    
    return value || defaultValue || key
  }

  return { locale, messages, loading, changeLocale, t }
}

