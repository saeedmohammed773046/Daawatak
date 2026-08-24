import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import ar from './locales/ar'
import en from './locales/en'
import type { Messages } from './locales/ar'

export type Locale = 'ar' | 'en'
export type Direction = 'rtl' | 'ltr'

const dictionaries: Record<Locale, Messages> = { ar, en }
const directions: Record<Locale, Direction> = { ar: 'rtl', en: 'ltr' }

type I18nContextValue = {
  locale: Locale
  dir: Direction
  t: Messages
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'daawatak_locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'ar'
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null
    return saved === 'en' || saved === 'ar' ? saved : 'ar'
  })

  const dir = directions[locale]

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir', dir)
    document.body.setAttribute('dir', dir)
    document.body.setAttribute('lang', locale)
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale, dir])

  const setLocale = useCallback((next: Locale) => setLocaleState(next), [])
  const toggleLocale = useCallback(() => setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar')), [])

  const value = useMemo(
    () => ({ locale, dir, t: dictionaries[locale], setLocale, toggleLocale }),
    [locale, dir, setLocale, toggleLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
