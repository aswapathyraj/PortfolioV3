import { cn } from '../../utils/cn.js'
import { Icon } from './Icon.jsx'

/**
 * Small labelling primitives: tags, status dots, and the monospace chip used
 * throughout the technical sections.
 */

const tones = {
  neutral: 'border-line bg-elevated text-muted',
  accent: 'border-accent-line bg-accent-soft text-accent',
  accent2: 'border-accent2/35 bg-accent2-soft text-accent2',
  warn: 'border-warn/35 bg-warn/10 text-warn',
  danger: 'border-danger/35 bg-danger-soft text-danger',
  ghost: 'border-transparent bg-transparent text-subtle',
}

/** Technology chip / metadata tag. */
export function Tag({ tone = 'neutral', icon, className, children, mono = true, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[0.6875rem] leading-none',
        mono && 'font-mono tracking-[0.04em]',
        tones[tone] ?? tones.neutral,
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} className="size-3" /> : null}
      {children}
    </span>
  )
}

/** Pulsing availability indicator. The pulse is CSS, so reduced motion kills it. */
export function StatusDot({ tone = 'accent', pulse = true, className }) {
  const color =
    tone === 'accent' ? 'bg-accent' : tone === 'warn' ? 'bg-warn' : tone === 'danger' ? 'bg-danger' : 'bg-subtle'

  return (
    <span className={cn('relative flex size-2 shrink-0', className)} aria-hidden="true">
      {pulse ? (
        <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-60', color)} />
      ) : null}
      <span className={cn('relative inline-flex size-2 rounded-full', color)} />
    </span>
  )
}

/** Uppercase monospace caption. */
export function MonoLabel({ className, children, ...rest }) {
  return (
    <span className={cn('mono-label', className)} {...rest}>
      {children}
    </span>
  )
}

/** Numeric index badge used by the engineering and problem cards. */
export function NumberBadge({ children, active = false, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-1 font-mono text-[0.6875rem] tabular-nums transition-colors duration-200',
        active ? 'border-accent-line bg-accent-soft text-accent' : 'border-line bg-sunken text-subtle',
        className,
      )}
    >
      {children}
    </span>
  )
}


