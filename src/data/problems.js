/**
 * "Problems I Like Solving" — each card expands to the concrete version of the
 * problem and where it showed up in real work.
 */

export const problems = [
  {
    id: 'ideas-to-interfaces',
    number: '01',
    title: 'Turning ideas into usable interfaces',
    icon: 'penTool',
    hook: 'The gap between a description and a screen someone can operate.',
    detail:
      'A feature list says nothing about hierarchy, sequence, or what happens when a field is empty. The work is deciding what the user sees first, what they can do next, and what the screen looks like while it is waiting or when it has failed.',
    example: 'The kitchen dashboard needed as much design attention as the customer menu — staff use it under time pressure.',
  },
  {
    id: 'api-structure',
    number: '02',
    title: 'Designing scalable API structures',
    icon: 'network',
    hook: 'Route layouts that survive the fourth feature.',
    detail:
      'Splitting routes by resource and pushing authentication, authorization, and error handling into shared middleware means adding an endpoint is additive. When those concerns live inside handlers, every new route copies the last one\'s mistakes.',
    example: 'PHLOX has separate routers for artworks, auctions, bids, users, and admin behind one middleware stack.',
  },
  {
    id: 'frontend-to-database',
    number: '03',
    title: 'Connecting interfaces to databases',
    icon: 'database',
    hook: 'Getting a value from a table onto a screen without duplicating it.',
    detail:
      'The interesting part is not the query — it is deciding who owns each piece of state. If the server owns it, the component reads it. Copying it into local state is how two sources of truth appear and quietly diverge.',
    example: 'Order status is written by the dashboard and read by the customer view; neither keeps its own copy.',
  },
  {
    id: 'auth',
    number: '04',
    title: 'Authentication and authorization',
    icon: 'key',
    hook: 'Two different questions that get treated as one.',
    detail:
      'Authentication asks who is calling. Authorization asks whether they may touch this specific record. A valid token answers only the first, so route guards need row-level ownership checks behind them.',
    example: 'An artist with a valid token still cannot edit another artist\'s artwork — the row\'s owner is checked too.',
  },
  {
    id: 'dashboards',
    number: '05',
    title: 'Building admin dashboards',
    icon: 'dashboard',
    hook: 'Interfaces for people whose job depends on them.',
    detail:
      'Admin tools get treated as internal and therefore ugly, which makes them slow to use. Clear state, obvious next actions, and honest empty states matter more here than anywhere else in the product.',
    example: 'Menu management, table QR generation, and revenue totals all read from the same API the customer app uses.',
  },
  {
    id: 'responsive',
    number: '06',
    title: 'Creating genuinely responsive interfaces',
    icon: 'smartphone',
    hook: 'Designing for 320px instead of squeezing 1440px.',
    detail:
      'Some layouts do not have a small-screen version — they need a different one. Diagrams become vertical flows, tables become stacked records, and multi-column grids become a single ordered column.',
    example: 'The architecture and schema diagrams on this page reflow rather than scale, because scaled diagrams stop being readable.',
  },
  {
    id: 'deployment',
    number: '07',
    title: 'Deploying production applications',
    icon: 'rocket',
    hook: 'The distance between "works locally" and "works".',
    detail:
      'Production builds surface what development hides: missing environment variables, absolute paths, assets that only resolve on one machine. Clearing every build warning is the cheapest bug-fixing there is.',
    example: 'Configuration for this site is centralised, so pointing it at a new domain means changing one value.',
  },
]
