import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Seo } from '../components/ui/Seo.jsx'
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx'
import { SectionDivider } from '../components/ui/Section.jsx'
import { Hero } from '../components/Hero/Hero.jsx'
import { Stats } from '../components/Stats/Stats.jsx'
import { About } from '../components/About/About.jsx'
import { Skills } from '../components/Skills/Skills.jsx'
import { Projects } from '../components/Projects/Projects.jsx'
import { Engineering } from '../components/Engineering/Engineering.jsx'
import { Architecture } from '../components/Architecture/Architecture.jsx'
import { Database } from '../components/Database/Database.jsx'
import { Security } from '../components/Security/Security.jsx'
import { ApiExplorer } from '../components/ApiExplorer/ApiExplorer.jsx'
import { Activity } from '../components/Activity/Activity.jsx'
import { Experience } from '../components/Experience/Experience.jsx'
import { Problems } from '../components/Problems/Problems.jsx'
import { Resume } from '../components/Resume/Resume.jsx'
import { Contact } from '../components/Contact/Contact.jsx'
import { SkillFocusProvider } from '../hooks/useSkillFocus.jsx'
import { scrollToSection } from '../utils/scroll.js'

/**
 * Home page.
 *
 * Section order defines the page's rhythm: proof (stats) immediately after the
 * hero, then the two sections that carry the most weight — projects and
 * engineering — before the deeper technical material.
 *
 * Each section is wrapped in its own error boundary so a failure in one cannot
 * take the page down with it.
 */
export function HomePage() {
  const location = useLocation()
  // Cross-page arrivals land instantly; same-page hash changes stay smooth.
  const landedRef = useRef(false)

  // Arriving from a case study at /#skills should land on that section.
  useEffect(() => {
    const instant = !landedRef.current
    landedRef.current = true
    if (!location.hash) return

    const id = location.hash.slice(1)
    const isCard = id.startsWith('project-')

    // Project cards must sit just below the navbar when returning from a
    // case study. Their own scroll-mt (112px) stacks on top of the global
    // scroll-padding (96px), leaving 208px of "Selected Work" header above
    // the card on mobile — so cards get an explicit top instead.
    const land = (forceInstant) => {
      const element = document.getElementById(id)
      if (!element) return false
      if (isCard) {
        const top = element.getBoundingClientRect().top + window.scrollY - 96
        window.scrollTo({ top: Math.max(0, top), behavior: forceInstant ? 'instant' : 'auto' })
        return true
      }
      return scrollToSection(id, { updateHash: false, instant: forceInstant })
    }

    // One frame so the target section exists before we measure it.
    const frame = requestAnimationFrame(() => {
      // The home page mounts after the detail page's exit animation, so the
      // card can be absent on the first frame. Poll briefly until it exists
      // instead of giving up — otherwise mobile backs land at y=0.
      let attempts = 0
      const poll = () => {
        if (land(instant)) {
          // Land once more after layout settles: the skill-highlight banner
          // and card entrance animations push the cards down after the first
          // scroll, which left the section header in view instead of the card.
          if (instant) setTimeout(() => land(true), 450)
          return
        }
        attempts += 1
        if (attempts < 20) setTimeout(poll, 100)
      }
      poll()
    })
    return () => cancelAnimationFrame(frame)
  }, [location.hash])

  const sections = [
    { key: 'about', node: <About /> },
    { key: 'skills', node: <Skills /> },
    { key: 'projects', node: <Projects /> },
    { key: 'engineering', node: <Engineering /> },
    { key: 'architecture', node: <Architecture /> },
    { key: 'database', node: <Database /> },
    { key: 'security', node: <Security /> },
    { key: 'api', node: <ApiExplorer /> },
    { key: 'activity', node: <Activity /> },
    { key: 'experience', node: <Experience /> },
    { key: 'problems', node: <Problems /> },
  ]

  return (
    <SkillFocusProvider>
      <Seo path="/" />

      <ErrorBoundary label="hero">
        <Hero />
      </ErrorBoundary>

      <ErrorBoundary label="stats" silent>
        <Stats />
      </ErrorBoundary>

      {sections.map(({ key, node }, index) => (
        <div key={key}>
          <ErrorBoundary label={key}>{node}</ErrorBoundary>
          {index < sections.length - 1 ? <SectionDivider /> : null}
        </div>
      ))}

      <ErrorBoundary label="resume" silent>
        <Resume />
      </ErrorBoundary>

      <ErrorBoundary label="contact">
        <Contact />
      </ErrorBoundary>
    </SkillFocusProvider>
  )
}

export default HomePage
