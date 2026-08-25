import { useEffect, useState } from 'react'

/**
 * Scroll-spy backed by IntersectionObserver rather than scroll offsets, so it
 * stays accurate when sections change height (expanding cards, opened panels).
 *
 * Picks the entry closest to the viewport's upper third — the reading position
 * — instead of simply the first intersecting one, which would flip early on
 * tall sections.
 */
export function useActiveSection(sectionIds, { enabled = true } = {}) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? null)

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (elements.length === 0) return

    const visible = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry)
          } else {
            visible.delete(entry.target.id)
          }
        }

        if (visible.size === 0) return

        const anchor = window.innerHeight / 3
        let best = null
        let bestDistance = Infinity

        for (const entry of visible.values()) {
          const distance = Math.abs(entry.boundingClientRect.top - anchor)
          if (distance < bestDistance) {
            bestDistance = distance
            best = entry.target.id
          }
        }

        if (best) setActiveId(best)
      },
      {
        // A band across the middle of the viewport keeps the active item stable.
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.15, 0.5, 1],
      },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sectionIds, enabled])

  return activeId
}
