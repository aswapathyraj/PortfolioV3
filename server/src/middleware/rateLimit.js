import rateLimit from 'express-rate-limit'
import { ApiError } from '../lib/errors.js'

/** Login brute-force protection: tight window, per IP, plus a harder cap overall. */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(new ApiError(429, 'RATE_LIMITED', 'Too many sign-in attempts. Try again in a few minutes.')),
})

/** Generous global API limiter so a misbehaving client cannot pin the process. */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
})