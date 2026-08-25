import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { methodTones, apiMeta } from '../../data/api.js'
import { mockRequest, statusText, SIMULATED_LATENCY_MS } from '../../utils/mockApi.js'
import { prettyJson } from '../../utils/format.js'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { CodeBlock } from '../ui/CodeBlock.jsx'
import { Tag } from '../ui/Tag.jsx'
import { cn } from '../../utils/cn.js'
import { swap } from '../../animations/variants.js'

/**
 * Request / response console for one endpoint.
 *
 * The request is editable — query params, path params, and the JSON body — and
 * the response comes from src/utils/mockApi.js, which reads this site's own data
 * and runs the contact form's real validator. Nothing is sent over the network,
 * and the UI says so rather than implying a round trip.
 *
 * The parent mounts this with `key={endpoint.id}`, so switching endpoints
 * remounts it with fresh state instead of needing an effect to clear the
 * previous request.
 */

const statusTone = (code) => {
  if (code >= 200 && code < 300) return 'accent'
  if (code >= 400 && code < 500) return 'warn'
  if (code >= 500) return 'danger'
  return 'neutral'
}

const toneClasses = {
  accent: 'border-accent-line bg-accent-soft text-accent',
  warn: 'border-warn/35 bg-warn/10 text-warn',
  danger: 'border-danger/35 bg-danger-soft text-danger',
  neutral: 'border-line bg-elevated text-muted',
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mono-label mb-1.5 block">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[0.6875rem] text-subtle">{hint}</span> : null}
    </label>
  )
}

const inputClasses =
  'w-full rounded-md border border-line bg-sunken px-2.5 py-2 font-mono text-[0.75rem] text-fg ' +
  'placeholder:text-subtle focus:border-accent-line focus:outline-none'

