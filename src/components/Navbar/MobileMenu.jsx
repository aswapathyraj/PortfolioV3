import { useRef } from 'react'
import { motion } from 'framer-motion'
import { navLinks, engineeringSubLinks } from '../../data/navigation.js'
import { isConfigured } from '../../config.js'
import { useSite } from '../../lib/usePublicData.js'
import { cn } from '../../utils/cn.js'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { Icon } from '../ui/Icon.jsx'
import { ResumeButton, socialLinks } from '../ui/SocialLinks.jsx'
import { StatusDot } from '../ui/Tag.jsx'
import { sheet, staggerContainer, staggerItem } from '../../animations/variants.js'

/**
 * Mobile navigation sheet.
 *
 * Locks page scroll, traps Tab focus, closes on Escape, and returns focus to
 * the trigger — the four things that separate a working mobile menu from a
 * decorative one. The deeper engineering sub-sections are listed here because
 * the desktop bar rolls them under a single "Engineering" item.
 */
export function MobileMenu({ activeSection, onNavigate, onClose }) {
  const panelRef = useRef(null)

  useLockBodyScroll(true)
  useFocusTrap(panelRef, true, onClose)

  const { site } = useSite()
  const { availability } = site
  const socials = socialLinks().filter((item) => item.configured)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      id="mobile-menu"
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--p-scrim)] backdrop-blur-sm"
        tabIndex={-1}
      />

      <motion.div
        ref={panelRef}
        variants={sheet}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute inset-x-3 top-[4.5rem] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-line bg-surface shadow-lift sm:inset-x-6"
      >
        <motion.nav
          variants={staggerContainer(0.035, 0.05)}
          initial="hidden"
          animate="visible"
          aria-label="Mobile"
          className="p-3"
        >
          <ul className="flex flex-col">
            {navLinks.map((link, index) => {
              const active = activeSection === link.id
              return (
                <motion.li key={link.id} variants={staggerItem}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.id)}
                    aria-current={active ? 'true' : undefined}
                    data-autofocus={index === 0 ? '' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left transition-colors duration-200',
                      active ? 'bg-elevated text-fg' : 'text-muted active:bg-elevated',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="mono-label tnum w-5 text-subtle">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display text-base">{link.label}</span>
                    </span>
                    {active ? (
                      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                    ) : (
                      <Icon name="chevronRight" className="size-4 text-subtle" />
                    )}
                  </button>
                </motion.li>
              )
            })}
          </ul>

          {/* Sub-sections rolled up under "Engineering" on desktop. */}
          <motion.div variants={staggerItem} className="mt-2 border-t border-line px-3.5 pb-1 pt-4">
            <p className="mono-label mb-3">Deep dives</p>
            <ul className="grid grid-cols-2 gap-1.5">
              {engineeringSubLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.id)}
                    className="w-full rounded-md border border-line bg-sunken px-2.5 py-2 text-left text-[0.75rem] text-muted transition-colors duration-200 active:border-line-strong active:text-fg"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem} className="mt-4 border-t border-line p-3.5">
            {availability.available ? (
              <p className="mb-4 flex items-center gap-2 text-[0.8125rem] text-muted">
                <StatusDot />
                {availability.label}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <ResumeButton size="sm" variant="primary" />

              {socials.map(({ id, label, href, Component }) => (
                <a
                  key={id}
                  href={href}
                  {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-elevated px-3 text-[0.8125rem] text-muted"
                >
                  <Component className="size-4" />
                  {label}
                </a>
              ))}
            </div>

            {isConfigured(site.location) ? (
              <p className="mono-label mt-4 flex items-center gap-1.5">
                <Icon name="location" className="size-3" />
                {site.location}
              </p>
            ) : null}
          </motion.div>
        </motion.nav>
      </motion.div>
    </motion.div>
  )
}

export default MobileMenu
