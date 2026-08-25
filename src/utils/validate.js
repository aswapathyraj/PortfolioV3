/**
 * Contact form validation.
 *
 * This module is the single validator for the contact form *and* for the mock
 * `POST /api/contact` endpoint in the API Explorer — which is why the 422
 * responses shown there are real rather than illustrative.
 */

export const contactRules = {
  name: { min: 2, max: 80, label: 'Name' },
  email: { max: 254, label: 'Email' },
  subject: { min: 3, max: 120, label: 'Subject' },
  message: { min: 20, max: 2000, label: 'Message' },
}

/**
 * Pragmatic address check: one @, a dot-separated domain, no whitespace.
 * Deliberately not RFC-complete — the authoritative test is delivery.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export function validateField(field, rawValue) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : ''
  const rule = contactRules[field]
  if (!rule) return null

  if (!value) return `${rule.label} is required.`

  if (field === 'email') {
    if (value.length > rule.max) return 'Email is too long.'
    if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address.'
    return null
  }

  if (rule.min && value.length < rule.min) {
    return `${rule.label} must be at least ${rule.min} characters.`
  }
  if (rule.max && value.length > rule.max) {
    return `${rule.label} must be ${rule.max} characters or fewer.`
  }

  return null
}

/**
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateContact(values = {}) {
  const errors = {}

  for (const field of Object.keys(contactRules)) {
    const error = validateField(field, values[field])
    if (error) errors[field] = error
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/** Fields in submit order — used for focusing the first invalid input. */
export const contactFieldOrder = ['name', 'email', 'subject', 'message']
