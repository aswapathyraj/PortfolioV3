/** Scroll helpers shared by the navbar, mobile menu, and hero CTAs. */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Scrolls to a section by id.
 *
 * Relies on `scroll-padding-top` from the base stylesheet for the navbar
 * offset, so the value lives in one place. Returns false when the target is not
 * on the current page, letting the caller fall back to a route change.
 *
 * `instant` jumps without animating — used for cross-page deep links, where a
 * smooth glide from the top of the home page reads as "wrong destination".
 */
export function scrollToSection(id, { updateHash = true, instant = false } = {}) {
  if (typeof document === 'undefined') return false

  const element = document.getElementById(id)
  if (!element) return false

  element.scrollIntoView({
    behavior: instant ? 'instant' : prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })

  if (updateHash) {
    const hash = id === 'home' ? window.location.pathname : `#${id}`
    window.history.replaceState(null, '', hash)
  }

  // Move keyboard focus to the section so tabbing continues from there.
  if (element.tabIndex < 0) element.setAttribute('tabindex', '-1')
  element.focus({ preventScroll: true })

  return true
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
