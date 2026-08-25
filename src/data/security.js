/**
 * Security section.
 *
 * `level` is deliberately explicit and must stay accurate:
 *
 *   'implemented' — built and running in one of the projects listed below
 *   'studied'     — understood and can reason about, but not shipped by me yet
 *
 * The section renders the two differently. Do not promote an item to
 * 'implemented' until it actually is.
 */

export const securityControls = [
  {
    id: 'password-hashing',
    label: 'Password Security',
    value: 'bcrypt',
    icon: 'bcrypt',
    level: 'implemented',
    projects: ['phlox'],
    summary: 'Salted hashing on registration, comparison on login. Plaintext is never stored.',
    detail:
      'Passwords are hashed with bcrypt before they reach the database, so a copy of the users table does not hand over accounts. Login compares the candidate against the stored hash rather than decrypting anything — there is nothing to decrypt.',
  },
  {
    id: 'jwt-auth',
    label: 'Authentication',
    value: 'JWT',
    icon: 'jwt',
    level: 'implemented',
    projects: ['phlox'],
    summary: 'Signed tokens issued at login and verified by middleware on protected routes.',
    detail:
      'A successful login returns a signed token that the client sends as a Bearer header. Middleware verifies the signature and attaches the caller to the request, so handlers never parse credentials themselves. An invalid or expired token fails at the boundary with 401 before any handler runs.',
  },
  {
    id: 'rbac',
    label: 'Authorization',
    value: 'Role-Based Access',
    icon: 'rbac',
    level: 'implemented',
    projects: ['phlox', 'qr-food-ordering'],
    summary: 'Role flags gate the route; row ownership gates the record.',
    detail:
      'Roles travel in the token, so a route can require artist or admin without an extra query. That alone is not enough: mutating routes also compare the caller\'s id against the row\'s owner column, because "logged in" and "allowed to change this record" are different questions.',
  },
  {
    id: 'input-validation',
    label: 'Input Validation',
    value: 'Server-Side',
    icon: 'checkCircle',
    level: 'implemented',
    projects: ['phlox', 'qr-food-ordering'],
    summary: 'The server is the trust boundary. Client checks are feedback only.',
    detail:
      'Every payload is validated server-side before it touches the database — required fields, types, ranges, and business rules such as a bid needing to exceed the current high bid. Client-side validation exists to give fast feedback, not to enforce anything.',
  },
  {
    id: 'sql-injection',
    label: 'Query Safety',
    value: 'Parameterised SQL',
    icon: 'sql',
    level: 'implemented',
    projects: ['phlox', 'qr-food-ordering'],
    summary: 'Values are bound as parameters, never concatenated into SQL.',
    detail:
      'All statements use placeholders with bound values, so user input is data rather than syntax. This is the default in both projects — there is no code path that builds a query by string concatenation.',
  },
  {
    id: 'file-uploads',
    label: 'File Uploads',
    value: 'Constrained',
    icon: 'fileUp',
    level: 'implemented',
    projects: ['phlox'],
    summary: 'MIME type and size limits, with server-generated filenames.',
    detail:
      'Multer restricts accepted MIME types and maximum file size, and stored filenames are generated server-side instead of trusting the client\'s. Without both, an image upload endpoint is an arbitrary-write primitive.',
  },
  {
    id: 'rate-limiting',
    label: 'API Protection',
    value: 'Rate Limiting',
    icon: 'ratelimit',
    level: 'studied',
    projects: [],
    summary: 'Throttling authentication endpoints so credential guessing costs time.',
    detail:
      'The approach I would apply: a per-IP request window on login and registration specifically, rather than one global limit, so brute-force attempts get expensive while normal browsing stays unaffected. I have not shipped this in the projects listed here.',
  },
  {
    id: 'csrf',
    label: 'Request Security',
    value: 'CSRF Protection',
    icon: 'csrf',
    level: 'studied',
    projects: [],
    summary: 'Why cookie sessions need a token a cross-site form cannot read.',
    detail:
      'A browser attaches cookies to cross-site form posts automatically, so a cookie-session API needs an unguessable token the attacking page cannot read. Bearer-token APIs like the ones here are not exposed the same way — the trade-off moves to where the token is stored on the client. Understanding which model you are in is the actual skill.',
  },
  {
    id: 'session-handling',
    label: 'Session Handling',
    value: 'Token Lifecycle',
    icon: 'timer',
    level: 'studied',
    projects: [],
    summary: 'Expiry, refresh, and what logout can and cannot revoke.',
    detail:
      'A stateless signed token stays valid until it expires, which means logout on the client is not revocation. Short expiry windows, or a server-side denylist when real revocation is required, are the two options — and knowing that a plain JWT gives you neither for free matters more than the implementation detail.',
  },
]

export const securityNote =
  'Split honestly between what is running in the projects on this site and what I understand but have not shipped. Nothing here is a claim of an audited or production-hardened system.'

export const securityLevels = {
  implemented: {
    label: 'Implemented',
    description: 'Built and running in the linked project',
    tone: 'accent',
  },
  studied: {
    label: 'Studied',
    description: 'Understood, not yet shipped by me',
    tone: 'neutral',
  },
}
