import { cn } from '../../utils/cn.js'

/**
 * Surface primitive.
 *
 * `interactive` adds the hover border-lift used by cards that lead somewhere.
 * Everything else is a plain panel — no glass, no gradient by default.
 */
export function Panel({
  as: Component = 'div',
  interactive = false,
  inset = false,
  glow = false,
  className,
  children,
  ...rest
}) {
  return (
    <Component
      className={cn(
        'relative rounded-panel border',
        inset ? 'border-line bg-sunken' : 'border-line bg-surface',
        interactive &&
          'transition-[border-color,background-color,box-shadow,transform] duration-300 ease-out-quint ' +
            'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift',
        glow && 'shadow-panel',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}

/** Header row for a panel: title on the left, meta or actions on the right. */
export function PanelHeader({ title, meta, icon, className, children }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon}
        {title ? <span className="mono-label text-muted">{title}</span> : null}
      </div>
      {meta ? <span className="mono-label shrink-0">{meta}</span> : null}
      {children}
    </div>
  )
}

/**
 * Decorative corner ticks. Used sparingly on the hero and diagram frames to
 * suggest a technical drawing rather than a card.
 */
export function CornerTicks({ className }) {
  const corner = 'absolute size-2.5 border-accent/45'
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      <span className={cn(corner, '-left-px -top-px border-l border-t')} />
      <span className={cn(corner, '-right-px -top-px border-r border-t')} />
      <span className={cn(corner, '-bottom-px -left-px border-b border-l')} />
      <span className={cn(corner, '-bottom-px -right-px border-b border-r')} />
    </div>
  )
}

export default Panel
