/**
 * Public portfolio API client.
 *
 * Thin, read-only client for the live site. All calls go through the same
 * /api/public/* endpoints the server exposes, and every request is wrapped so a
 * missing or slow backend degrades to a thrown error the hydration layer can
 * catch and fall back to the static data files.
 */

const PUBLIC_API = '/api/public'

async function get(path, { timeout = 4000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  let response
  try {
    response = await fetch(`${PUBLIC_API}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new Error(`Public API ${path} responded ${response.status}`)
  }

  const json = await response.json().catch(() => null)
  // The public API wraps payloads in { success: true, data: ... }.
  if (!json || json.success === false) {
    throw new Error(`Public API ${path} returned an unexpected payload`)
  }
  return json.data ?? null
}

export const publicApi = {
  projects: () => get('/projects'),
  project: (slug) => get(`/projects/${encodeURIComponent(slug)}`),
  skills: () => get('/skills'),
  experience: () => get('/experience'),
  security: () => get('/security'),
  engineering: () => get('/engineering'),
  apiDocs: () => get('/api-docs'),
  seo: () => get('/seo'),
  profile: () => get('/profile'),
}