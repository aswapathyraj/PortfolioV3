import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { navLinks, sectionIds } from '../../data/navigation.js'
import { siteConfig } from '../../config.js'
import { cn } from '../../utils/cn.js'
import { scrollToSection } from '../../utils/scroll.js'
import { useActiveSection } from '../../hooks/useActiveSection.js'
import { useScrolledPast } from '../../hooks/useScrolledPast.js'
import { Logo } from './Logo.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'
import { MobileMenu } from './MobileMenu.jsx'
import { SocialIconRow } from '../ui/SocialLinks.jsx'
import { ResumeButton } from '../ui/SocialLinks.jsx'
import { IconButton } from '../ui/Button.jsx'

/**
 * Floating navigation bar.
 *
 * On the home page the links are same-page jumps with an IntersectionObserver
 * active indicator. On a case-study route the same links become route
 * navigations back to the home page's hash — the component handles both so the
 * nav never needs a second implementation.
 */
export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  const scrolled = useScrolledPast(24)
  const [menuOpen, setMenuOpen] = useState(false)

  // Scroll-spy only makes sense where the sections exist.
  const activeSection = useActiveSection(sectionIds, { enabled: isHome })

  // Close the menu when the route changes underneath it.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const goToSection = useCallback(
    (id) => {
      setMenuOpen(false)

      if (isHome && scrollToSection(id)) return
      navigate(id === 'home' ? '/' : `/#${id}`)
    },
    [isHome, navigate],
  )

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-accent"
      >
        Skip to content
      </a>

      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            'mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 transition-all duration-300 ease-out-quint sm:px-8',
            scrolled ? 'py-2.5' : 'py-4 sm:py-5',
          )}
        >
          {/* The blurred plate sits behind the row so it can inset independently. */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-x-3 top-2 -z-10 rounded-2xl border transition-all duration-300 ease-out-quint sm:inset-x-6',
              scrolled
                ? 'border-line bg-surface/80 shadow-panel backdrop-blur-xl'
                : 'border-transparent bg-transparent',
            )}
            style={{ bottom: scrolled ? '0.5rem' : '0.75rem' }}
          />

          <button
            type="button"
            onClick={() => goToSection('home')}
            aria-label={`${siteConfig.name} — back to top`}
            className="shrink-0 rounded-lg py-1 text-left"
          >
            <Logo compact />
          </button>

          {/* Desktop links */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isHome && activeSection === link.id
                return (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => goToSection(link.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'relative rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors duration-200',
                        active ? 'text-fg' : 'text-muted hover:text-fg',
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="nav-active"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          className="absolute inset-0 -z-10 rounded-lg border border-line bg-elevated"
                        />
                      ) : null}
                      {link.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Right cluster */}
          <div className="flex shrink-0 items-center gap-1.5">
            <SocialIconRow className="hidden sm:flex" />
            <ThemeToggle />
            <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line sm:block" />
            <ResumeButton size="sm" variant="secondary" className="hidden sm:inline-flex" />

            <IconButton
              label={menuOpen ? 'Close menu' : 'Open menu'}
              icon={menuOpen ? 'close' : 'menu'}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden"
              variant="secondary"
              size="icon-sm"
            />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <MobileMenu
            activeSection={isHome ? activeSection : null}
            onNavigate={goToSection}
            onClose={() => setMenuOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

export default Navbar
