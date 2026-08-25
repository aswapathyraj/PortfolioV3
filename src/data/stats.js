import { realProjects } from './projects.js'
import { skillCount } from './skills.js'

/**
 * Hero statistics.
 *
 * The two countable figures are derived from the real data files rather than
 * typed in, so they can never drift from what the site actually contains. Edit
 * `label`/`value` freely — just keep any number honest.
 */

export const heroStats = [
  {
    id: 'projects',
    label: 'Projects Documented',
    value: String(realProjects.length),
    note: 'Full case studies on this site',
    kind: 'number',
  },
  {
    id: 'technologies',
    label: 'Technologies',
    value: String(skillCount),
    note: 'Across stack, data, and tooling',
    kind: 'number',
  },
  {
    id: 'scope',
    label: 'Scope',
    value: 'Full-Stack',
    note: 'Frontend · API · Database',
    kind: 'text',
  },
  {
    id: 'focus',
    label: 'Current Focus',
    value: 'Production Quality',
    note: 'Shipping complete, usable software',
    kind: 'text',
  },
]
