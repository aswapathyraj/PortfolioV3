import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { siteConfig } from '../../config.js'

/**
 * Thin scroll progress bar pinned to the top of the viewport.
 *
 * Driven by a spring on the scroll motion value rather than React state, so the
 * bar never triggers a re-render while scrolling.
 */
export function ScrollProgress() {
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const progress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  })

  if (!siteConfig.features.scrollProgressBar) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: prefersReducedMotion ? scrollYProgress : progress }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-accent via-accent to-accent2"
    />
  )
}

export default ScrollProgress
