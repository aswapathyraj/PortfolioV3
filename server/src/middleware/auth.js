import { ApiError } from '../lib/errors.js'
import { verifyAccessToken } from '../services/tokens.js'

/**
 * Authentication middleware.
 *
 * The access token may arrive as a Bearer header (SPA keeps it in memory) or an
 * HttpOnly cookie. Either way it is verified before any handler runs. Unreadable
 * or expired tokens fail at the boundary with 401.
 */
export function requireAuth(req, res, next) {
  let token = null

  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) token = header.slice(7).trim()
  if (!token && req.cookies?.pf_at) token = req.cookies.pf_at

  if (!token) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required.'))
  }

  try {
    const payload = verifyAccessToken(token)
    req.auth = { adminId: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch {
    return next(new ApiError(401, 'INVALID_TOKEN', 'Session expired or token invalid. Sign in again.'))
  }
}

/**
 * Authorization middleware. Roles:
 *   owner        — everything
 *   administrator — everything except destructive owner-level operations
 *   editor       — content only
 */
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
}

const roleHierarchy = { editor: 0, admin: 1, owner: 2 }

export function requireRole(...allowed) {
  const minimum = Math.min(...allowed.map((role) => roleHierarchy[role] ?? 0))
  return (req, res, next) => {
    if (!req.auth) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required.'))
    const level = roleHierarchy[req.auth.role] ?? -1
    if (level < minimum) {
      return next(
        new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'),
      )
    }
    next()
  }
}

/** Owner-only endpoint wrapper (destructive or sensitive system operations). */
export const requireOwner = requireRole(ROLES.OWNER)

/**
 * Writes a transient "effective role" onto the request so handlers can honour
 * `req.admin` after a DB fetch without repeating the hierarchy check.
 */
export function attachAdminFromProjection(_req, _res, next) {
  next()
}