import { motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'
import { fadeUp, staggerContainer } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/** Consistent page gutter and max width. Every section shares it. */
export function Container({ className, children, ...rest }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1240px] px-5 sm:px-8', className)} {...rest}>
      {children}
    </div>
  )
}

/**
 * Section shell.
 *
 * Owns the vertical rhythm and the scroll-margin that keeps anchored sections
 * clear of the fixed navbar, so no section has to remember either.
 */
export function Section({ id, className, containerClassName, children, bleed = false, ...rest }) {
  return (
    <section
      id={id}
      className={cn('relative scroll-mt-24 py-20 sm:py-28 lg:py-32', className)}
      {...rest}
    >
      {bleed ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  )
}

/**
 * Section header: monospace index + eyebrow, display title, and lede.
 * `actions` renders on the right at desktop widths.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  actions,
  align = 'left',
  className,
}) {
  return (
    <motion.header
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className={cn(
        'mb-12 flex flex-col gap-6 sm:mb-16',
        align === 'left' && actions && 'lg:flex-row lg:items-end lg:justify-between',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {(index || eyebrow) && (
          <motion.div
            variants={fadeUp(10)}
            className={cn('mb-4 flex items-center gap-3', align === 'center' && 'justify-center')}
          >
            {index ? (
              <span className="mono-label tnum text-accent">{index}</span>
            ) : null}
            {index && eyebrow ? <span className="h-px w-6 bg-line-strong" aria-hidden="true" /> : null}
            {eyebrow ? <span className="mono-label">{eyebrow}</span> : null}
          </motion.div>
        )}

        <motion.h2
          variants={fadeUp(14)}
          className="text-balance text-3xl leading-[1.12] sm:text-4xl lg:text-[2.75rem]"
        >
          {title}
        </motion.h2>

        {description ? (
          <motion.p
            variants={fadeUp(14)}
            className="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]"
          >
            {description}
          </motion.p>
        ) : null}
      </div>

      {actions ? (
        <motion.div variants={fadeUp(14)} className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </motion.div>
      ) : null}
    </motion.header>
  )
}

/** Hairline divider used between major sections. */
export function SectionDivider({ className }) {
  return (
    <div className={cn('relative mx-auto max-w-[1240px] px-5 sm:px-8', className)} aria-hidden="true">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent" />
    </div>
  )
}
