import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { AdminLayout } from './components/AdminLayout.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { Spinner } from './components/ui.jsx'

// Route-split the heavier pages so the console shell stays cheap.
const OverviewPage = lazy(() => import('./pages/OverviewPage.jsx').then((m) => ({ default: m.OverviewPage })))
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage.jsx').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectEditorPage = lazy(() =>
  import('./pages/ProjectEditorPage.jsx').then((m) => ({ default: m.ProjectEditorPage })),
)
const ContentPage = lazy(() => import('./pages/ContentPage.jsx').then((m) => ({ default: m.ContentPage })))
const MessagesPage = lazy(() =>
  import('./pages/MessagesPage.jsx').then((m) => ({ default: m.MessagesPage })),
)
const ContactPage = lazy(() => import('./pages/ContactPage.jsx').then((m) => ({ default: m.ContactPage })))
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage.jsx').then((m) => ({ default: m.AnalyticsPage })),
)
const IntegrationsPage = lazy(() =>
  import('./pages/IntegrationsPage.jsx').then((m) => ({ default: m.IntegrationsPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage.jsx').then((m) => ({ default: m.SettingsPage })),
)
const UsersPage = lazy(() => import('./pages/UsersPage.jsx').then((m) => ({ default: m.UsersPage })))
const ActivityPage = lazy(() =>
  import('./pages/ActivityPage.jsx').then((m) => ({ default: m.ActivityPage })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="size-5" />
    </div>
  )
}

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Suspense fallback={<RouteFallback />}><OverviewPage /></Suspense>} />
            <Route path="projects" element={<Suspense fallback={<RouteFallback />}><ProjectsPage /></Suspense>} />
            <Route path="projects/new" element={<Suspense fallback={<RouteFallback />}><ProjectEditorPage /></Suspense>} />
            <Route path="projects/:id" element={<Suspense fallback={<RouteFallback />}><ProjectEditorPage /></Suspense>} />
            <Route path="skills" element={<Suspense fallback={<RouteFallback />}><ContentPage /></Suspense>} />
            <Route path="experience" element={<Suspense fallback={<RouteFallback />}><ContentPage /></Suspense>} />
            <Route path="security" element={<Suspense fallback={<RouteFallback />}><ContentPage /></Suspense>} />
            <Route path="engineering" element={<Suspense fallback={<RouteFallback />}><ContentPage /></Suspense>} />
            <Route path="api" element={<Suspense fallback={<RouteFallback />}><ContentPage /></Suspense>} />
            <Route path="messages" element={<Suspense fallback={<RouteFallback />}><MessagesPage /></Suspense>} />
            <Route path="contact" element={<Suspense fallback={<RouteFallback />}><ContactPage /></Suspense>} />
            <Route path="analytics" element={<Suspense fallback={<RouteFallback />}><AnalyticsPage /></Suspense>} />
            <Route path="integrations" element={<Suspense fallback={<RouteFallback />}><IntegrationsPage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<RouteFallback />}><SettingsPage /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<RouteFallback />}><UsersPage /></Suspense>} />
            <Route path="activity" element={<Suspense fallback={<RouteFallback />}><ActivityPage /></Suspense>} />
            <Route path="seo" element={<Suspense fallback={<RouteFallback />}><SettingsPage /></Suspense>} />
            <Route path="appearance" element={<Suspense fallback={<RouteFallback />}><SettingsPage /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<RouteFallback />}><OverviewPage /></Suspense>} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}