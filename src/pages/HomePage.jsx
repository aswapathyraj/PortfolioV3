import { useEffect } from 'react'
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

  // Arriving from a case study at /#skills should land on that section.
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)

    // One frame so the target section exists before we measure it.
    const frame = requestAnimationFrame(() => scrollToSection(id, { updateHash: false }))
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
