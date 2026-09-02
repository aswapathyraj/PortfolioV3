import { ZodError } from 'zod'
import { ApiError } from '../lib/errors.js'

/**
 * Zod validation middleware. Validates `body` (default), `query`, or `params`
 * and replaces the target with the parsed value so downstream code sees typed
 * data, not raw input.
 */
export function validate(schema, target = 'body') {
  return (req, _res, next) => {
    try {
      const result = schema.parse(req[target])
      req[target] = result
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const details = {}
        for (const issue of err.issues) {
          const key = issue.path.join('.') || '_'
          details[key] = issue.message
        }
        return next(new ApiError(422, 'VALIDATION_ERROR', 'One or more fields are invalid.', details))
      }
      next(err)
    }
  }
}