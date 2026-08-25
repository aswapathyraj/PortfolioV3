import { cn } from '../../utils/cn.js'
import { Icon } from './Icon.jsx'
import { Button } from './Button.jsx'

/**
 * Empty / error / unconfigured state.
 *
 * Used everywhere data can be absent — an unset config value, a rate-limited
 * API, a filter with no matches — so a missing thing never renders as a broken
 * thing or a raw error.
 */
export function EmptyState({
  icon = 'empty',
  title,
  description,
  tone = 'neutral',
  action,
  className,
  children,
}) {
  const toneClasses = {
    neutral: 'border-line bg-sunken text-muted',
    warn: 'border-warn/25 bg-warn/[0.06] text-muted',
    danger: 'border-danger/25 bg-danger-soft text-muted',
  }

  const iconTone = {
    neutral: 'text-subtle',
    warn: 'text-warn',
    danger: 'text-danger',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed px-6 py-12 text-center',
        toneClasses[tone] ?? toneClasses.neutral,
        className,
      )}
    >
      <span
        className={cn(
          'flex size-11 items-center justify-center rounded-full border border-line bg-elevated',
          iconTone[tone] ?? iconTone.neutral,
        )}
      >
        <Icon name={icon} className="size-5" />
      </span>

      {title ? <p className="font-display text-base text-fg">{title}</p> : null}
      {description ? (
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted">{description}</p>
      ) : null}

      {children}

      {action ? (
        <Button size="sm" variant="secondary" className="mt-2" {...action}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}

/**
 * Dev-only hint pointing at the config file that would fill this gap. Stripped
 * from production builds so visitors never see internal instructions.
 */
export function ConfigHint({ field, className }) {
  if (!import.meta.env.DEV) return null

  return (
    <p className={cn('mono-label text-subtle', className)}>
      dev · set <span className="text-accent">{field}</span> in src/config.js
    </p>
  )
}

export default EmptyState
