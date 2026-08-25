import { useEffect, useState } from 'react'

/**
 * Subscribes to a media query. SSR-safe and uses the modern listener API.
 */
export function useMediaQuery(query, defaultValue = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return defaultValue
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)

    // Resync in case the query changed between render and effect. The functional
    // form lets React bail out when the value is already correct, so this does
    // not cause a second render on mount.
    setMatches((current) => (current === list.matches ? current : list.matches))
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True on devices whose primary input is a fine pointer that can hover. */
export function useHasFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)', false)
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)', false)
