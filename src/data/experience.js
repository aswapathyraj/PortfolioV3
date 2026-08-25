/**
 * Experience timeline.
 *
 * Represents development experience honestly — no invented employers, titles,
 * or dates. Add a formal role by appending an entry with the same shape.
 */

export const experience = [
  {
    id: 'independent',
    role: 'Independent Developer',
    org: 'Self-directed projects',
    period: '2024 — Present',
    current: true,
    icon: 'terminal',
    summary:
      'Designing and building full-stack web applications end to end — interface, REST API, relational schema, authentication, and deployment.',
    highlights: [
      'Built two multi-role platforms from an empty repository to a working product.',
      'Designed relational schemas first, then derived the API surface from them.',
      'Implemented authentication with hashed passwords, signed tokens, and role plus ownership checks.',
      'Handled file uploads with type and size constraints and server-generated filenames.',
      'Shipped responsive interfaces designed per breakpoint rather than scaled down.',
    ],
    stack: ['react', 'tailwind', 'nodejs', 'express', 'sqlite', 'jwt', 'git'],
    projects: ['phlox', 'qr-food-ordering', 'developer-portfolio'],
  },
]

/**
 * Optional. Add entries as `{ id, credential, org, period, note }` when you
 * want a formal education or certification block — the section hides itself
 * while this is empty rather than showing a placeholder card.
 */
export const education = []

export const experienceNote =
  'Project-based experience, described in terms of what was built rather than time served.'
