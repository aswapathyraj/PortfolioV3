/**
 * "How I Build" — the application lifecycle as nine inspectable steps.
 * `example` must reference something real from src/data/projects.js.
 */

export const engineeringSteps = [
  {
    id: 'research',
    number: '01',
    title: 'Research',
    icon: 'search',
    what: 'Define the single job the product has to do, and find where existing solutions make it slow or awkward.',
    tech: ['Problem framing', 'User flows', 'Scope constraints'],
    why: 'Most wasted work comes from building the right feature for the wrong problem. Narrowing the job early is what makes later trade-offs decidable.',
    example: {
      project: 'qr-food-ordering',
      note: 'The job was "order without waiting". That single constraint eliminated account creation, which then dictated how identity and data scoping had to work.',
    },
  },
  {
    id: 'planning',
    number: '02',
    title: 'Planning',
    icon: 'clipboard',
    what: 'Break the product into entities, roles, and the routes that connect them. Decide what ships first.',
    tech: ['Entity modelling', 'Role matrix', 'Route planning'],
    why: 'Writing down which role may do what turns permissions from an afterthought into a specification the middleware can implement.',
    example: {
      project: 'phlox',
      note: 'Three roles — visitor, artist, admin — were mapped against every action before any route existed. That table became the authorization middleware.',
    },
  },
  {
    id: 'uiux',
    number: '03',
    title: 'UI / UX',
    icon: 'penTool',
    what: 'Design the mobile layout first, then the desktop one. Define every state a screen can be in.',
    tech: ['Design tokens', 'Responsive layout', 'Empty / loading / error states'],
    why: 'A screen with no empty state and no error state is half a screen. Deciding them during design stops them from becoming console errors later.',
    example: {
      project: 'developer-portfolio',
      note: 'This site defines one palette as tokens, so light and dark share every component instead of duplicating styles.',
    },
  },
  {
    id: 'frontend',
    number: '04',
    title: 'Frontend',
    icon: 'react',
    what: 'Build composable components, keep state as close to where it is used as possible, and render from the API rather than from local copies.',
    tech: ['React', 'Component composition', 'Tailwind CSS', 'Framer Motion'],
    why: 'Duplicated state is where most UI bugs live. If the server owns a value, the component should read it, not mirror it.',
    example: {
      project: 'phlox',
      note: 'The client renders navigation and available actions from the decoded JWT, so one build serves all three roles without role-specific bundles.',
    },
  },
  {
    id: 'api',
    number: '05',
    title: 'API',
    icon: 'network',
    what: 'Group routes by resource behind shared middleware. Return correct status codes and a consistent error shape.',
    tech: ['Node.js', 'Express', 'REST', 'Middleware'],
    why: 'A predictable contract means the frontend can handle failure structurally instead of matching on message strings.',
    example: {
      project: 'phlox',
      note: 'Artworks, auctions, bids, users, and admin each got their own router, with authentication and error handling applied once rather than per route.',
    },
  },
  {
    id: 'database',
    number: '06',
    title: 'Database',
    icon: 'database',
    what: 'Design the schema, add foreign keys and indexes, and wrap multi-step writes in transactions.',
    tech: ['SQLite', 'SQL', 'Foreign keys', 'Transactions', 'Parameterised queries'],
    why: 'Constraints in the database hold even when application code is wrong. That is the point of putting them there.',
    example: {
      project: 'phlox',
      note: 'Accepting a bid writes the bid row and updates the auction together, so a rejected bid cannot leave the auction partially updated.',
    },
  },
  {
    id: 'auth',
    number: '07',
    title: 'Authentication',
    icon: 'key',
    what: 'Hash passwords, issue signed tokens, verify them in middleware, and check record ownership separately from role.',
    tech: ['bcrypt', 'JWT', 'Role guards', 'Ownership checks'],
    why: 'A valid token proves identity, not entitlement. Treating them as one question is how users end up editing each other\'s data.',
    example: {
      project: 'phlox',
      note: 'Artwork mutations compare the token\'s user id against the row\'s `user_id`, so an authenticated artist still cannot edit someone else\'s piece.',
    },
  },
  {
    id: 'testing',
    number: '08',
    title: 'Testing',
    icon: 'testTube',
    what: 'Walk the unhappy paths on purpose: bad credentials, expired tokens, invalid payloads, and every breakpoint.',
    tech: ['Manual path testing', 'API clients', 'Responsive checks', 'Keyboard navigation'],
    why: 'The happy path almost always works. Everything that reaches users as a bug lives one step off it.',
    example: {
      project: 'qr-food-ordering',
      note: 'Editing the identifier in the URL was tested explicitly — which is why order reads are filtered by the table token instead of by a guessable id.',
    },
  },
  {
    id: 'deployment',
    number: '09',
    title: 'Deployment',
    icon: 'rocket',
    what: 'Produce a clean production build, keep configuration in environment variables, and verify the deployed build.',
    tech: ['Production builds', 'Environment variables', 'Vercel', 'Git-based deploys'],
    why: 'A build that only works locally is not finished. Warnings ignored at this stage are the ones that break in production.',
    example: {
      project: 'developer-portfolio',
      note: 'Personal links, feature flags, and SEO metadata all live in one config file, so deploying to a new domain changes one value.',
    },
  },
]
