import { Suspense, lazy, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Seo } from '../components/ui/Seo.jsx'
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx'
import { SectionDivider } from '../components/ui/Section.jsx'
import { Hero } from '../components/Hero/Hero.jsx'
import { Stats } from '../components/Stats/Stats.jsx'
import { SkillFocusProvider } from '../hooks/useSkillFocus.jsx'
import { scrollToSection } from '../utils/scroll.js'

/**
 * Only the hero and the stats strip are needed for the first paint, so every
 * other section is a separate chunk. They mount together (the browser fetches
 * them in parallel over HTTP/2) but they no longer sit in the entry bundle,
 * which is what the first paint has to download and parse.
 */
const About = lazy(() => import('../components/About/About.jsx').then((m) => ({ default: m.About })))
const Skills = lazy(() => import('../components/Skills/Skills.jsx').then((m) => ({ default: m.Skills })))
const Projects = lazy(() => import('../components/Projects/Projects.jsx').then((m) => ({ default: m.Projects })))
const Engineering = lazy(() =>
  import('../components/Engineering/Engineering.jsx').then((m) => ({ default: m.Engineering })),
)
const Architecture = lazy(() =>
  import('../components/Architecture/Architecture.jsx').then((m) => ({ default: m.Architecture })),
)
const Database = lazy(() => import('../components/Database/Database.jsx').then((m) => ({ default: m.Database })))
const Security = lazy(() => import('../components/Security/Security.jsx').then((m) => ({ default: m.Security })))
const ApiExplorer = lazy(() =>
  import('../components/ApiExplorer/ApiExplorer.jsx').then((m) => ({ default: m.ApiExplorer })),
)
const Activity = lazy(() => import('../components/Activity/Activity.jsx').then((m) => ({ default: m.Activity })))
const Experience = lazy(() =>
  import('../components/Experience/Experience.jsx').then((m) => ({ default: m.Experience })),
)
const Problems = lazy(() => import('../components/Problems/Problems.jsx').then((m) => ({ default: m.Problems })))
const Resume = lazy(() => import('../components/Resume/Resume.jsx').then((m) => ({ default: m.Resume })))
const Contact = lazy(() => import('../components/Contact/Contact.jsx').then((m) => ({ default: m.Contact })))

/**
 * Placeholder that holds the space a section will occupy, so the page height
 * does not jump when the chunk lands.
 */
function SectionSkeleton() {
  return <div className="min-h-[60vh] w-full" aria-hidden="true" />
}

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

    // One frame so the target section exists before we measure it. Sections are
    // lazy chunks, so the target may still be missing — poll until it lands
    // instead of giving up on the first frame.
    const frame = requestAnimationFrame(() => {
      let attempts = 0
      const poll = () => {
        if (scrollToSection(id, { updateHash: false, instant })) return
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
          <ErrorBoundary label={key}>
            <Suspense fallback={<SectionSkeleton />}>{node}</Suspense>
          </ErrorBoundary>
          {index < sections.length - 1 ? <SectionDivider /> : null}
        </div>
      ))}

      <ErrorBoundary label="resume" silent>
        <Suspense fallback={<SectionSkeleton />}>
          <Resume />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="contact">
        <Suspense fallback={<SectionSkeleton />}>
          <Contact />
        </Suspense>
      </ErrorBoundary>
    </SkillFocusProvider>
  )
}

export default HomePage
