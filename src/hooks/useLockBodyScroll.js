import { useEffect } from 'react'

/**
 * Locks page scroll while a modal or mobile menu is open.
 *
 * Compensates for the disappearing scrollbar with padding so the layout does
 * not shift sideways when the lock engages, and restores whatever inline styles
 * were there before.
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const current = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${current + scrollbarWidth}px`
    }

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }, [locked])
}
