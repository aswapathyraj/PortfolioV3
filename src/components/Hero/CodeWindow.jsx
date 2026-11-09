import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSite } from '../../lib/usePublicData.js'
import { getSkillCategories } from '../../lib/publicData.js'
import { cn } from '../../utils/cn.js'
import { CornerTicks } from '../ui/Panel.jsx'

/**
 * Hero code visual.
 *
 * The object is generated from the live skill categories (falling back to the
 * static list before hydration) rather than written out, so the snippet can
 * never claim a technology the skills section does not list. The identity
 * lines (name/role) come from the live site profile via useSite().
 *
 * The type-on animation runs once, uses a single interval, and is skipped
 * entirely under `prefers-reduced-motion` — where the full snippet renders
 * immediately instead of animating faster.
 */

function allEntries(categories) {
  return categories.flatMap((category) => category.skills)
}

/** First `count` skills of a category, by name. */
function pick(categories, categoryId, count) {
  return (
    categories.find((category) => category.id === categoryId)?.skills.slice(0, count).map((skill) => skill.name) ?? []
  )
}

/** Named skills, by id — for lines that need specific entries, not the first N. */
function byIds(categories, ...ids) {
  const entries = allEntries(categories)
  return ids.map((id) => entries.find((skill) => skill.id === id)?.name).filter(Boolean)
}

const list = (values) => `[${values.map((value) => `"${value}"`).join(', ')}]`

function buildSnippet(name, title, categories) {
  return [
    'const developer = {',
    `  name: "${name}",`,
    `  role: "${title}",`,
    `  frontend: ${list(pick(categories, 'frontend', 2))},`,
    `  backend: ${list(pick(categories, 'backend', 2))},`,
    `  database: ${list(pick(categories, 'database', 2))},`,
    `  security: ${list(byIds(categories, 'jwt', 'bcrypt'))},`,
    `  deploy: ${list(byIds(categories, 'git', 'vercel'))},`,
    '  buildsEndToEnd: true,',
    '}',
  ]
}

/** Colours one line of the snippet without a highlighting dependency. */
function Line({ text, lineNumber, showCursor }) {
  const keyMatch = text.match(/^(\s*)([A-Za-z_$][\w$]*)(:)(.*)$/)
  const declMatch = text.match(/^(const)(\s+)([A-Za-z_$][\w$]*)(\s*=\s*)(\{)$/)

  let content

  if (declMatch) {
    const [, keyword, space, name, operator, brace] = declMatch
    content = (
      <>
        <span className="text-accent2">{keyword}</span>
        {space}
        <span className="text-fg">{name}</span>
        <span className="text-subtle">{operator}</span>
        <span className="text-subtle">{brace}</span>
      </>
    )
  } else if (keyMatch) {
    const [, indent, key, colon, rest] = keyMatch
    content = (
      <>
        {indent}
        <span className="text-accent2">{key}</span>
        <span className="text-subtle">{colon}</span>
        {rest.split(/("[^"]*"|true|false|\d+)/g).map((part, index) => {
          if (/^"/.test(part)) return <span key={index} className="text-accent">{part}</span>
          if (part === 'true' || part === 'false') return <span key={index} className="text-warn">{part}</span>
          if (/^\d+$/.test(part)) return <span key={index} className="text-warn">{part}</span>
          return <span key={index} className="text-subtle">{part}</span>
        })}
      </>
    )
  } else {
    content = <span className="text-subtle">{text}</span>
  }

  return (
    <div className="flex gap-3.5 sm:gap-4">
      <span aria-hidden="true" className="w-4 shrink-0 select-none text-right text-subtle tabular-nums">
        {lineNumber}
      </span>
      <span className="min-w-0 break-all">
        {content}
        {showCursor ? (
          <span className="ml-0.5 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] animate-pulse bg-accent" />
        ) : null}
      </span>
    </div>
  )
}

export function CodeWindow({ className }) {
  const { site } = useSite()
  const prefersReducedMotion = useReducedMotion()

  // Rebuilt on hydration so identity (name/role) and skill lists stay live.
  const categories = getSkillCategories()
  const lines = useMemo(
    () => buildSnippet(site.name, site.title, categories),
    [site.name, site.title, categories],
  )
  const fullLength = useMemo(() => lines.join('\n').length, [lines])

  const [typedRaw, setTyped] = useState(0)

  // Reduced motion shows the finished snippet — derived, so no effect is needed
  // to "correct" the animated value after the fact.
  const typed = prefersReducedMotion ? fullLength : typedRaw

  useEffect(() => {
    if (prefersReducedMotion) return

    /*
      Deliberately no "have I already started?" ref guard here. A ref survives
      StrictMode's mount → cleanup → mount cycle, so such a guard would let the
      first run arm the animation, the cleanup tear it down, and the second run
      exit early — leaving the panel permanently blank in development while
      working in production. Restarting on re-run is the safe behaviour.

      Time-based rather than tick-based so the speed is frame-rate independent,
      and self-terminating so no timer outlives the animation.
    */
    const CHARS_PER_MS = 0.09
    let frame = 0
    let startedAt = 0

    const tick = (now) => {
      if (!startedAt) startedAt = now
      const revealed = Math.min(Math.round((now - startedAt) * CHARS_PER_MS), fullLength)
      setTyped(revealed)
      if (revealed < fullLength) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [prefersReducedMotion, fullLength])

  const done = typed >= fullLength

  // Slice the joined snippet back into visible lines.
  const visible = useMemo(() => {
    let remaining = typed
    const out = []

    for (const line of lines) {
      if (remaining <= 0) break
      out.push(line.slice(0, remaining))
      remaining -= line.length + 1
    }

    return out
  }, [lines, typed])

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-panel border border-line bg-surface shadow-lift',
        className,
      )}
    >
      <CornerTicks />

      {/* Window chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-line bg-elevated/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="ml-1 font-mono text-[0.6875rem] text-subtle">developer.js</span>
        </div>
        <span className="mono-label hidden sm:inline">javascript</span>
      </div>

      {/* Snippet. Screen readers get the finished text, not the animation. */}
      <div
        className="px-4 py-5 font-mono text-[0.75rem] leading-[1.8] sm:px-5 sm:text-[0.8125rem]"
        aria-hidden="true"
      >
        {visible.map((text, index) => (
          <Line
            key={index}
            text={text}
            lineNumber={index + 1}
            showCursor={!done && index === visible.length - 1}
          />
        ))}
        {/* Reserve the final height so the panel does not grow while typing. */}
        {visible.length < lines.length
          ? Array.from({ length: lines.length - visible.length }, (_, index) => (
              <div key={`spacer-${index}`} className="h-[1.8em]" />
            ))
          : null}
      </div>

      <pre className="sr-only">{lines.join('\n')}</pre>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 border-t border-line bg-elevated/70 px-4 py-2">
        <span className="mono-label flex items-center gap-1.5 text-accent">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          {done ? 'ready' : 'writing'}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0.4 }}
          transition={{ duration: 0.3 }}
          className="mono-label"
        >
          {lines.length} lines
        </motion.span>
      </div>
    </div>
  )
}

export default CodeWindow
