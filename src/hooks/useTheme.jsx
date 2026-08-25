import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'portfolio-theme'
const ThemeContext = createContext(null)

const readInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // Private mode or blocked storage — fall through to the system preference.
  }

  // Dark-first: only honour an explicit system preference for light.
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Theme provider.
 *
 * Sets `data-theme` on <html>, which is all that is needed — the design system
 * resolves every colour through palette variables scoped to that attribute, so
 * no component carries theme-specific classes.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme)

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
