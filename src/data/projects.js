/**
 * Project data.
 *
 * Adding a project = appending one object here. Everything downstream (cards,
 * case-study route, skill→project cross-references, sitemap, the mock
 * /api/projects payload) reads from this array.
 *
 * Field reference
 * --------------
 * slug          URL segment for /projects/:slug — must be unique
 * status        'shipped' | 'building' | 'placeholder'
 * technologies  skill ids from src/data/skills.js (drives cross-referencing)
 * architecture  { note, rows: Node[][] } — rendered by <FlowDiagram />
 * database      { note, tables: [{ name, columns, relations }] }
 * image         path under /public, or '' to render the generated visual
 */

export const projects = [

  {
    slug: 'qr-food-ordering',
    title: 'QR Food Ordering System',
    subtitle: 'Contactless Restaurant Ordering',
    category: 'Full-Stack Application',
    year: '2025',
    status: 'shipped',
    featured: true,
    accent: 'accent2',
    image: '',
    screenshots: [],
    github: 'https://github.com/aswapathyraj/food-ordering-app',
    liveDemo: '',

    summary:
      'A QR-based restaurant ordering platform: scan the table code, browse the menu, build a cart, place the order, and track its status — with an admin dashboard behind it.',

    description:
      'Each table has its own QR code that opens the menu with the table already identified. Customers order without an account; staff manage the menu and watch orders move through the kitchen from a dashboard.',

    problem:
      'Ordering from a phone only helps if it is faster than waving someone down. That rules out a signup flow, so the order has to be tied to a table rather than a user account — while still making sure a customer at table 4 cannot read or modify table 7\'s order.',

    solution:
      'The table identifier is encoded in the QR URL and carried as an opaque token on every request, so the menu, the cart, and the order all resolve to a table without authentication. Orders are append-only rows with a status column that the admin dashboard advances; the customer\'s tracking view polls the same order resource it created.',

    features: [
      { title: 'QR scanning', detail: 'Table-specific codes deep-link straight into the menu for that table.' },
      { title: 'Digital menu', detail: 'Categorised items served from the API, editable without a redeploy.' },
      { title: 'Cart', detail: 'Client-side cart with quantities and a running total before submission.' },
      { title: 'Order placement', detail: 'One POST creates the order and its line items together.' },
      { title: 'Order status tracking', detail: 'Customers follow placed → preparing → ready without reloading.' },
      { title: 'Admin dashboard', detail: 'Live order queue with status transitions for kitchen staff.' },
      { title: 'QR generation', detail: 'Codes generated per table from the admin side.' },
      { title: 'Menu management', detail: 'Create, edit, and toggle availability of menu items.' },
      { title: 'Revenue view', detail: 'Totals aggregated from completed orders in the database.' },
    ],

    technologies: ['react', 'tailwind','html', 'css', 'javascript', 'nodejs', 'express', 'rest', 'sqlite', 'sql', 'qrcode', 'git'],

    architecture: {
      note: 'The table identity travels with the request, so ordering needs no login.',
      rows: [
        [{ id: 'customer', label: 'Customer', sub: 'Scans the table QR code', kind: 'client', icon: 'qrCode' }],
        [{ id: 'spa', label: 'React Application', sub: 'Menu · cart · order tracking', kind: 'edge', icon: 'react' }],
        [{ id: 'api', label: 'REST API', sub: 'JSON over HTTP', kind: 'api', icon: 'network' }],
        [{ id: 'backend', label: 'Express Backend', sub: 'Menu, orders, status transitions', kind: 'service', icon: 'server' }],
        [{ id: 'db', label: 'SQLite Database', sub: 'tables · menu_items · orders · order_items', kind: 'data', icon: 'database' }],
      ],
    },

    database: {
      note: 'Orders are append-only; `status` is the only column that moves after creation.',
      tables: [
        {
          name: 'tables',
          columns: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'label', type: 'TEXT', note: 'e.g. "Table 4"' },
            { name: 'qr_token', type: 'TEXT', key: 'UNIQUE' },
          ],
        },
        {
          name: 'menu_items',
          columns: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'name', type: 'TEXT' },
            { name: 'category', type: 'TEXT' },
            { name: 'price', type: 'DECIMAL' },
            { name: 'is_available', type: 'BOOLEAN' },
          ],
        },
        {
          name: 'orders',
          columns: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'table_id', type: 'INTEGER', key: 'FK', ref: 'tables.id' },
            { name: 'status', type: 'TEXT', note: 'placed · preparing · ready · served' },
            { name: 'total', type: 'DECIMAL' },
            { name: 'created_at', type: 'DATETIME' },
          ],
        },
        {
          name: 'order_items',
          columns: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'order_id', type: 'INTEGER', key: 'FK', ref: 'orders.id' },
            { name: 'menu_item_id', type: 'INTEGER', key: 'FK', ref: 'menu_items.id' },
            { name: 'quantity', type: 'INTEGER' },
            { name: 'unit_price', type: 'DECIMAL', note: 'captured at order time' },
          ],
        },
      ],
    },

    auth: [
      { label: 'Customer flow', detail: 'No account. The QR token identifies the table and scopes what the request can read.' },
      { label: 'Admin flow', detail: 'Staff routes sit behind a login; menu and status mutations are admin-only.' },
      { label: 'Scoping', detail: 'Order reads are filtered by the requesting table\'s token rather than by an id in the URL.' },
    ],

    challenges: [
      {
        title: 'Identity without accounts',
        detail:
          'A guest ordering flow still needs a subject. Deriving it from the QR token meant the table became the identity — which immediately raised the question of what stops someone editing the URL, and pushed order lookups to be filtered by token instead of by a guessable order id.',
      },
      {
        title: 'Prices that must not drift',
        detail:
          'If a line item only references `menu_items.id`, changing a price rewrites the history of every past order. Copying `unit_price` onto `order_items` at order time keeps historical totals accurate — a small denormalisation with a clear reason.',
      },
      {
        title: 'Status that two clients agree on',
        detail:
          'The kitchen dashboard writes the status and the customer view reads it. Keeping status transitions server-validated meant the order could never land in a state neither screen knew how to render.',
      },
      {
        title: 'Usable on a real phone, in a real restaurant',
        detail:
          'The whole flow happens one-handed on a small screen in poor light. Tap targets, a persistent cart summary, and legible contrast mattered more than any visual flourish.',
      },
    ],

    learnings: [
      'Capture values that must not change with history — a foreign key is a reference, not a snapshot.',
      'Not every flow needs authentication, but every flow needs scoping.',
      'Two clients reading the same resource is a strong argument for validating transitions on the server.',
      'A dashboard is a product too: the kitchen view needed as much design attention as the customer view.',
    ],

    outcome: [
      'Full loop working: scan → browse → cart → order → live status, with staff advancing orders from the dashboard.',
      'Menu and table QR codes are managed from the admin side without touching code.',
    ],
  },

  {
    slug: 'developer-portfolio',
    title: 'Developer Portfolio',
    subtitle: 'This Site',
    category: 'Frontend Engineering',
    year: '2026',
    status: 'shipped',
    featured: false,
    accent: 'accent',
    image: '',
    screenshots: [],
    github: '',
    liveDemo: '',

    summary:
      'The site you are reading. Built as a component system rather than a page, with the technical sections driven entirely by data files.',

    description:
      'Rather than describing skills in prose, the portfolio demonstrates them: the tech-stack explorer cross-references real projects, the API explorer runs the same validation module as the contact form, and the architecture and schema diagrams render from the same project data as the case studies.',

    problem:
      'A portfolio that only lists technologies asks the reader to take its word for it. The interesting constraint was making the site itself the evidence — without inventing metrics or shipping a page of decorative animation.',

    solution:
      'A token-driven design system in Tailwind CSS v4 where a single `data-theme` attribute re-themes the whole site, reusable Framer Motion variants that collapse under `prefers-reduced-motion`, and a strict data/UI split so every section is a renderer over a config file.',

    features: [
      { title: 'Token-driven theming', detail: 'One palette layer; light and dark share every component.' },
      { title: 'Interactive tech explorer', detail: 'Selecting a technology highlights the projects that actually use it.' },
      { title: 'Case-study routes', detail: 'React Router routes per project, deep-linkable and code-split.' },
      { title: 'Mock API explorer', detail: 'Labelled in-browser mock — real status codes and error shapes, no fake network calls.' },
      { title: 'Schema + architecture diagrams', detail: 'Rendered from project data; reflow to a vertical stack on mobile.' },
      { title: 'Reduced-motion support', detail: 'Animation is disabled at the source, not just shortened.' },
      { title: 'Configurable everything', detail: 'Links, stats, SEO, and feature flags live in src/config.js.' },
    ],

    technologies: ['react', 'javascript', 'html', 'css', 'tailwind', 'framer', 'rest', 'git', 'vercel', 'vscode'],

    architecture: {
      note: 'No backend. The data layer is the API.',
      rows: [
        [{ id: 'visitor', label: 'Visitor', sub: 'Any device, keyboard or pointer', kind: 'client', icon: 'users' }],
        [{ id: 'app', label: 'React + Vite SPA', sub: 'Route-level code splitting', kind: 'edge', icon: 'react' }],
        [
          { id: 'ds', label: 'Design System', sub: 'Tailwind v4 tokens', kind: 'service', icon: 'palette' },
          { id: 'motion', label: 'Motion Layer', sub: 'Shared variants, reduced-motion aware', kind: 'service', icon: 'zap' },
          { id: 'mock', label: 'Mock API', sub: 'Validation shared with the live form', kind: 'service', icon: 'network' },
        ],
        [{ id: 'data', label: 'Data Layer', sub: 'config.js · data/*.js', kind: 'data', icon: 'database' }],
        [{ id: 'host', label: 'Static Hosting', sub: 'Prebuilt assets on a CDN', kind: 'infra', icon: 'rocket' }],
      ],
    },

    database: null,

    auth: [
      { label: 'No auth surface', detail: 'A static site with no accounts has no session to steal — the safest option was fewer moving parts.' },
      { label: 'No secrets in the client', detail: 'The GitHub integration uses only unauthenticated public endpoints.' },
      { label: 'Honest form handling', detail: 'With no mail provider configured, the form validates and hands over to email rather than faking a success state.' },
    ],

    challenges: [
      {
        title: 'Two themes without doubling the CSS',
        detail:
          'Declaring the Tailwind theme `inline` so utilities compile to `var(--p-…)` meant light mode became a second block of variable declarations instead of a `dark:` variant on every element.',
      },
      {
        title: 'Motion that respects the reader',
        detail:
          'Reduced-motion support that only shortens durations still moves the page. Framer\'s `reducedMotion="user"` plus variants that fall back to opacity-only transitions removes the movement itself.',
      },
      {
        title: 'Diagrams that survive 320px',
        detail:
          'The architecture and schema visualisations are the easiest thing to break on a phone. Modelling them as rows of nodes rather than absolute positions let the same data render as a grid on desktop and a single column on mobile.',
      },
    ],

    learnings: [
      'A design system is mostly a naming problem. Once the tokens were right, the components stopped arguing.',
      'Keeping content in data files made the components smaller and the site far easier to extend.',
      'Demonstrating a skill is more convincing than listing it — and harder to fake.',
    ],

    outcome: [
      'Every technical section renders from data, so adding a project or skill needs no component changes.',
      'Light and dark themes, keyboard navigation, and reduced-motion paths all covered by the same component set.',
    ],
  },

  {
  slug: 'are-you-a-girl',
  title: 'Are You A Girl?',
  subtitle: 'Interactive Prank Quiz Experience',
  category: 'Interactive Web Experience',
  year: '2026',
  status: 'shipped',
  featured: true,
  accent: 'accent2',
  image: '',
  screenshots: [],
  github: 'https://github.com/aswapathyraj/Are-You-A-Girl',
  liveDemo: 'https://are-you-a-girl.vercel.app',

  summary:
    'A playful interactive prank quiz that turns a simple Yes/No questionnaire into an unpredictable experience using evasive buttons, animated interactions, fake scanning, sound effects, and humorous results.',

  description:
    'Are You A Girl? is a frontend-only interactive prank website designed to feel like a serious personality verification system while progressively revealing the joke. Users go through a series of Yes/No questions, but the NO button behaves unpredictably — moving away, shrinking, disappearing, or becoming unavailable. After the quiz, a fake scanning process analyzes the user and produces exaggerated personality statistics before the final reveal.',

  problem:
    'Traditional quiz interfaces are predictable: users read a question, select an answer, and continue. The goal was to break that pattern and make the interface itself part of the entertainment. The challenge was creating interactions that feel surprising and funny while remaining responsive, lightweight, and easy to use.',

  solution:
    'The application uses React state and animation logic to control the behavior of each quiz question. The NO button can change position, size, visibility, and behavior based on the current question. A fake cursor is used when necessary to guide the interaction toward YES, followed by a simulated scanning process and humorous result generation.',

  features: [
    {
      title: 'Interactive quiz',
      detail: 'A sequence of Yes/No questions designed around unpredictable interactions.'
    },
    {
      title: 'Evasive NO button',
      detail: 'The NO button moves, shrinks, shakes, disappears, or changes behavior depending on the question.'
    },
    {
      title: 'Fake cursor',
      detail: 'An in-page cursor animation creates the illusion of an automatic interaction without controlling the user\'s real mouse.'
    },
    {
      title: 'Forced interactions',
      detail: 'When the NO option becomes unavailable, the experience automatically guides the user toward YES.'
    },
    {
      title: 'Fake scanning',
      detail: 'A simulated 0% to 100% scanning sequence creates a convincing verification-style experience.'
    },
    {
      title: 'Personality analysis',
      detail: 'The application generates exaggerated and humorous personality statistics.'
    },
    {
      title: 'Sound effects',
      detail: 'Browser-generated audio feedback adds another layer of interaction to important events.'
    },
    {
      title: 'Sound control',
      detail: 'Users can enable or disable the generated sound effects through a dedicated control.'
    },
    {
      title: 'Final reveal',
      detail: 'The verification experience concludes with a comedic result and second-opinion style reveal.'
    },
  ],

  technologies: [
    'react',
    'vite',
    'html', 
    'css',
    'tailwind',
    'javascript',
    'framer',
    'lucide-react',
    'web-audio-api',
    'git'
  ],

  architecture: {
    note: 'The application is a client-side React experience with quiz state, animation state, and result state managed entirely in the browser.',
    rows: [
      [
        {
          id: 'user',
          label: 'User',
          sub: 'Interacts with the quiz',
          kind: 'client',
          icon: 'user'
        }
      ],
      [
        {
          id: 'react',
          label: 'React Application',
          sub: 'Quiz · interactions · results',
          kind: 'edge',
          icon: 'react'
        }
      ],
      [
        {
          id: 'quiz',
          label: 'Quiz Engine',
          sub: 'Questions · answers · button behavior',
          kind: 'service',
          icon: 'zap'
        }
      ],
      [
        {
          id: 'animation',
          label: 'Animation Layer',
          sub: 'Motion · fake cursor · scanning',
          kind: 'service',
          icon: 'sparkles'
        }
      ],
      [
        {
          id: 'audio',
          label: 'Web Audio API',
          sub: 'Generated interaction sounds',
          kind: 'data',
          icon: 'volume2'
        }
      ],
    ],
  },

  database: null,

  auth: [
    {
      label: 'User flow',
      detail: 'No account or authentication is required. The entire experience runs directly in the browser.'
    },
    {
      label: 'Data collection',
      detail: 'The application does not require a backend database or user account to complete the experience.'
    },
  ],

  challenges: [
    {
      title: 'Making the NO button unpredictable',
      detail:
        'The core joke depends on the NO button behaving differently across questions. Implementing movement, resizing, disappearance, and automatic interactions required carefully coordinating React state with animation state.'
    },
    {
      title: 'Keeping interactions responsive',
      detail:
        'A button that moves around the screen can easily become frustrating or unusable on smaller devices. The interaction logic needed to remain visually interesting while keeping the controls accessible.'
    },
    {
      title: 'Coordinating animation states',
      detail:
        'Quiz progression, button movement, fake cursor behavior, scanning progress, and result transitions all needed to happen in the correct order without conflicting with one another.'
    },
    {
      title: 'Creating a convincing fake verification flow',
      detail:
        'The scanning sequence and result screen needed to temporarily feel authentic before revealing the joke. Progress animation, typography, motion, and sound were combined to sell the illusion.'
    },
  ],

  learnings: [
    'Interactive interfaces can use unexpected behavior as a core part of the user experience.',
    'React state can be combined with animation libraries to create complex interaction flows without a backend.',
    'Small UI details such as sound, cursor movement, and timing can dramatically improve engagement.',
    'Responsive design becomes more challenging when interface elements intentionally move around the screen.',
    'A frontend-only application can still deliver a complete and memorable product experience.',
  ],

  outcome: [
    'Created a complete interactive prank experience from landing screen to final reveal.',
    'Implemented custom evasive-button mechanics with multiple interaction behaviors.',
    'Built animated fake scanning and personality-analysis screens.',
    'Added browser-generated sound effects without requiring external audio assets.',
    'Published the project publicly on GitHub and deployed it as a web application.',
  ],
},