export function ApiConsole({ endpoint }) {
  const [queryValues, setQueryValues] = useState({})
  const [paramValues, setParamValues] = useState(() => endpoint.sampleParams ?? {})
  const [bodyText, setBodyText] = useState(() =>
    endpoint.sampleBody ? prettyJson(endpoint.sampleBody) : '',
  )
  const [bodyError, setBodyError] = useState(null)
  const [response, setResponse] = useState(null)
  const [pending, setPending] = useState(false)

  const resolvedPath = useMemo(() => {
    let path = endpoint.path

    for (const [key, value] of Object.entries(paramValues)) {
      if (value) path = path.replace(`:${key}`, encodeURIComponent(value))
    }

    const search = Object.entries(queryValues)
      .filter(([, value]) => value !== '' && value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')

    return search ? `${path}?${search}` : path
  }, [endpoint.path, paramValues, queryValues])

  const run = async () => {
    let body

    if (endpoint.body) {
      try {
        body = bodyText.trim() ? JSON.parse(bodyText) : {}
        setBodyError(null)
      } catch {
        setBodyError('Body is not valid JSON — fix it before running the request.')
        return
      }
    }

    setPending(true)
    const result = await mockRequest(endpoint.id, {
      params: paramValues,
      query: queryValues,
      body,
    })
    setResponse(result)
    setPending(false)
  }

  const tone = response ? statusTone(response.status) : 'neutral'

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Request line */}
      <div className="overflow-hidden rounded-panel border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3">
          <Tag tone={methodTones[endpoint.method] ?? 'neutral'} className="px-2 py-1 text-[0.625rem] font-semibold">
            {endpoint.method}
          </Tag>
          <code className="min-w-0 flex-1 truncate-safe font-mono text-[0.8125rem] text-fg">
            {resolvedPath}
          </code>
          <Button
            size="sm"
            onClick={run}
            disabled={pending}
            icon={pending ? 'spinner' : 'play'}
            className={cn('shrink-0', pending && '[&>svg]:animate-spin')}
          >
            {pending ? 'Running' : 'Run'}
          </Button>
        </div>

        <div className="p-4">
          <p className="text-[0.8125rem] leading-relaxed text-muted">{endpoint.description}</p>

          {/* Path params */}
          {endpoint.params?.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {endpoint.params.map((param) => (
                <Field key={param.name} label={`Path · ${param.name}`} hint={param.note}>
                  <input
                    type="text"
                    value={paramValues[param.name] ?? ''}
                    onChange={(event) =>
                      setParamValues((current) => ({ ...current, [param.name]: event.target.value }))
                    }
                    placeholder={param.type}
                    className={inputClasses}
                  />
                </Field>
              ))}
            </div>
          ) : null}

          {/* Query params */}
          {endpoint.query?.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {endpoint.query.map((param) => (
                <Field key={param.name} label={`Query · ${param.name}`} hint={param.note}>
                  <input
                    type="text"
                    value={queryValues[param.name] ?? ''}
                    onChange={(event) =>
                      setQueryValues((current) => ({ ...current, [param.name]: event.target.value }))
                    }
                    placeholder={`${param.type}${param.required ? '' : ' · optional'}`}
                    className={inputClasses}
                  />
                </Field>
              ))}
            </div>
          ) : null}

          {/* Body */}
          {endpoint.body ? (
            <div className="mt-4">
              <Field label="Request body · JSON">
                <textarea
                  value={bodyText}
                  onChange={(event) => setBodyText(event.target.value)}
                  rows={9}
                  spellCheck={false}
                  aria-invalid={Boolean(bodyError)}
                  className={cn(
                    inputClasses,
                    'scrollbar-thin resize-y leading-relaxed',
                    bodyError && 'border-danger/60',
                  )}
                />
              </Field>

              {bodyError ? (
                <p role="alert" className="mt-2 flex items-center gap-2 text-[0.75rem] text-danger">
                  <Icon name="error" className="size-3.5 shrink-0" />
                  {bodyError}
                </p>
              ) : (
                <p className="mt-2 text-[0.6875rem] text-subtle">
                  Edit any field to see the real validation errors — this endpoint uses the same
                  validator as the contact form.
                </p>
              )}
            </div>
          ) : null}

          {/* Documented statuses */}
          <div className="mt-4 border-t border-line pt-3.5">
            <p className="mono-label mb-2">Documented responses</p>
            <ul className="flex flex-wrap gap-1.5">
              {endpoint.statuses.map((status) => (
                <li key={status.code}>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[0.625rem]',
                      toneClasses[statusTone(status.code)],
                    )}
                    title={status.note}
                  >
                    <strong className="font-semibold">{status.code}</strong>
                    {status.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Response */}
      <div className="overflow-hidden rounded-panel border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <span className="mono-label">Response</span>

          {response ? (
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[0.625rem]',
                  toneClasses[tone],
                )}
              >
                <strong className="font-semibold">{response.status}</strong>
                {statusText[response.status] ?? ''}
              </span>
              <span className="mono-label" title="Fixed delay so the loading state is visible">
                {SIMULATED_LATENCY_MS}ms simulated
              </span>
            </span>
          ) : (
            <span className="mono-label">idle</span>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {pending ? (
            <motion.div
              key="pending"
              variants={swap}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-2.5 px-4 py-10 text-muted"
            >
              <Icon name="spinner" className="size-4 animate-spin text-accent" />
              <span className="font-mono text-[0.8125rem]">resolving locally…</span>
            </motion.div>
          ) : response ? (
            <motion.div key="body" variants={swap} initial="hidden" animate="visible" exit="exit">
              <CodeBlock
                code={prettyJson(response.body)}
                language="json"
                copyable
                maxHeight="24rem"
                className="rounded-none border-0"
              />
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              variants={swap}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="px-4 py-10 text-center text-[0.8125rem] text-subtle"
            >
              Run the request to see the response.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="flex items-start gap-2 rounded-inset border border-line bg-sunken px-3.5 py-3 text-[0.75rem] leading-relaxed text-subtle">
        <Icon name="info" className="mt-0.5 size-3.5 shrink-0" />
        {apiMeta.disclaimer}
      </p>
    </div>
  )
}

export default ApiConsole
