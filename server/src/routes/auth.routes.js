import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { asyncHandler, ApiError, ok } from '../lib/errors.js'
import { validate } from '../middleware/validate.js'
import { loginRateLimiter } from '../middleware/rateLimit.js'
import { requireAuth } from '../middleware/auth.js'
import { recordActivity } from '../lib/audit.js'
import {
  signAccessToken,
  createRefreshSession,
  hashRefreshToken,
  setRefreshCookie,
  setAccessCookie,
  clearRefreshCookie,
} from '../services/tokens.js'
import { loginSchema, changePasswordSchema } from '../schemas.js'

const publicAdmin = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  avatarUrl: admin.avatarUrl,
})

const router = Router()

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const admin = await prisma.admin.findUnique({ where: { email } })
    // Constant-ish work even when the account does not exist, and no oracle
    // about which emails are registered.
    const hash = admin?.passwordHash ?? '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    const valid = await bcrypt.compare(password, hash)

    if (!admin || !valid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
    }

    const { token } = await createRefreshSession(admin, req)
    const accessToken = signAccessToken(admin)

    setRefreshCookie(res, token)
    setAccessCookie(res, accessToken)

    await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
    await recordActivity({ req, action: 'admin.login', entity: 'auth', entityTitle: admin.email })

    ok(res, { admin: publicAdmin(admin), accessToken })
  }),
)

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const rawToken = req.cookies?.pf_rt
    if (!rawToken) throw new ApiError(401, 'UNAUTHORIZED', 'No session cookie found.')

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashRefreshToken(rawToken) },
      include: { admin: true },
    })

    const usable =
      session &&
      !session.revokedAt &&
      session.expiresAt > new Date() &&
      session.admin

    if (!usable) {
      clearRefreshCookie(res)
      throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired. Sign in again.')
    }

    // Refresh token rotation: the presented token is invalidated and replaced.
    // deleteMany is idempotent — concurrent rotations that already removed this
    // session resolve to zero rows instead of throwing a P2025 not-found error.
    await prisma.session.deleteMany({ where: { id: session.id } })
    const { token: newToken } = await createRefreshSession(session.admin, req)
    const accessToken = signAccessToken(session.admin)

    setRefreshCookie(res, newToken)
    setAccessCookie(res, accessToken)

    ok(res, { admin: publicAdmin(session.admin), accessToken })
  }),
)

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const rawToken = req.cookies?.pf_rt
    if (rawToken) {
      await prisma.session
        .deleteMany({ where: { tokenHash: hashRefreshToken(rawToken) } })
        .catch(() => {})
    }
    clearRefreshCookie(res)
    await recordActivity({ req, action: 'admin.logout', entity: 'auth' })
    ok(res, { message: 'Signed out.' })
  }),
)

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.auth.adminId } })
    if (!admin) throw new ApiError(401, 'UNAUTHORIZED', 'Account no longer exists.')
    ok(res, { admin: publicAdmin(admin) })
  }),
)

router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.auth.adminId } })
    if (!admin) throw new ApiError(401, 'UNAUTHORIZED', 'Account no longer exists.')

    const valid = await bcrypt.compare(req.body.currentPassword, admin.passwordHash)
    if (!valid) throw new ApiError(422, 'INVALID_PASSWORD', 'Current password is incorrect.')

    const passwordHash = await bcrypt.hash(req.body.newPassword, 12)
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } })

    // Password change revokes every session except the current one.
    const currentRefresh = req.cookies?.pf_rt
    if (currentRefresh) {
      const currentHash = hashRefreshToken(currentRefresh)
      await prisma.session.deleteMany({
        where: { adminId: admin.id, NOT: { tokenHash: currentHash } },
      })
    } else {
      await prisma.session.deleteMany({ where: { adminId: admin.id } })
    }

    await recordActivity({ req, action: 'admin.password_changed', entity: 'auth' })
    ok(res, { message: 'Password updated. Other sessions were signed out.' })
  }),
)

export default router