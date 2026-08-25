/**
 * Reference architecture for the full-stack applications on this site.
 *
 * Uses the same `rows: Node[][]` shape as each project's `architecture` field,
 * so <FlowDiagram /> renders both. Rows stack vertically; a row with multiple
 * nodes fans out on desktop and collapses to a single column on mobile.
 */

export const systemArchitecture = {
  title: 'Reference Architecture',
  note: 'The shape both full-stack projects share. Select any layer to see what it owns.',
  rows: [
    [
      {
        id: 'user',
        label: 'User',
        sub: 'Browser · mobile · desktop',
        kind: 'client',
        icon: 'users',
        responsibility: 'Sends requests and renders whatever the client gives it. Nothing here can be trusted.',
        tech: ['Any modern browser'],
        risk: 'Treating client input as validated is the single most common source of security bugs.',
      },
    ],
    [
      {
        id: 'frontend',
        label: 'React Frontend',
        sub: 'Components · routing · state',
        kind: 'edge',
        icon: 'react',
        responsibility:
          'Owns presentation and interaction: routing, form state, optimistic feedback, and rendering server data. It formats and requests; it never decides permissions.',
        tech: ['React', 'React Router', 'Tailwind CSS', 'Framer Motion'],
        risk: 'Without a clear boundary here, business rules leak into components and get duplicated per screen.',
      },
    ],
    [
      {
        id: 'api',
        label: 'REST API',
        sub: 'HTTP contract · JSON',
        kind: 'api',
        icon: 'network',
        responsibility:
          'The contract between client and server: resource-shaped routes, correct status codes, and one consistent error envelope.',
        tech: ['Express routers', 'JSON', 'HTTP status codes'],
        risk: 'An inconsistent contract forces the client to guess, and guessing clients break on every backend change.',
      },
    ],
    [
      {
        id: 'authlayer',
        label: 'Authentication',
        sub: 'Identity · roles · ownership',
        kind: 'service',
        icon: 'key',
        responsibility:
          'Verifies the signed token, attaches the caller to the request, gates the route by role, and checks that the caller owns the specific row being touched.',
        tech: ['JWT verification', 'bcrypt', 'Role guards', 'Ownership checks'],
        risk: 'Route-level checks alone let any authenticated user operate on any record by changing an id.',
      },
      {
        id: 'logic',
        label: 'Business Logic',
        sub: 'Rules · validation · transactions',
        kind: 'service',
        icon: 'workflow',
        responsibility:
          'Where the product\'s actual rules live: is this bid higher than the current one, is this item still available, may this order change state. Multi-step writes run in a transaction.',
        tech: ['Server-side validation', 'Domain rules', 'Transactions'],
        risk: 'Rules enforced only in the UI are advisory. Anything reachable by curl has to be checked here.',
      },
    ],
    [
      {
        id: 'database',
        label: 'Database',
        sub: 'Relational storage',
        kind: 'data',
        icon: 'database',
        responsibility:
          'Persists state and enforces structural truth with primary keys, foreign keys, unique constraints, and indexes on lookup columns.',
        tech: ['SQLite', 'SQL', 'Foreign keys', 'Indexes'],
        risk: 'Constraints left out of the schema become invariants that only hold while every code path stays correct.',
      },
    ],
    [
      {
        id: 'deployment',
        label: 'Deployment',
        sub: 'Build · environment · hosting',
        kind: 'infra',
        icon: 'rocket',
        responsibility:
          'Produces the production build, injects configuration from environment variables, and serves the result. Secrets stay out of the repository.',
        tech: ['Production builds', 'Environment variables', 'Vercel', 'Git-based deploys'],
        risk: 'Configuration committed to source control is the fastest way to leak a credential permanently.',
      },
    ],
  ],
}

/** Colour + label mapping for node kinds, shared by every diagram. */
export const nodeKinds = {
  client: { label: 'Client', tone: 'neutral' },
  edge: { label: 'Presentation', tone: 'accent' },
  api: { label: 'Contract', tone: 'accent' },
  service: { label: 'Server', tone: 'accent2' },
  data: { label: 'Data', tone: 'warn' },
  infra: { label: 'Infrastructure', tone: 'neutral' },
}
