import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { config } from '../config.js'
import { prisma } from '../lib/prisma.js'

/** Signs a short-lived access token that travels in the response body. */
export function signAccessToken(admin) {
  return jwt.sign(
    { sub: admin.id, role: admin.role, email: admin.email },
    config.jwtSecret,
    { expiresIn: config.accessTokenTtl },
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret)
}

/** Random opaque refresh token; only its hash is stored, so a leaked DB copy cannot mint sessions. */
export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url')
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createRefreshSession(admin, req) {
  const token = generateRefreshToken()
  const session = await prisma.session.create({
    data: {
      adminId: admin.id,
      tokenHash: hashRefreshToken(token),
      userAgent: req.headers['user-agent']?.slice(0, 300) ?? null,
      ip: req.ip ?? null,
      device: describeDevice(req.headers['user-agent']),
      expiresAt: new Date(Date.now() + config.refreshTokenTtlMs),
    },
  })
  return { token, session }
}

/** Best-effort device label for the session list. */
export function describeDevice(ua = '') {
  if (!ua) return 'Unknown device'
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) ? 'Safari' : 'Browser'
  const os =
    /Windows/.test(ua) ? 'Windows' :
    /Mac OS X/.test(ua) ? 'macOS' :
    /Linux/.test(ua) ? 'Linux' :
    /Android/.test(ua) ? 'Android' :
    /iPhone|iPad/.test(ua) ? 'iOS' : 'Unknown OS'
  return `${browser} — ${os}`
}

/** Clears the refresh cookie (used on logout + token rotation). */
export function clearRefreshCookie(res) {
  res.clearCookie('pf_rt', refreshCookieOptions())
  res.clearCookie('pf_at', refreshCookieOptions())
}

export function setRefreshCookie(res, token) {
  const opts = refreshCookieOptions()
  res.cookie('pf_rt', token, { ...opts, httpOnly: true })
}

export function setAccessCookie(res, token) {
  const opts = refreshCookieOptions()
  res.cookie('pf_at', token, { ...opts, httpOnly: false, maxAge: 15 * 60 * 1000 })
}

function refreshCookieOptions() {
  const base = {
    path: '/',
    secure: config.cookieSecure,
    sameSite: 'strict',
  }
  return {
    ...base,
    maxAge: config.refreshTokenTtlMs,
    ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
  }
}