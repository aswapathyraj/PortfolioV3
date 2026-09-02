/** Single source of truth for the admin navigation tree. */

export const NAV = [
  { section: 'Content', items: [
    { path: '/admin', label: 'Overview', icon: 'dashboard', end: true },
    { path: '/admin/projects', label: 'Projects', icon: 'boxes' },
    { path: '/admin/skills', label: 'Skills', icon: 'zap' },
    { path: '/admin/experience', label: 'Experience', icon: 'clipboard' },
    { path: '/admin/security', label: 'Security & Trust', icon: 'shieldCheck' },
    { path: '/admin/engineering', label: 'Engineering', icon: 'workflow' },
    { path: '/admin/api', label: 'API Docs', icon: 'terminal' },
  ] },
  { section: 'Engage', items: [
    { path: '/admin/messages', label: 'Messages', icon: 'message' },
    { path: '/admin/contact', label: 'Contact Form', icon: 'send' },
  ] },
  { section: 'Analyze', items: [
    { path: '/admin/analytics', label: 'Analytics', icon: 'chart' },
    { path: '/admin/integrations', label: 'Integrations', icon: 'unplug' },
  ] },
  { section: 'System', items: [
    { path: '/admin/seo', label: 'SEO', icon: 'search' },
    { path: '/admin/appearance', label: 'Appearance', icon: 'palette' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' },
    { path: '/admin/users', label: 'Users & Access', icon: 'users' },
    { path: '/admin/activity', label: 'Activity Log', icon: 'activity' },
  ] },
]

export const TITLES = {
  '/admin': 'Overview',
  '/admin/projects': 'Projects',
  '/admin/projects/new': 'New Project',
  '/admin/skills': 'Skills',
  '/admin/experience': 'Experience',
  '/admin/security': 'Security & Trust',
  '/admin/engineering': 'Engineering',
  '/admin/api': 'API Docs',
  '/admin/messages': 'Messages',
  '/admin/contact': 'Contact Form',
  '/admin/analytics': 'Analytics',
  '/admin/integrations': 'Integrations',
  '/admin/seo': 'SEO',
  '/admin/appearance': 'Appearance',
  '/admin/settings': 'Settings',
  '/admin/users': 'Users & Access',
  '/admin/activity': 'Activity Log',
}