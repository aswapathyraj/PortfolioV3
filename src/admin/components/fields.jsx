import { forwardRef } from 'react'
import { cn } from '../../utils/cn.js'
import { Icon } from '../../components/ui/Icon.jsx'

/** Admin form controls — styled to match the console aesthetic. */

const controlBase =
  'w-full rounded-lg border border-line bg-sunken/60 px-3 text-sm text-fg placeholder:text-subtle ' +
  'transition-[border-color,box-shadow] focus:border-accent focus:outline-none focus:ring-[1.5px] focus:ring-accent/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

export const Input = forwardRef(function Input({ className, invalid, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cn(controlBase, 'h-10', invalid ? 'border-danger/60' : '', className)}
      {...rest}
    />
  )
})

export const Textarea = forwardRef(function Textarea({ className, invalid, ...rest }, ref) {
  return (
    <textarea ref={ref} className={cn(controlBase, 'min-h-[110px] py-2.5', invalid && 'border-danger/60', className)} {...rest} />
  )
})

export const Select = forwardRef(function Select({ className, invalid, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(controlBase, 'h-10 pr-8 [&>option]:bg-elevated', invalid && 'border-danger/60', className)}
      {...rest}
    >
      {children}
    </select>
  )
})

/** Accessible field wrapper: label + help + error + control. */
export function Field({ label, htmlFor, description, error, required, children }) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={htmlFor} className="flex items-center gap-1 text-[0.8rem] font-medium text-fg">
          {label}
          {required ? <span className="text-danger">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-[0.78rem] text-danger">{error}</p> : null}
      {description && !error ? <p className="text-[0.78rem] text-muted">{description}</p> : null}
    </div>
  )
}

/** Expands an api error `details` map into per-field messages. */
export function fieldErrors(details) {
  if (!details || typeof details !== 'object') return {}
  return details
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={cn('flex cursor-pointer items-center justify-between gap-3', disabled && 'opacity-50')}>
      <div className="min-w-0">
        {label ? <span className="block text-sm font-medium text-fg">{label}</span> : null}
        {description ? <span className="mt-0.5 block text-[0.78rem] text-muted">{description}</span> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-accent bg-accent' : 'border-line-strong bg-elevated',
          disabled && 'cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-fg transition-[left]',
            checked ? 'left-[1.4rem]' : 'left-[0.2rem]',
          )}
        />
      </button>
    </label>
  )
}

export function IconPicker({ name, onChange, options }) {
  const known = options ?? ['git', 'terminal', 'server', 'shield', 'lock', 'database', 'gears', 'code', 'cloud', 'zap']
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {known.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          title={icon}
          className={cn(
            'flex size-9 items-center justify-center rounded-lg border transition-colors',
            name === icon ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-sunken text-muted hover:text-fg',
          )}
        >
          <Icon name={icon} className="size-4" />
        </button>
      ))}
    </div>
  )
}