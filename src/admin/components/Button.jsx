import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { Icon } from '../../components/ui/Icon.jsx'
import { Spinner } from './ui.jsx'

/**
 * Admin button. Variants mirror the site primitives but tuned for the denser
 * console UI (smaller default height, explicit loading state).
 */

const base =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out-quint ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-45'

const variants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover hover:shadow-glow',
  secondary: 'border border-line bg-elevated text-fg hover:border-line-strong hover:bg-surface',
  outline: 'border border-accent-line bg-accent-soft text-accent hover:border-accent hover:bg-accent/15',
  ghost: 'text-muted hover:bg-elevated hover:text-fg',
  danger: 'border border-danger/40 bg-danger-soft text-danger hover:border-danger/70',
}

const sizes = {
  sm: 'h-8 px-3 text-[0.8rem]',
  md: 'h-10 px-4 text-sm',
  icon: 'size-9 p-0',
  'icon-sm': 'size-8 p-0',
}

export const AdminButton = forwardRef(function AdminButton(
  { variant = 'primary', size = 'md', icon, iconRight, loading, className, children, ...rest },
  ref,
) {
  const classes = cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, className)
  return (
    <button ref={ref} className={classes} disabled={loading ?? rest.disabled} {...rest}>
      {loading ? <Spinner className="size-4" /> : icon ? <Icon name={icon} className="size-4 shrink-0" /> : null}
      {children ? <span>{children}</span> : null}
      {iconRight && !loading ? <Icon name={iconRight} className="size-4 shrink-0" /> : null}
    </button>
  )
})

export function AdminLink({ to, variant = 'secondary', size = 'md', icon, className, children, ...rest }) {
  const classes = cn(base, variants[variant] ?? variants.secondary, sizes[size] ?? sizes.md, className)
  return (
    <Link to={to} className={classes} {...rest}>
      {icon ? <Icon name={icon} className="size-4 shrink-0" /> : null}
      {children ? <span>{children}</span> : null}
    </Link>
  )
}

export function IconButton({ label, icon, size = 'icon', variant = 'ghost', className, ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(base, variants[variant] ?? variants.ghost, sizes[size] ?? sizes.icon, 'rounded-lg', className)}
      {...rest}
    >
      <Icon name={icon} className="size-[1.05rem]" />
    </button>
  )
}