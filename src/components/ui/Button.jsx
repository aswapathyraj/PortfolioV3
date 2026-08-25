import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { Icon } from './Icon.jsx'

/**
 * Button / link primitive.
 *
 * Polymorphic on purpose: a call to action is sometimes a <button>, sometimes an
 * internal <Link>, sometimes an external <a>. Keeping one component means the
 * three never drift visually, and the correct element is always used — which is
 * what keyboard and screen-reader behaviour depends on.
 *
 * Hover and press states are CSS transitions rather than Framer Motion: there
 * can be dozens of buttons on the page, and none of them need a JS animation
 * loop.
 */

const base =
  'group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-quint ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-45'

const variants = {
  primary:
    'bg-accent text-on-accent shadow-[0_1px_0_rgba(255,255,255,0.18)_inset] hover:bg-accent-hover hover:shadow-glow',
  secondary:
    'border border-line bg-elevated text-fg hover:border-line-strong hover:bg-surface',
  outline:
    'border border-accent-line bg-accent-soft text-accent hover:border-accent hover:bg-accent/15',
  ghost: 'text-muted hover:bg-elevated hover:text-fg',
  danger: 'border border-danger/40 bg-danger-soft text-danger hover:border-danger/70',
}

const sizes = {
  sm: 'h-9 px-3 text-[0.8125rem]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem]',
  icon: 'size-10 p-0',
  'icon-sm': 'size-9 p-0',
}

export const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    className,
    children,
    external,
    ...rest
  },
  ref,
) {
  const classes = cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, className)

  const content = (
    <>
      {icon ? <Icon name={icon} className="size-4 shrink-0" /> : null}
      {children ? <span className="truncate-safe">{children}</span> : null}
      {iconRight ? (
        <Icon
          name={iconRight}
          className={cn(
            'size-4 shrink-0 transition-transform duration-200 ease-out-quint',
            iconRight === 'arrowRight' && 'group-hover:translate-x-0.5',
            iconRight === 'arrowUpRight' && 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
          )}
        />
      ) : null}
    </>
  )

  // Internal route
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  // External or protocol link (mailto:, https:, /file.pdf)
  if (href) {
    const isExternal = external ?? /^https?:/i.test(href)
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        {...rest}
      >
        {content}
      </a>
    )
  }

  const Component = as ?? 'button'

  return (
    <Component ref={ref} className={classes} type={Component === 'button' ? 'button' : undefined} {...rest}>
      {content}
    </Component>
  )
})

/** Square button for icon-only affordances. `label` is required for a11y. */
export function IconButton({ label, icon, size = 'icon', variant = 'ghost', className, children, ...rest }) {
  return (
    <Button
      aria-label={label}
      title={label}
      size={size}
      variant={variant}
      className={cn('rounded-lg', className)}
      {...rest}
    >
      {children ?? <Icon name={icon} className="size-[1.05rem]" />}
    </Button>
  )
}

export default Button
