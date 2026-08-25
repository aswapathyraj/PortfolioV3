import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Traps Tab focus inside a container and restores focus to the previously
 * active element on close — the two things a dialog must do to be usable
 * without a mouse.
 *
 * @param ref      ref to the container element
 * @param active   whether the trap is engaged
 * @param onClose  called on Escape
 */
export function useFocusTrap(ref, active, onClose) {
  useEffect(() => {
    if (!active) return

    const container = ref.current
    if (!container) return

    const previouslyFocused = document.activeElement

    // Move focus in without stealing it from an element that already has it.
    const initial = container.querySelector('[data-autofocus]') ?? container
    if (!container.contains(document.activeElement)) {
      initial.focus?.({ preventScroll: true })
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = [...container.querySelectorAll(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      )

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus?.({ preventScroll: true })
      }
    }
  }, [ref, active, onClose])
}
