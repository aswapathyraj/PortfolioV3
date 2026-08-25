/**
 * Shared easing curves and transition presets.
 *
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user">
 * in App.jsx, which strips transform and layout animation while keeping opacity
 * — so the variants below can declare movement freely without a second
 * "reduced" copy of every definition.
 */

export const ease = {
  /** Default: fast start, long settle. Reads as precise rather than bouncy. */
  outQuint: [0.22, 1, 0.36, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  outExpo: [0.16, 1, 0.3, 1],
}

export const duration = {
  fast: 0.22,
  base: 0.42,
  slow: 0.68,
}

export const spring = {
  /** Cursor and pointer-following elements. */
  cursor: { type: 'spring', stiffness: 520, damping: 42, mass: 0.42 },
  /** Panels and cards that change size. */
  panel: { type: 'spring', stiffness: 320, damping: 34 },
  /** Small chips and indicators. */
  snappy: { type: 'spring', stiffness: 460, damping: 30 },
}

export const transition = {
  base: { duration: duration.base, ease: ease.outQuint },
  fast: { duration: duration.fast, ease: ease.outQuint },
  slow: { duration: duration.slow, ease: ease.outQuint },
}

/** Standard scroll-reveal viewport config: fire once, slightly before entry. */
export const viewport = { once: true, amount: 0.2, margin: '0px 0px -80px 0px' }
export const viewportEager = { once: true, amount: 0.05, margin: '0px 0px -40px 0px' }
