import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { heroStats } from '../../data/stats.js'
import { Container } from '../ui/Section.jsx'
import { cn } from '../../utils/cn.js'
import { staggerContainer, staggerItem } from '../../animations/variants.js'
import { viewportEager } from '../../animations/transitions.js'

/**
 * Counts up to a target when scrolled into view.
 *
 * Skipped entirely under reduced motion — a number that animates is decoration,
 * and the value is the point.
 */
function useCountUp(target, active, duration = 900) {
  const prefersReducedMotion = useReducedMotion()
  const [value, setValue] = useState(prefersReducedMotion ? target : 0)

  useEffect(() => {
    if (prefersReducedMotion || !active) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutQuint — settles rather than stops.
      const eased = 1 - Math.pow(1 - progress, 5)
      setValue(Math.round(target * eased))

      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, duration, prefersReducedMotion])

  return value
}

function StatValue({ stat, active }) {
  const isNumber = stat.kind === 'number' && Number.isFinite(Number(stat.value))
  const counted = useCountUp(isNumber ? Number(stat.value) : 0, active)

  return (
    <span
      className={cn(
        'block font-display leading-none tracking-tight text-fg',
        isNumber ? 'tnum text-3xl sm:text-[2.25rem]' : 'text-xl sm:text-2xl',
      )}
    >
      {isNumber ? counted : stat.value}
    </span>
  )
}

/**
 * Statistics strip under the hero.
 *
 * The countable figures are derived from the project and skill data files, so
 * they cannot drift from what the site actually contains.
 */
export function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <section aria-label="At a glance" className="relative border-y border-line bg-surface/40">
      <Container className="px-0 sm:px-0">
        <motion.dl
          ref={ref}
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportEager}
          className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x"
        >
          {heroStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              variants={staggerItem}
              className={cn(
                'group relative px-5 py-7 sm:px-8 sm:py-9',
                // Manual dividers: `divide-x` alone cannot handle a 2-col wrap.
                index % 2 === 1 && 'border-l border-line lg:border-l-0',
                index < heroStats.length - 2 && 'border-b border-line lg:border-b-0',
              )}
            >
              <dt className="mono-label mb-3 flex items-center gap-2">
                <span className="h-px w-3 bg-accent/50 transition-all duration-300 group-hover:w-5" aria-hidden="true" />
                {stat.label}
              </dt>
              <dd>
                <StatValue stat={stat} active={inView} />
                <span className="mt-2 block text-[0.78125rem] leading-snug text-subtle">
                  {stat.note}
                </span>
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </Container>
    </section>
  )
}

export default Stats
