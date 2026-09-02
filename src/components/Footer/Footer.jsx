import { useLocation, useNavigate } from 'react-router-dom'
import { isConfigured } from '../../config.js'
import { navLinks, engineeringSubLinks } from '../../data/navigation.js'
import { useSite } from '../../lib/usePublicData.js'
import { Container } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Logo } from '../Navbar/Logo.jsx'
import { SocialTextLinks, ResumeButton } from '../ui/SocialLinks.jsx'
import { scrollToSection, scrollToTop } from '../../utils/scroll.js'

export function Footer() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const year = new Date().getFullYear()
  const { site } = useSite()

  const go = (id) => {
    if (isHome && scrollToSection(id)) return
    navigate(id === 'home' ? '/' : `/#${id}`)
  }

  return (
    <footer className="relative border-t border-line bg-surface/40">
      <div
        aria-hidden="true"
        className="grid-field pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]"
      />

      <Container className="relative">
        <div className="grid grid-cols-1 gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          {/* Identity */}
          <div className="min-w-0">
            <Logo />
            <p className="mt-5 max-w-sm text-pretty text-[0.875rem] leading-relaxed text-muted">
              {site.headline}
            </p>
            <div className="mt-5">
              <ResumeButton size="sm" variant="secondary" />
            </div>
          </div>

          {/* Navigate */}
          <nav aria-label="Footer navigation" className="min-w-0">
            <p className="mono-label mb-4">Navigate</p>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    className="text-left text-sm text-muted transition-colors duration-200 hover:text-fg"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Deep dives */}
          <nav aria-label="Technical sections" className="min-w-0">
            <p className="mono-label mb-4">Deep dives</p>
            <ul className="flex flex-col gap-2.5">
              {engineeringSubLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    className="text-left text-sm text-muted transition-colors duration-200 hover:text-fg"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Elsewhere */}
          <div className="min-w-0">
            <p className="mono-label mb-4">Elsewhere</p>
            <SocialTextLinks />

            {isConfigured(site.location) ? (
              <p className="mono-label mt-5 flex items-center gap-1.5">
                <Icon name="location" className="size-3" />
                {site.location}
              </p>
            ) : null}
          </div>
        </div>

        {/* Baseline */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-line py-6 sm:flex-row sm:items-center">
          <p className="text-[0.78125rem] text-subtle">
            © {year} {site.name}. {site.title}.
          </p>

          <div className="flex items-center gap-5">
            <span className="mono-label flex items-center gap-1.5 text-subtle/70">
              <Icon name="react" className="size-3" />
              Built with React
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.78125rem] text-muted transition-colors duration-200 hover:text-fg"
            >
              Back to top
              <Icon
                name="arrowUpRight"
                className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
