/**
 * About section content: the narrative, the focus areas, and the interactive
 * build-lifecycle strip.
 */

export const aboutIntro = [
  'I build complete web applications — the interface, the API behind it, the schema underneath, and the deployment that puts it in front of someone. Most of what I have shipped covers all four layers, because that is where the interesting problems are: the gap between a screen that looks right and a system that behaves correctly.',
  'My two main projects were chosen for what they force you to solve rather than what they look like. An art platform with auctions makes you take server-side validation and transactions seriously, because a bid that is accepted twice is a broken product. A restaurant ordering system with no login makes you separate identity from authentication, and then work out how to scope data without one.',
]

export const focusAreas = [
  {
    id: 'interfaces',
    label: 'Interfaces that hold up',
    detail: 'Responsive, keyboard-navigable, and designed per breakpoint rather than scaled down from desktop.',
    icon: 'monitor',
  },
  {
    id: 'apis',
    label: 'APIs with clear contracts',
    detail: 'Resource-shaped routes, honest status codes, and one error format the client can rely on.',
    icon: 'network',
  },
  {
    id: 'data',
    label: 'Schemas before endpoints',
    detail: 'Relationships and constraints first; the API tends to fall out of a schema that is actually correct.',
    icon: 'database',
  },
  {
    id: 'security',
    label: 'Trust boundaries',
    detail: 'The server is the boundary. Client-side checks are feedback; enforcement happens behind the request.',
    icon: 'shield',
  },
]

/**
 * Build lifecycle. Each stage reveals its detail on hover, click, or keyboard
 * focus — the copy is what actually happens at that stage in my projects.
 */
export const lifecycleStages = [
  {
    id: 'idea',
    label: 'Idea',
    icon: 'lightbulb',
    summary: 'What problem is this, and for whom?',
    detail:
      'I write down the one thing the product must do well before anything else. For the ordering system that was "order faster than flagging someone down" — which is what ruled out a signup flow.',
  },
  {
    id: 'design',
    label: 'Design',
    icon: 'penTool',
    summary: 'Structure and hierarchy before pixels.',
    detail:
      'Layout, states, and the mobile view first. Every screen needs an empty state, a loading state, and an error state decided up front, not retrofitted.',
  },
  {
    id: 'data',
    label: 'Data Model',
    icon: 'dbdesign',
    summary: 'Tables, keys, and relationships.',
    detail:
      'I model entities and their relationships before writing a route. Deciding that order line items capture their own unit price happened here, not after prices changed.',
  },
  {
    id: 'api',
    label: 'API',
    icon: 'network',
    summary: 'Resources, methods, status codes.',
    detail:
      'Endpoints follow the schema. Each one gets a defined success shape and a defined error shape, so the frontend never parses prose to find out what went wrong.',
  },
  {
    id: 'development',
    label: 'Development',
    icon: 'code',
    summary: 'Build the vertical slice, then widen it.',
    detail:
      'One feature end to end — UI through API to database — before starting the next. It surfaces integration problems while they are still cheap.',
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'shield',
    summary: 'Authenticate, then authorise.',
    detail:
      'Hash passwords, verify tokens, gate routes by role, and check row ownership. This step is where I ask what happens if the caller edits the id in the URL.',
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: 'testTube',
    summary: 'Break it deliberately.',
    detail:
      'Manual verification of the paths that matter: wrong credentials, expired tokens, oversized uploads, bids below the current price, and every layout down to 320px.',
  },
  {
    id: 'deployment',
    label: 'Deployment',
    icon: 'rocket',
    summary: 'Production build, real environment.',
    detail:
      'Fix every build warning, keep secrets in environment variables rather than the repository, and confirm the deployed build behaves like the local one.',
  },
]
