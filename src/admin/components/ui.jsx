import { cn } from '../../utils/cn.js'
import { Icon } from '../../components/ui/Icon.jsx'

/** Shared admin primitives reusing the site's design tokens. */

export function Spinner({ className }) {
  return <Icon name="spinner" className={cn('size-4 animate-spin text-accent', className)} />
}

/** Page header with title, eyebrow and optional trailing actions. */
export function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mono-label mb-1.5 text-accent">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold text-fg sm:text-[1.7rem]">{children ?? title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function Card({ className, children, as: As = 'div', ...rest }) {
  return (
    <As className={cn('rounded-xl border border-line bg-surface p-5', className)} {...rest}>
      {children}
    </As>
  )
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h3 className="text-[0.95rem] font-semibold text-fg">{title}</h3>
        {description ? <p className="mt-0.5 text-[0.8rem] text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
  )
}

export function Badge({ tone = 'neutral', className, children }) {
  const tones = {
    neutral: 'border-line text-muted',
    accent: 'border-accent-line text-accent bg-accent-soft',
    success: 'border-success/40 text-success bg-success/10',
    warn: 'border-warn/40 text-warn bg-warn/10',
    danger: 'border-danger/40 text-danger bg-danger-soft',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] font-medium tracking-wide',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusDot({ status }) {
  const tone =
    status === 'published'
      ? 'bg-success'
      : status === 'draft'
        ? 'bg-warn'
        : status === 'archived'
          ? 'bg-subtle'
          : 'bg-muted'
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-muted">
      <span className={cn('size-1.5 rounded-full', tone)} />
      {status}
    </span>
  )
}

export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-sunken/50 px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-lg border border-line bg-elevated">
        <Icon name={icon} className="size-5 text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        {description ? <p className="mt-1 text-[0.8rem] text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-elevated', className)} />
}

/** Confirmation / inline alert strip. */
export function Alert({ tone = 'info', title, children, className }) {
  const tones = {
    info: 'border-accent-line bg-accent-soft text-accent',
    success: 'border-success/40 bg-success/10 text-success',
    warn: 'border-warn/40 bg-warn/10 text-warn',
    danger: 'border-danger/40 bg-danger-soft text-danger',
  }
  return (
    <div className={cn('rounded-lg border px-3.5 py-3 text-sm', tones[tone], className)}>
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? <div className="mt-0.5 opacity-90">{children}</div> : null}
    </div>
  )
}