import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSite } from '../../lib/usePublicData.js'
import { scrollToSection } from '../../utils/scroll.js'
import { Icon } from '../ui/Icon.jsx'
import { Button } from '../ui/Button.jsx'

/**
 * Persistent Contact CTA — a mobile-only bottom bar.
 *
 * The site is a long page (12 sections). On desktop the sticky header carries
 * Resume + socials; on mobile those are hidden behind the hamburger, so a
 * visitor who scrolls past Projects has no visible way to reach Contact
 * without scrolling back up. This bar appears after the hero, hides again at
 * the Contact and Resume sections (where it would just cover them), and stays
 * out of the way of the footer.
 */
export function StickyCta() {
  const { site } = useSite()
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [visible, setVisible] = useState(false)

  // IntersectionObserver-free: a rAF-throttled scroll listener. The bar is one
  // element; the work is a couple of getBoundingClientRect calls per frame.
  useStickyVisibility(isHome, setVisible)

  // Rendered only on the home page. Visibility is driven by the scroll hook —
  // the early return is intentional so case-study routes stay clean; the bar
  // itself animates in/out via AnimatePresence below.
  if (!isHome) return null

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="sticky-cta"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 px-4 py-3 backdrop-blur-xl lg:hidden"
          role="region"
          aria-label="Quick contact"
        >
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              icon="send"
              href="#contact"
              onClick={(event) => {
                if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey) return
                event.preventDefault()
                scrollToSection('contact')
              }}
              className="flex-1"
            >
              Let&rsquo;s Connect
            </Button>
            <a
              href={`mailto:${site.email ?? ''}`}
              aria-label="Email directly"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated text-muted transition-colors duration-200 hover:text-fg"
            >
              <Icon name="mail" className="size-4" />
            </a>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/**
 * Decides when the bar should be on screen. Kept as a separate hook so the
 * component stays declarative and the listener is cleaned up on unmount.
 */
function useStickyVisibility(enabled, setVisible) {
  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const scrollY = window.scrollY
      const vh = window.innerHeight

      // Past the hero (roughly one viewport) …
      const pastHero = scrollY > vh * 0.75

      // … and not sitting on the Contact / Resume sections or the footer.
      const contact = document.getElementById('contact')
      const resume = document.getElementById('resume')
      const nearBottom =
        scrollY + vh >= document.documentElement.scrollHeight - 160
      const covering =
        (contact && contact.getBoundingClientRect().top < vh - 80) ||
        (resume && resume.getBoundingClientRect().top < vh - 80)

      setVisible(pastHero && !nearBottom && !covering)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled, setVisible])
}

export default StickyCta
