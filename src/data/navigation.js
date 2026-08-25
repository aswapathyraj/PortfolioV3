/**
 * Section registry — drives the navbar, the scroll-spy active indicator, and
 * the section order on the home page. `id` must match the rendered <section id>.
 */

export const navSections = [
  { id: 'home', label: 'Home', inNav: true },
  { id: 'about', label: 'About', inNav: true },
  { id: 'skills', label: 'Skills', inNav: true },
  { id: 'projects', label: 'Projects', inNav: true },
  { id: 'engineering', label: 'Engineering', inNav: true },
  { id: 'architecture', label: 'Architecture', inNav: false },
  { id: 'database', label: 'Database', inNav: false },
  { id: 'security', label: 'Security', inNav: false },
  { id: 'api', label: 'API', inNav: false },
  { id: 'activity', label: 'Activity', inNav: false },
  { id: 'experience', label: 'Experience', inNav: true },
  { id: 'problems', label: 'Problems', inNav: false },
  { id: 'contact', label: 'Contact', inNav: true },
]

/** Items shown in the navbar. Order follows the page. */
export const navLinks = navSections.filter((section) => section.inNav)

/** Every id the scroll-spy observes, including the ones hidden from the nav. */
export const sectionIds = navSections.map((section) => section.id)

/**
 * Sub-sections rolled up under the "Engineering" nav item, surfaced in the
 * mobile menu so the deeper technical sections are still reachable directly.
 */
export const engineeringSubLinks = [
  { id: 'engineering', label: 'How I Build' },
  { id: 'architecture', label: 'System Architecture' },
  { id: 'database', label: 'Database Design' },
  { id: 'security', label: 'Security' },
  { id: 'api', label: 'API Explorer' },
  { id: 'activity', label: 'Developer Activity' },
]