{
  slug: 'cameraport',
  title: 'CameraPort',
  subtitle: 'Camera Service Management System',
  category: 'Full-Stack Application',
  year: '2025',
  status: 'shipped',
  featured: true,
  accent: 'accent2',
  image: '',
  screenshots: [],
  github: 'https://github.com/aswapathyraj/Cameraport',
  liveDemo: '',

  summary:
    'A camera repair and service management platform for managing service records, customers, administrators, invoices, and operational data through a responsive dashboard.',

  description:
    'CameraPort is a full-stack camera service management system built for organizing camera repair and maintenance operations. The application provides role-based authentication for admins and super admins, complete service record management, CSV import and export, PDF invoice generation, dashboard analytics, and responsive interfaces for managing service operations efficiently.',

  problem:
    'Managing camera repair records manually can make it difficult to track service requests, update repair information, generate invoices, and monitor overall service activity. The system needed a centralized platform where administrators could manage records efficiently while maintaining different levels of access for regular admins and super admins.',

  solution:
    'CameraPort combines a Flask backend with a lightweight HTML, CSS, and JavaScript frontend. Service records are stored in SQLite and exposed through backend routes, while role-based sessions control administrative access. The dashboard provides service statistics and recent activity, while CSV tools support bulk data management and ReportLab generates PDF invoices directly from service records.',

  features: [
    {
      title: 'Secure authentication',
      detail: 'Session-based login and logout with role-aware access for administrators.'
    },
    {
      title: 'Role-based access',
      detail: 'Admins manage their own service records while super admins have broader management and account privileges.'
    },
    {
      title: 'Service record management',
      detail: 'Create, view, edit, and delete camera repair and service records with validation.'
    },
    {
      title: 'Interactive dashboard',
      detail: 'Displays service statistics, recent activity, and status distribution through dashboard visualizations.'
    },
    {
      title: 'Chart analytics',
      detail: 'Chart.js visualizations provide a quick overview of service record status distribution.'
    },
    {
      title: 'CSV import',
      detail: 'Bulk service records can be uploaded through CSV files for faster data entry.'
    },
    {
      title: 'CSV export',
      detail: 'Filtered service information can be exported as CSV for reporting and external processing.'
    },
    {
      title: 'PDF invoices',
      detail: 'Individual service records can be converted into professionally formatted PDF invoices using ReportLab.'
    },
    {
      title: 'Bulk deletion',
      detail: 'Multiple service records can be removed efficiently from the management interface.'
    },
    {
      title: 'Responsive interface',
      detail: 'The dashboard and management screens are designed to work across desktop and mobile devices.'
    },
    {
      title: 'Backend logging',
      detail: 'Application errors and debugging information are recorded through backend logging.'
    },
  ],

  technologies: [
    'python',
    'flask',
    'html',
    'css',
    'javascript',
    'sqlite',
    'flask-session',
    'reportlab',
    'chart.js',
    'fetch-api',
    'csv',
    'sha-256',
    'font-awesome',
    'git'
  ],

  architecture: {
    note:
      'CameraPort follows a lightweight full-stack architecture where the browser communicates with a Flask backend, which handles authentication, service records, reporting, and database operations.',

    rows: [
      [
        {
          id: 'admin',
          label: 'Administrator',
          sub: 'Manages service operations',
          kind: 'client',
          icon: 'user'
        }
      ],
      [
        {
          id: 'frontend',
          label: 'Web Frontend',
          sub: 'HTML · CSS · JavaScript',
          kind: 'edge',
          icon: 'layout'
        }
      ],
      [
        {
          id: 'flask',
          label: 'Flask Backend',
          sub: 'Authentication · CRUD · API',
          kind: 'service',
          icon: 'server'
        }
      ],
      [
        {
          id: 'services',
          label: 'Application Services',
          sub: 'CSV · PDF · sessions · logging',
          kind: 'service',
          icon: 'settings'
        }
      ],
      [
        {
          id: 'database',
          label: 'SQLite Database',
          sub: 'Users · service records',
          kind: 'data',
          icon: 'database'
        }
      ],
    ],
  },

  database: {
    note:
      'SQLite provides lightweight persistent storage for authentication data and camera service records, while generated invoices and session data are handled by the application services.',

    tables: [
      {
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'INTEGER',
            key: 'PK'
          },
          {
            name: 'username',
            type: 'TEXT',
            key: 'UNIQUE'
          },
          {
            name: 'password',
            type: 'TEXT',
            note: 'SHA-256 hashed'
          },
          {
            name: 'role',
            type: 'TEXT',
            note: 'admin · super_admin'
          },
        ],
      },
      {
        name: 'service_records',
        columns: [
          {
            name: 'id',
            type: 'INTEGER',
            key: 'PK'
          },
          {
            name: 'customer',
            type: 'TEXT'
          },
          {
            name: 'camera',
            type: 'TEXT'
          },
          {
            name: 'service_details',
            type: 'TEXT'
          },
          {
            name: 'status',
            type: 'TEXT'
          },
          {
            name: 'created_at',
            type: 'DATETIME'
          },
        ],
      },
    ],
  },

  auth: [
    {
      label: 'Session authentication',
      detail:
        'Administrators authenticate through a Flask session-based login system before accessing protected management functionality.'
    },
    {
      label: 'Admin role',
      detail:
        'Regular admins can manage their permitted service records and perform normal operational tasks.'
    },
    {
      label: 'Super admin role',
      detail:
        'Super admins have extended permissions including broader record editing and administrator account management.'
    },
    {
      label: 'Protected operations',
      detail:
        'Service management and administrative operations are restricted according to the authenticated user role.'
    },
  ],

  challenges: [
    {
      title: 'Role-based permissions',
      detail:
        'The application needed to support both regular admins and super admins without exposing privileged operations to lower-level users. Permission checks therefore had to be applied to management operations as well as the interface.'
    },
    {
      title: 'Managing service records',
      detail:
        'Service records need to support creation, editing, deletion, validation, filtering, and bulk operations while remaining simple enough for day-to-day service-center use.'
    },
    {
      title: 'Bulk data management',
      detail:
        'Manually entering large numbers of service records is inefficient, so CSV import and export were added while maintaining validation around incoming data.'
    },
    {
      title: 'PDF invoice generation',
      detail:
        'Service data needed to be transformed into a usable invoice document. ReportLab was integrated into the Flask backend to generate PDF invoices directly from individual service records.'
    },
    {
      title: 'Dashboard performance',
      detail:
        'The dashboard needed to provide useful operational information without introducing a heavy frontend framework, so the project uses vanilla JavaScript and Chart.js on top of the Flask backend.'
    },
  ],

  learnings: [
    'Learned how to structure a complete Flask-based full-stack application.',
    'Improved understanding of session-based authentication and role-based authorization.',
    'Learned how to implement CRUD workflows for real-world service records.',
    'Learned how to process CSV files for bulk data import and export.',
    'Gained experience generating PDF documents dynamically with ReportLab.',
    'Learned how to create dashboard visualizations with Chart.js.',
    'Improved understanding of SQLite database integration with Flask.',
    'Learned how backend logging can help diagnose application errors and operational issues.',
  ],

  outcome: [
    'Built a complete camera repair and service management platform.',
    'Implemented role-based access for admins and super admins.',
    'Created full service record CRUD functionality.',
    'Added CSV import and export for bulk data management.',
    'Implemented PDF invoice generation from service records.',
    'Created an interactive dashboard with service statistics and Chart.js visualizations.',
    'Built a responsive interface using HTML, CSS, and vanilla JavaScript.',
    'Packaged the system as a lightweight Flask and SQLite application.',
  ],
},

  {
    slug: 'next-project',
    title: 'Next Project',
    subtitle: 'Slot reserved',
    category: 'Placeholder',
    year: '',
    status: 'placeholder',
    featured: false,
    accent: 'accent2',
    image: '',
    screenshots: [],
    github: '',
    liveDemo: '',
    summary:
      'An open slot. Copy any object in src/data/projects.js, change the slug, and it appears here with a full case-study page.',
    description: '',
    problem: '',
    solution: '',
    features: [],
    technologies: [],
    architecture: null,
    database: null,
    auth: [],
    challenges: [],
    learnings: [],
    outcome: [],
  },
]

/** Projects with real content, in display order. */
export const realProjects = projects.filter((p) => p.status !== 'placeholder')

export const featuredProjects = projects.filter((p) => p.featured)

export const getProjectBySlug = (slug) => projects.find((p) => p.slug === slug)

/** Slugs of every project that lists the given skill id. */
export const projectsUsingSkill = (skillId) =>
  realProjects.filter((p) => p.technologies.includes(skillId))
