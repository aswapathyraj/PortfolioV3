/**
 * Typed fetch wrapper for the Control Center API.
 *
 * Conventions the server follows:
 *   success -> { success: true, ...payload }
 *   failure -> { success: false, error: { code, message, details? } }
 *
 * Access tokens are attached from localStorage (`admin/token`) and refreshed
 * through the /auth/refresh cookie endpoint when a 401 is hit.
 */

const API = '/api'
const TOKEN_KEY = 'admin/token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    signal,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  let json = null
  try {
    json = await response.json()
  } catch {
    // non-JSON server response; fall through to status handling
  }

  if (!response.ok) {
    const message = json?.error?.message ?? 'Request failed'
    const code = json?.error?.code ?? 'REQUEST_FAILED'
    // 401 on a non-refresh call: the access token expired — try the cookie once.
    if (code === 'UNAUTHORIZED' && !path.startsWith('/auth/')) {
      const refreshed = await refreshAccessToken()
      if (refreshed) return request(path, { method, body, signal })
    }
    throw new ApiError(response.status, code, message, json?.error?.details)
  }

  return json
}

/** Attempts a silent refresh using the httpOnly refresh cookie. Returns the new token or null. */
export async function refreshAccessToken() {
  try {
    const response = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' })
    const json = await response.json()
    if (response.ok && json.accessToken) {
      setToken(json.accessToken)
      return json.accessToken
    }
    setToken(null)
    return null
  } catch {
    setToken(null)
    return null
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

/** Convenience for the typed data payload the server wraps responses in. */
export const data = (json) => json?.data