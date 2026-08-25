import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { siteConfig } from '../../config.js'
import { useHasFinePointer } from '../../hooks/useMediaQuery.js'
import { spring } from '../../animations/transitions.js'

/**
 * Custom cursor.
 *
 * Rendered only when the device has a fine pointer that can hover, the feature
 * flag is on, and the visitor has not asked for reduced motion. It is
 * `pointer-events-none` and the native cursor is only hidden while the custom
 * one is actually mounted, so it can never leave a visitor with no pointer.
 */
export function Cursor() {
  const hasFinePointer = useHasFinePointer()
  const prefersReducedMotion = useReducedMotion()
  const enabled = siteConfig.features.customCursor && hasFinePointer && !prefersReducedMotion

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const smoothX = useSpring(x, spring.cursor)
  const smoothY = useSpring(y, spring.cursor)

  const [state, setState] = useState({ visible: false, hovering: false, pressed: false })

  useEffect(() => {
    if (!enabled) return

    // Only claim the native cursor while this component is live.
    document.documentElement.setAttribute('data-cursor', 'active')

    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, summary, [data-cursor-hover]'

    const onMove = (event) => {
      x.set(event.clientX)
      y.set(event.clientY)

      const target = event.target instanceof Element ? event.target : null
      const hovering = Boolean(target?.closest(interactiveSelector))

      setState((current) =>
        current.visible && current.hovering === hovering
          ? current
          : { ...current, visible: true, hovering },
      )
    }

    const onLeave = () => setState((current) => ({ ...current, visible: false }))
    const onEnter = () => setState((current) => ({ ...current, visible: true }))
    const onDown = () => setState((current) => ({ ...current, pressed: true }))
    const onUp = () => setState((current) => ({ ...current, pressed: false }))

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      document.documentElement.removeAttribute('data-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const scale = state.pressed ? 0.85 : state.hovering ? 2.1 : 1

  return (
    <>
      {/* Outer ring — springs behind the pointer. */}
      <motion.div
        aria-hidden="true"
        style={{ x: smoothX, y: smoothY }}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block"
      >
        <motion.span
          animate={{
            scale,
            opacity: state.visible ? (state.hovering ? 0.9 : 0.55) : 0,
            borderColor: state.hovering ? 'var(--p-accent)' : 'var(--p-line-strong)',
          }}
          transition={{ scale: spring.snappy, opacity: { duration: 0.18 } }}
          className="block size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        />
      </motion.div>

      {/* Inner dot — tracks the pointer exactly so aim stays honest. */}
      <motion.div
        aria-hidden="true"
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden lg:block"
      >
        <motion.span
          animate={{
            opacity: state.visible && !state.hovering ? 1 : 0,
            scale: state.pressed ? 0.7 : 1,
          }}
          transition={{ duration: 0.14 }}
          className="block size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        />
      </motion.div>
    </>
  )
}

export default Cursor
