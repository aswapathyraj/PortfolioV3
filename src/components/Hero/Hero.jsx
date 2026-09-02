import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { isConfigured } from '../../config.js'
import { useSite } from '../../lib/usePublicData.js'
import { Container } from '../ui/Section.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { StatusDot, Tag } from '../ui/Tag.jsx'
import { ResumeButton, socialLinks } from '../ui/SocialLinks.jsx'
import { CodeWindow } from './CodeWindow.jsx'
import { scrollToSection } from '../../utils/scroll.js'
import { fadeUp, staggerContainer } from '../../animations/variants.js'
import { useHasFinePointer } from '../../hooks/useMediaQuery.js'

/**
 * Hero.
 *
 * The one section allowed expressive typography. Everything below it is
 * deliberately quieter so this reads as the entry point.
 */
export function Hero() {
  const { site } = useSite()
  const prefersReducedMotion = useReducedMotion()
  const hasFinePointer = useHasFinePointer()
  const parallaxEnabled = hasFinePointer && !prefersReducedMotion

  // Pointer parallax on the code panel — a few pixels, not a tilt effect.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 90, damping: 22 })
  const springY = useSpring(pointerY, { stiffness: 90, damping: 22 })
  const translateX = useTransform(springX, [-1, 1], [8, -8])
  const translateY = useTransform(springY, [-1, 1], [6, -6])

  const handlePointerMove = (event) => {
    if (!parallaxEnabled) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1)
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
  }

  const handlePointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  const { availability } = site
  const socials = socialLinks().filter((item) => item.configured)

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Background: blueprint grid + a single accent bloom, both masked out
          before they reach the section edges. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-field mask-radial-center absolute inset-0" />
        <div className="absolute -left-1/4 top-[-20%] size-[42rem] rounded-full bg-accent/[0.07] blur-[120px]" />
        <div className="absolute -right-1/4 bottom-[-30%] size-[38rem] rounded-full bg-accent2/[0.06] blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
      </div>

      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
          {/* ---- Copy ---- */}
          <motion.div
            variants={staggerContainer(0.09, 0.15)}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          >
            <motion.div variants={fadeUp(12)}>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 py-1.5 pl-2.5 pr-3.5 backdrop-blur">
                <StatusDot
                  tone={availability.available ? 'accent' : 'warn'}
                  pulse={availability.available}
                />
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
                  {availability.available ? availability.label : availability.unavailableLabel}
                </span>
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp(18)}
              className="mt-7 text-[2.5rem] leading-[1.04] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.25rem]"
            >
              <span className="block text-muted">Hi, I&rsquo;m</span>
              <span className="mt-1 block text-fg">{site.name}.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp(16)}
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-xl text-accent sm:text-2xl"
            >
              {site.title}
              <span aria-hidden="true" className="hidden h-px w-10 bg-accent/40 sm:inline-block" />
              <span className="mono-label hidden sm:inline">Frontend · API · Database</span>
            </motion.p>

            <motion.p
              variants={fadeUp(16)}
              className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]"
            >
              {site.headline}
            </motion.p>

            <motion.div variants={fadeUp(16)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="lg"
                iconRight="arrowRight"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto"
              >
                Explore My Work
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon="send"
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto"
              >
                Let&rsquo;s Connect
              </Button>
            </motion.div>

            {/* Secondary links */}
            <motion.div
              variants={fadeUp(14)}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              {socials.map(({ id, label, href, Component }) => (
                <a
                  key={id}
                  href={href}
                  {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  className="group inline-flex items-center gap-2 text-[0.8125rem] text-muted transition-colors duration-200 hover:text-fg"
                >
                  <Component className="size-4 text-subtle transition-colors duration-200 group-hover:text-accent" />
                  {label}
                  <Icon
                    name="arrowUpRight"
                    className="size-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </a>
              ))}

              <ResumeButton
                size="sm"
                variant="ghost"
                className="-ml-2 px-2 text-[0.8125rem]"
                label="Resume"
              />

              {isConfigured(site.location) ? (
                <span className="inline-flex items-center gap-2 text-[0.8125rem] text-subtle">
                  <Icon name="location" className="size-4" />
                  {site.location}
                </span>
              ) : null}
            </motion.div>
          </motion.div>

          {/* ---- Visual ---- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={parallaxEnabled ? { x: translateX, y: translateY } : undefined}
            className="relative min-w-0"
          >
            <CodeWindow />

            {/* Floating stack chips — anchored to the panel, hidden when tight. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-5 -left-4 hidden items-center gap-1.5 rounded-xl border border-line bg-surface/95 p-2 shadow-lift backdrop-blur sm:flex"
            >
              <Tag tone="accent" icon="react">React</Tag>
              <Tag tone="neutral" icon="nodejs">Node</Tag>
              <Tag tone="neutral" icon="database">SQLite</Tag>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      {/* Scroll cue */}
      <motion.button
        type="button"
        onClick={() => scrollToSection('about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 rounded-lg px-3 py-2 text-subtle transition-colors duration-200 hover:text-fg lg:flex"
        aria-label="Scroll to About"
      >
        <span className="mono-label">Scroll</span>
        <motion.span
          animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="chevronDown" className="size-4" />
        </motion.span>
      </motion.button>
    </section>
  )
}

export default Hero
