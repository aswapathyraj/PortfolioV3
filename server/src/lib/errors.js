/**
 * Error envelope shared by every endpoint.
 *
 *   { success: false, error: { code, message, details? } }
 */

export class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/** Wraps an async route handler so a rejected promise reaches the error handler. */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` },
  })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    })
  }

  const status = err.statusCode ?? 500

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[api]', err)
  }

  const message =
    status >= 500 ? 'Internal server error' : err.message || 'Request failed'

  const code = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED')

  res.status(status).json({
    success: false,
    error: { code, message },
  })
}

export const ok = (res, data, status = 200) => res.status(status).json({ success: true, ...data })