import { cn } from '../../utils/cn.js'
import { useSite } from '../../lib/usePublicData.js'

/**
 * Monogram + wordmark.
 *
 * The mark is drawn rather than imported so it inherits the theme's accent and
 * needs no asset request.
 */
export function Logo({ compact = false, className }) {
  const { site } = useSite()
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="relative flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-elevated"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
          <path d="M3 19 L9 5 h2 l6 14 h-2.4 L11 8.6 L7.4 19 Z" fill="var(--p-accent)" />
          <path
            d="M14.4 5 h4.1 a3.2 3.2 0 0 1 0 6.4 h-1.3 L19.6 19"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="text-fg"
          />
        </svg>
        <span className="absolute -bottom-px left-1/2 h-px w-3 -translate-x-1/2 bg-accent/60" />
      </span>

      {/*
        `sm:not-sr-only` is required alongside `sm:flex`: sr-only also applies a
        1px clip and absolute positioning, and overriding `display` alone would
        leave the wordmark clipped to invisibility on desktop.
      */}
      <span className={cn('flex flex-col leading-none', compact && 'sr-only sm:not-sr-only sm:flex')}>
        <span className="font-display text-[0.9375rem] font-semibold tracking-tight text-fg">
          {site.name}
        </span>
        <span className="mt-1 font-mono text-[0.625rem] tracking-[0.12em] text-subtle">
          {site.title.toUpperCase()}
        </span>
      </span>
    </span>
  )
}

export default Logo
