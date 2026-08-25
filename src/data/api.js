/**
 * API Explorer endpoint definitions.
 *
 * IMPORTANT: this is a documented mock, not a deployed backend. Responses are
 * produced in-browser by src/utils/mockApi.js from the same data files the rest
 * of the site renders — no network request is made and nothing pretends
 * otherwise. `POST /api/contact` runs the exact validator the real contact form
 * uses, so its error responses are genuine.
 */

export const apiMeta = {
  baseUrl: '/api',
  version: 'v1',
  disclaimer:
    'Demonstration only. These responses are generated in the browser from this site\'s data layer — no request leaves your device.',
}

export const apiEndpoints = [
  {
    id: 'list-projects',
    method: 'GET',
    path: '/api/projects',
    summary: 'List projects',
    description:
      'Returns every documented project with its stack and case-study path. Supports filtering by technology.',
    auth: false,
    query: [
      { name: 'tech', type: 'string', required: false, note: 'Skill id, e.g. `react`' },
      { name: 'limit', type: 'integer', required: false, note: 'Default 10, max 50' },
    ],
    body: null,
    statuses: [
      { code: 200, label: 'OK', note: 'Array of projects, possibly empty' },
      { code: 400, label: 'Bad Request', note: '`limit` is not a positive integer' },
    ],
  },
  {
    id: 'get-project',
    method: 'GET',
    path: '/api/projects/:slug',
    summary: 'Get one project',
    description:
      'Full case-study payload for a single project: problem, solution, features, architecture, and schema.',
    auth: false,
    params: [{ name: 'slug', type: 'string', required: true, note: 'e.g. `phlox`' }],
    body: null,
    statuses: [
      { code: 200, label: 'OK' },
      { code: 404, label: 'Not Found', note: 'No project with that slug' },
    ],
    sampleParams: { slug: 'phlox' },
  },
  {
    id: 'list-skills',
    method: 'GET',
    path: '/api/skills',
    summary: 'List skills',
    description:
      'Skills grouped by category, each annotated with the projects that actually use it.',
    auth: false,
    query: [
      {
        name: 'category',
        type: 'string',
        required: false,
        note: 'frontend · backend · database · security · tools',
      },
    ],
    body: null,
    statuses: [
      { code: 200, label: 'OK' },
      { code: 400, label: 'Bad Request', note: 'Unknown category' },
    ],
  },
  {
    id: 'get-stack',
    method: 'GET',
    path: '/api/stack',
    summary: 'Stack summary',
    description: 'Condensed view of the stack — the shape a "hire me" integration would want.',
    auth: false,
    body: null,
    statuses: [{ code: 200, label: 'OK' }],
  },
  {
    id: 'post-contact',
    method: 'POST',
    path: '/api/contact',
    summary: 'Submit a message',
    description:
      'Validates a contact submission. This endpoint runs the same validation module as the live contact form, so its 422 responses are the real ones.',
    auth: false,
    body: {
      name: 'string, 2–80 chars',
      email: 'string, valid address',
      subject: 'string, 3–120 chars',
      message: 'string, 20–2000 chars',
    },
    sampleBody: {
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      subject: 'Frontend role — interview',
      message:
        'Saw your PHLOX case study and would like to talk about a full-stack position on our product team.',
    },
    statuses: [
      { code: 202, label: 'Accepted', note: 'Payload is valid and would be queued for delivery' },
      { code: 422, label: 'Unprocessable Entity', note: 'Field-level validation errors' },
      { code: 429, label: 'Too Many Requests', note: 'Rate limit — where it would apply in production' },
    ],
  },
  {
    id: 'get-health',
    method: 'GET',
    path: '/api/health',
    summary: 'Health check',
    description: 'The endpoint every deployment needs and every tutorial skips.',
    auth: false,
    body: null,
    statuses: [{ code: 200, label: 'OK' }],
  },
]

export const methodTones = {
  GET: 'accent',
  POST: 'accent2',
  PUT: 'warn',
  PATCH: 'warn',
  DELETE: 'danger',
}
