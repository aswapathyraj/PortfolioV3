import { ease, duration, transition, spring } from './transitions.js'

/**
 * Reusable Framer Motion variants.
 *
 * Every section composes from these instead of declaring inline animation, so
 * the site's motion language stays consistent and tunable from one file.
 */

/** Fade + rise. `distance` lets a hero move further than a list item. */
export const fadeUp = (distance = 16, delay = 0) => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.outQuint, delay },
  },
})

export const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.outQuint, delay } },
})

export const fadeLeft = (distance = 24, delay = 0) => ({
  hidden: { opacity: 0, x: distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.slow, ease: ease.outQuint, delay },
  },
})

export const fadeRight = (distance = 24, delay = 0) => ({
  hidden: { opacity: 0, x: -distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.slow, ease: ease.outQuint, delay },
  },
})

/** Parent that staggers its children. Pair with `staggerItem`. */
export const staggerContainer = (stagger = 0.07, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
})

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: transition.base },
}

export const scaleIn = (from = 0.96, delay = 0) => ({
  hidden: { opacity: 0, scale: from },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: ease.outQuint, delay },
  },
})

/** Panel that expands to fit its content — used by accordions and disclosures. */
export const disclosure = {
  collapsed: { height: 0, opacity: 0, transition: { duration: duration.fast, ease: ease.outQuint } },
  open: {
    height: 'auto',
    opacity: 1,
    transition: { height: spring.panel, opacity: { duration: duration.fast, delay: 0.06 } },
  },
}

/** Full-screen overlay + dialog pair. */
export const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

export const dialog = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.base, ease: ease.outQuint } },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: duration.fast, ease: ease.outQuint } },
}

/** Route-level page transition. */
export const page = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.outQuint } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.fast, ease: ease.outQuint } },
}

/** Content swapped inside a fixed-size panel (tabs, detail panes). */
export const swap = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.fast, ease: ease.outQuint } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.14, ease: ease.outQuint } },
}

/** Draws an SVG connector. Pair with `pathLength` on a <motion.path>. */
export const drawPath = (delay = 0) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.9, ease: ease.outExpo, delay },
      opacity: { duration: 0.2, delay },
    },
  },
})

/** Mobile menu sheet. */
export const sheet = {
  hidden: { opacity: 0, y: -12, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: ease.outQuint } },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: duration.fast, ease: ease.outQuint } },
}
