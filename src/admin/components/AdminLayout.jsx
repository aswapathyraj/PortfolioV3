import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { Icon } from '../../components/ui/Icon.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { NAV, TITLES } from '../nav.js'
import { Spinner } from '../components/ui.jsx'

function titleFor(path) {
  if (path.startsWith('/admin/projects/')) return 'Edit Project'
  if (path.startsWith('/admin/skills')) return 'Skills'
  const first = '/' + path.split('/').slice(0, 3).join('/')
  return TITLES[first] ?? 'Control Center'
}

function SidebarLink({ item, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.83rem] transition-colors',
          isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-elevated hover:text-fg',
        )
      }
    >
      <Icon name={item.icon} className="size-4 shrink-0" />
      <span className="truncate-safe">{item.label}</span>
    </NavLink>
  )
}

function CommandPalette({ open, onClose }) {
  const items = NAV.flatMap((g) => g.items)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-scrim pt-[14vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick navigation"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
          <Icon name="search" className="size-4 text-muted" />
          <p className="mono-label">Jump to a section</p>
        </div>
        <div className="max-h-[60vh] overflow-auto p-1.5">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              <Icon name={item.icon} className="size-4 text-accent" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

function Sidebar({ mobile, onNavigate }) {
  return (
    <nav className={cn('space-y-6', mobile && 'px-4 py-4')}>
      {NAV.map((section) => (
        <div key={section.section}>
          <p className="mono-label mb-2 px-2.5">{section.section}</p>
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <SidebarLink key={item.path} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const { admin, ready, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeMobile = () => setMobileOpen(false)

  if (ready && !admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <Spinner className="size-6" />
      </div>
    )
  }

  const name = admin.name ?? admin.email
  const initial = name.charAt(0).toUpperCase()
  const isOwner = admin.role === 'owner'

  return (
    <div className="min-h-screen bg-void">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-on-accent">
            <Icon name="command" className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">Control Center</p>
            <p className="mono-label text-[0.6rem]">PORTFOLIO</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <Sidebar />
        </div>
        <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-fg">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate-safe text-[0.8rem] font-medium text-fg">{name}</p>
            <p className="mono-label text-[0.6rem]">{admin.role}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-fg"
          >
            <Icon name="external" className="size-4" />
          </button>
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-fg">
          <Icon name="menu" className="size-5" />
        </button>
        <p className="text-sm font-semibold text-fg">Control Center</p>
        <div className="flex size-8 items-center justify-center rounded-full bg-accent text-on-accent">
          <Icon name="command" className="size-4" />
        </div>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex bg-scrim lg:hidden">
          <div className="w-64 overflow-y-auto bg-surface">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-semibold text-fg">Menu</p>
              <button onClick={closeMobile} aria-label="Close menu" className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-fg">
                <Icon name="close" className="size-5" />
              </button>
            </div>
            <Sidebar mobile onNavigate={closeMobile} />
          </div>
          <div className="flex-1" onClick={closeMobile} />
        </div>
      ) : null}

      {/* Main */}
      <div className="lg:pl-60">
        <div className="flex items-center justify-between border-b border-line bg-surface/60 px-5 py-3 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate-safe text-sm font-medium text-fg">{titleFor(location.pathname)}</p>
            {isOwner ? <p className="mono-label text-[0.6rem] text-accent">OWNER SESSION</p> : null}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaletteOpen(true)}
              title="Quick navigate (⌘K)"
              className="hidden items-center gap-1.5 rounded-md border border-line bg-elevated px-2.5 py-1.5 text-xs text-muted hover:text-fg sm:flex"
            >
              <Icon name="search" className="size-3.5" />
              <span>Jump to…</span>
              <kbd className="rounded border border-line bg-sunken px-1 text-[0.6rem]">⌘K</kbd>
            </button>
            <NavLink
              to="/"
              className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-fg"
              title="View live site"
            >
              <Icon name="external" className="size-4" />
            </NavLink>
          </div>
        </div>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}