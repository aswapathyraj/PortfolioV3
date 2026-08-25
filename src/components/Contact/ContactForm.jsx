import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { siteConfig, isConfigured } from '../../config.js'
import { validateContact, validateField, contactRules, contactFieldOrder } from '../../utils/validate.js'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { cn } from '../../utils/cn.js'
import { swap } from '../../animations/variants.js'

/**
 * Contact form.
 *
 * Validation is real and shared with the mock POST /api/contact endpoint.
 * Delivery is real too when a provider is configured: `web3forms` posts to
 * Web3Forms, `endpoint` posts JSON anywhere, `mailto` opens the mail client.
 * With `provider = 'none'` — or a provider whose credentials are missing — a
 * valid submission says plainly that nothing was sent and hands the visitor a
 * prefilled mailto instead of showing a false "message sent".
 */

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

const FIELDS = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
  { name: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?', autoComplete: 'off' },
]

const EMPTY = { name: '', email: '', subject: '', message: '' }

export function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [state, setState] = useState('idle') // idle | submitting | success | fallback | error
  const [statusMessage, setStatusMessage] = useState('')

  const fieldRefs = useRef({})
  const botcheckRef = useRef(null)
  const { provider, endpoint, web3formsAccessKey, fromName } = siteConfig.contactForm

  /**
   * True when the selected provider has everything it needs to actually
   * deliver. Anything else drops to the honest mailto fallback.
   */
  const deliveryReady =
    (provider === 'web3forms' && isConfigured(web3formsAccessKey)) ||
    (provider === 'endpoint' && isConfigured(endpoint)) ||
    (provider === 'mailto' && isConfigured(siteConfig.email))

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))

    // Only re-validate a field the visitor has already left, so errors do not
    // appear while they are still typing the first character.
    if (touched[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value) || undefined }))
    }
  }

  const handleBlur = (name) => {
    setTouched((current) => ({ ...current, [name]: true }))
    setErrors((current) => ({ ...current, [name]: validateField(name, values[name]) || undefined }))
  }

  const mailtoHref = () => {
    if (!isConfigured(siteConfig.email)) return ''
    const subject = encodeURIComponent(values.subject || 'Portfolio enquiry')
    const body = encodeURIComponent(
      `${values.message}\n\n—\n${values.name}${values.email ? ` · ${values.email}` : ''}`,
    )
    return `mailto:${siteConfig.email}?subject=${subject}&body=${body}`
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { valid, errors: nextErrors } = validateContact(values)
    setTouched(Object.fromEntries(contactFieldOrder.map((field) => [field, true])))
    setErrors(nextErrors)

    if (!valid) {
      // Move focus to the first problem so keyboard users are not left guessing.
      const firstInvalid = contactFieldOrder.find((field) => nextErrors[field])
      fieldRefs.current[firstInvalid]?.focus()
      setState('idle')
      return
    }

    // ---- Nothing to deliver with: be explicit rather than pretend. ----
    if (!deliveryReady) {
      setState('fallback')
      setStatusMessage(
        provider === 'none'
          ? 'Your message is valid, but no delivery service is connected to this form yet — so nothing was sent.'
          : 'Your message is valid, but this form is not finished being set up — so nothing was sent.',
      )
      return
    }

    if (provider === 'mailto') {
      const href = mailtoHref()
      if (!href) {
        setState('error')
        setStatusMessage('No email address is configured to send to.')
        return
      }
      window.location.href = href
      setState('fallback')
      setStatusMessage('Your mail client should now be open with the message prefilled.')
      return
    }

    // ---- Real POST ----
    setState('submitting')

    const isWeb3Forms = provider === 'web3forms'
    const url = isWeb3Forms ? WEB3FORMS_ENDPOINT : endpoint
    const payload = isWeb3Forms
      ? {
          access_key: web3formsAccessKey,
          from_name: isConfigured(fromName) ? fromName : `${siteConfig.name} portfolio`,
          subject: values.subject,
          name: values.name,
          email: values.email,
          message: values.message,
          // Honeypot: bots that fill every field tick this and get rejected.
          botcheck: botcheckRef.current?.checked ? true : '',
        }
      : values

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })

      // Web3Forms answers 200 with `success: false` for spam and quota
      // rejections, so the body decides — not the status code alone.
      const result = isWeb3Forms ? await response.json().catch(() => null) : null

      if (!response.ok || (isWeb3Forms && !result?.success)) {
        setState('error')
        setStatusMessage(
          response.status === 429
            ? 'Too many messages sent from this address. Please try again shortly.'
            : result?.message
              ? `${result.message} Email works as a fallback.`
              : `The form service responded with ${response.status}. Email works as a fallback.`,
        )
        return
      }

      setState('success')
      setStatusMessage('Message sent. I will get back to you.')
      setValues(EMPTY)
      setTouched({})
      setErrors({})
    } catch {
      setState('error')
      setStatusMessage('Could not reach the form service — this may be a network issue.')
    }
  }

  const inputClasses = (name) =>
    cn(
      'w-full rounded-lg border bg-sunken px-3.5 py-2.5 text-[0.875rem] text-fg transition-colors duration-200',
      'placeholder:text-subtle focus:outline-none focus:ring-0',
      errors[name] && touched[name]
        ? 'border-danger/60 focus:border-danger'
        : 'border-line focus:border-accent-line',
    )

  const remaining = contactRules.message.max - values.message.length

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot: invisible to people, tempting to bots. Web3Forms drops any
          submission that arrives with this ticked. */}
      <input
        ref={botcheckRef}
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.slice(0, 2).map((field) => (
          <div key={field.name}>
            <label htmlFor={`contact-${field.name}`} className="mono-label mb-2 block">
              {field.label} <span className="text-accent">*</span>
            </label>
            <input
              id={`contact-${field.name}`}
              ref={(element) => {
                fieldRefs.current[field.name] = element
              }}
              type={field.type}
              value={values[field.name]}
              onChange={(event) => setValue(field.name, event.target.value)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(errors[field.name] && touched[field.name])}
              aria-describedby={errors[field.name] && touched[field.name] ? `contact-${field.name}-error` : undefined}
              className={inputClasses(field.name)}
            />
            <AnimatePresence>
              {errors[field.name] && touched[field.name] ? (
                <motion.p
                  id={`contact-${field.name}-error`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
                >
                  <Icon name="error" className="size-3 shrink-0" />
                  {errors[field.name]}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="mono-label mb-2 block">
          Subject <span className="text-accent">*</span>
        </label>
        <input
          id="contact-subject"
          ref={(element) => {
            fieldRefs.current.subject = element
          }}
          type="text"
          value={values.subject}
          onChange={(event) => setValue('subject', event.target.value)}
          onBlur={() => handleBlur('subject')}
          placeholder="What is this about?"
          aria-invalid={Boolean(errors.subject && touched.subject)}
          aria-describedby={errors.subject && touched.subject ? 'contact-subject-error' : undefined}
          className={inputClasses('subject')}
        />
        <AnimatePresence>
          {errors.subject && touched.subject ? (
            <motion.p
              id="contact-subject-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
            >
              <Icon name="error" className="size-3 shrink-0" />
              {errors.subject}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Message */}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor="contact-message" className="mono-label">
            Message <span className="text-accent">*</span>
          </label>
          <span
            className={cn(
              'mono-label tnum',
              remaining < 0 ? 'text-danger' : values.message.length > 0 && 'text-subtle',
            )}
          >
            {values.message.length} / {contactRules.message.max}
          </span>
        </div>
        <textarea
          id="contact-message"
          ref={(element) => {
            fieldRefs.current.message = element
          }}
          value={values.message}
          onChange={(event) => setValue('message', event.target.value)}
          onBlur={() => handleBlur('message')}
          rows={6}
          placeholder={`A few sentences about the role, project, or question — at least ${contactRules.message.min} characters.`}
          aria-invalid={Boolean(errors.message && touched.message)}
          aria-describedby={errors.message && touched.message ? 'contact-message-error' : undefined}
          className={cn(inputClasses('message'), 'resize-y leading-relaxed')}
        />
        <AnimatePresence>
          {errors.message && touched.message ? (
            <motion.p
              id="contact-message-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
            >
              <Icon name="error" className="size-3 shrink-0" />
              {errors.message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          as="button"
          type="submit"
          size="lg"
          disabled={state === 'submitting'}
          icon={state === 'submitting' ? 'spinner' : 'send'}
          className={cn(state === 'submitting' && '[&>svg]:animate-spin')}
        >
          {state === 'submitting' ? 'Sending…' : 'Send message'}
        </Button>

        {!deliveryReady ? (
          <span className="mono-label" title="Configure contactForm.provider in src/config.js">
            validation only · no provider connected
          </span>
        ) : null}
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {state === 'success' || state === 'fallback' || state === 'error' ? (
          <motion.div
            key={state}
            variants={swap}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="status"
            aria-live="polite"
            className={cn(
              'rounded-panel border p-4',
              state === 'success' && 'border-accent-line bg-accent-soft',
              state === 'fallback' && 'border-warn/35 bg-warn/[0.07]',
              state === 'error' && 'border-danger/35 bg-danger-soft',
            )}
          >
            <p className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-fg">
              <Icon
                name={state === 'success' ? 'checkCircle' : state === 'fallback' ? 'info' : 'error'}
                className={cn(
                  'mt-0.5 size-4 shrink-0',
                  state === 'success' && 'text-accent',
                  state === 'fallback' && 'text-warn',
                  state === 'error' && 'text-danger',
                )}
              />
              <span>{statusMessage}</span>
            </p>

            {state !== 'success' && isConfigured(siteConfig.email) ? (
              <div className="mt-3.5 flex flex-wrap gap-2">
                <Button href={mailtoHref()} size="sm" variant="secondary" icon="mail">
                  Send it by email instead
                </Button>
                <Button
                  as="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setState('idle')
                    setStatusMessage('')
                  }}
                >
                  Dismiss
                </Button>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  )
}

export default ContactForm
