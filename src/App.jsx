import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { ThemeProvider } from './hooks/useTheme.jsx'
import { Navbar } from './components/Navbar/Navbar.jsx'
import { Footer } from './components/Footer/Footer.jsx'
import { Cursor } from './components/Cursor/Cursor.jsx'
import { ScrollProgress } from './components/ui/ScrollProgress.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'
import { Icon } from './components/ui/Icon.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { page } from './animations/variants.js'
import { missingConfigKeys } from './config.js'

/**
 * Case studies are route-split: the home page's first paint does not pay for a
 * page most visitors reach second, if at all.
 */
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage.jsx').then((module) => ({ default: module.ProjectDetailPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage.jsx').then((module) => ({ default: module.NotFoundPage })),
)

/** Neutral hold while a split route arrives. Deliberately quiet. */
function RouteFallback() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center" role="status" aria-live="polite">
      <span className="flex items-center gap-2.5 text-muted">
        <Icon name="spinner" className="size-4 animate-spin text-accent" />
        <span className="mono-label">Loading</span>
      </span>
    </div>
  )
}

/** Prints a one-time checklist in development if config fields are still empty. */
function useConfigChecklist() {
  useEffect(() => {
    if (!import.meta.env.DEV) return

    const missing = missingConfigKeys()
    if (missing.length === 0) return

    console.info(
      `%c[portfolio] ${missing.length} config field${missing.length === 1 ? '' : 's'} still empty:%c ${missing.join(', ')}\n` +
        'Fill them in src/config.js — the UI hides or disables these affordances until you do.',
      'color:#00e5a0;font-weight:600',
      'color:inherit',
    )
  }, [])
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        id="main"
        variants={page}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-w-0"
      >
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  )
}

export default function App() {
  useConfigChecklist()

  return (
    <ThemeProvider>
      {/*
        reducedMotion="user" is the single switch that makes every Framer
        animation on the site respect the OS setting — transforms and layout
        animation are dropped, opacity is kept. It is why no variant in
        src/animations needs a second reduced-motion definition.
      */}
      <MotionConfig reducedMotion="user">
        <ScrollProgress />
        <Cursor />
        <Navbar />

        <ErrorBoundary label="routes">
          <AnimatedRoutes />
        </ErrorBoundary>

        <Footer />
      </MotionConfig>
    </ThemeProvider>
  )
}
