export const locales = ['en', 'fr', 'es', 'de', 'it', 'ar'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

