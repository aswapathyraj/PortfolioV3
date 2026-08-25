import { projectsUsingSkill } from './projects.js'

/**
 * Skill data, grouped the way the stack itself is grouped.
 *
 * `icon` is a token resolved by src/components/ui/Icon.jsx — data files stay
 * free of React imports so they can also be read by the build scripts.
 *
 * There are deliberately no proficiency percentages here. The honest signal is
 * which real projects a technology was used in, and that is derived from
 * src/data/projects.js rather than typed out twice.
 */

export const skillCategories = [
  {
    id: 'frontend',
    label: 'Frontend',
    icon: 'monitor',
    blurb: 'Interfaces, state, and the layer the user actually touches.',
    skills: [
      {
        id: 'react',
        name: 'React',
        icon: 'react',
        description:
          'Component architecture, hooks, and composition. Every project here is a React client — including this site, built as a component system rather than a page.',
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        icon: 'javascript',
        description:
          'Modern ES syntax across both client and server. Same language on both sides of the API, which keeps validation logic shareable.',
      },
      {
        id: 'html',
        name: 'HTML',
        icon: 'html',
        description:
          'Semantic structure first — landmarks, headings, and real buttons — because it is what makes keyboard and screen-reader support possible at all.',
      },
      {
        id: 'css',
        name: 'CSS',
        icon: 'css',
        description:
          'Layout with Flexbox and Grid, custom properties for theming, and container-aware responsive design rather than shrunken desktop layouts.',
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        icon: 'tailwind',
        description:
          'Utility-first styling driven by design tokens. This site defines its palette once and re-themes light/dark from a single attribute.',
      },
      {
        id: 'framer',
        name: 'Framer Motion',
        icon: 'framer',
        description:
          'Shared animation variants, layout transitions, and scroll-linked motion — with reduced-motion handled at the source.',
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    icon: 'server',
    blurb: 'The API layer: routing, validation, and business rules.',
    skills: [
      {
        id: 'nodejs',
        name: 'Node.js',
        icon: 'nodejs',
        description:
          'Server runtime for both full-stack projects here — request handling, file uploads, and database access.',
      },
      {
        id: 'express',
        name: 'Express.js',
        icon: 'express',
        description:
          'Routers split by resource, with shared middleware for authentication, authorization, and error handling instead of per-route repetition.',
      },
      {
        id: 'rest',
        name: 'REST APIs',
        icon: 'rest',
        description:
          'Resource-oriented endpoints, correct status codes, and consistent error shapes so the client can handle failure without string matching.',
      },
      {
        id: 'multer',
        name: 'Multer',
        icon: 'fileUp',
        description:
          'Multipart upload handling with MIME and size constraints, and server-generated filenames rather than client-supplied ones.',
      },
      {
  id: 'python',
  name: 'Python',
  icon: 'python',
  description:
    'Powerful backend and scripting language used for automation, APIs, data processing, and building scalable applications.',
},

{
  id: 'flask',
  name: 'Flask',
  icon: 'flask',
  description:
    'Lightweight Python web framework for building fast, flexible backend APIs, web applications, and RESTful services.',
},
    ],
  },
  {
    id: 'database',
    label: 'Database',
    icon: 'database',
    blurb: 'Schema design, relationships, and queries.',
    skills: [
      {
        id: 'sqlite',
        name: 'SQLite',
        icon: 'sqlite',
        description:
          'Relational storage for both platforms — foreign keys, indexes on lookup columns, and transactions around multi-step writes.',
      },
      {
        id: 'sql',
        name: 'SQL',
        icon: 'sql',
        description:
          'Joins across related tables, aggregates for dashboard figures, and parameterised statements as the default — never string-built queries.',
      },
      {
        id: 'dbdesign',
        name: 'Database Design',
        icon: 'dbdesign',
        description:
          'Normalising until it hurts, then denormalising on purpose: order line items copy their unit price so past totals stay accurate.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Auth & Security',
    icon: 'shield',
    blurb: 'Who someone is, what they may touch, and what the server refuses.',
    skills: [
      {
        id: 'jwt',
        name: 'JWT',
        icon: 'jwt',
        description:
          'Signed tokens issued at login and verified by middleware. Roles travel in the token so routes authorise without an extra query.',
      },
      {
        id: 'bcrypt',
        name: 'bcrypt',
        icon: 'bcrypt',
        description:
          'Salted password hashing on registration and constant-time comparison on login. Plaintext passwords are never stored.',
      },
      {
        id: 'rbac',
        name: 'Role-Based Access',
        icon: 'rbac',
        description:
          'Role flags gate the route; row ownership checks gate the record. Authenticated and authorised are treated as separate questions.',
      },
      {
        id: 'validation',
        name: 'Input Validation',
        icon: 'checkCircle',
        description:
          'Server-side validation as the boundary of trust — client-side checks are for feedback, not enforcement.',
      },
      {
        id: 'ratelimit',
        name: 'Rate Limiting',
        icon: 'ratelimit',
        description:
          'Request throttling on authentication endpoints so credential guessing costs the attacker time. Applied per route, not globally.',
      },
      {
        id: 'csrf',
        name: 'CSRF Protection',
        icon: 'csrf',
        description:
          'Understanding why cookie-based sessions need a token that a cross-site form cannot read, and why Bearer-token APIs shift the problem to storage instead.',
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Deployment',
    icon: 'terminal',
    blurb: 'Version control, environment, and getting it live.',
    skills: [
      {
        id: 'git',
        name: 'Git',
        icon: 'git',
        description:
          'Feature branches, focused commits, and readable history — so a diff explains a decision rather than a day of work.',
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: 'github',
        description:
          'Remotes, pull requests, and issues as the record of what changed and why. Every project here lives in its own repository.',
      },
      {
        id: 'vscode',
        name: 'VS Code',
        icon: 'vscode',
        description:
          'Daily editor — integrated terminal, debugger, and linting kept close to where the code is written.',
      },
      {
        id: 'vercel',
        name: 'Vercel',
        icon: 'vercel',
        description:
          'Production builds and preview deployments for frontends, with environment variables kept out of the repository.',
      },
      {
        id: 'qrcode',
        name: 'QR Generation',
        icon: 'qrCode',
        description:
          'Server-side QR generation used to bind a physical table to a scoped URL in the food-ordering platform.',
      },
    ],
  },
]

/** Flat list, each skill annotated with its category and the projects using it. */
export const allSkills = skillCategories.flatMap((category) =>
  category.skills.map((skill) => ({
    ...skill,
    categoryId: category.id,
    categoryLabel: category.label,
    projects: projectsUsingSkill(skill.id).map((p) => ({
      slug: p.slug,
      title: p.title,
    })),
  })),
)

export const getSkillById = (id) => allSkills.find((skill) => skill.id === id)

export const skillCount = allSkills.length

/** Resolves a project's technology ids to display names, preserving order. */
export const resolveSkillNames = (ids = []) =>
  ids.map((id) => getSkillById(id)?.name ?? id)
