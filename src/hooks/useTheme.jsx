import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePublicData } from '../lib/usePublicData.js'
import { getSite } from '../lib/publicData.js'

const STORAGE_KEY = 'portfolio-theme'
const ThemeContext = createContext(null)

const readStoredTheme = () => {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    return null
  }
  return null
}

const readInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark'

  // A stored choice is an explicit override. Otherwise fall through to the
  // system preference (dark-first) — the CMS theme is applied on hydration.
  const stored = readStoredTheme()
  if (stored) return stored

  // Dark-first: only honour an explicit system preference for light.
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Theme provider.
 *
 * Sets `data-theme` on <html>, which is all that is needed — the design system
 * resolves every colour through palette variables scoped to that attribute, so
 * no component carries theme-aware classes.
 *
 * The CMS appearance.theme sets the default; it only applies when the visitor
 * has not explicitly chosen a theme, so the navbar toggle always wins once used.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme)
  const manualChoice = useRef(false)
  const appliedCmsTheme = useRef(null)

  // Listen for the live site data and adopt the admin's default theme, but only
  // until the visitor makes their own choice. setState is only called when the
  // CMS theme actually changes, so this stays idempotent across renders.
  usePublicData()
  useEffect(() => {
    if (manualChoice.current) return
    const cmsTheme = getSite().appearance?.theme
    if ((cmsTheme === 'light' || cmsTheme === 'dark') && cmsTheme !== appliedCmsTheme.current) {
      appliedCmsTheme.current = cmsTheme
      setTheme(cmsTheme)
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#fbfbfc' : '#08090A')
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Persistence is a convenience; the session still works without it.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    manualChoice.current = true
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>.')
  }
  return context
}
