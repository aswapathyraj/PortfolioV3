import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { lifecycleStages } from '../../data/about.js'
import { cn } from '../../utils/cn.js'
import { Icon } from '../ui/Icon.jsx'
import { useRovingIndex } from '../../hooks/useRovingIndex.js'
import { swap } from '../../animations/variants.js'

/**
 * Interactive build lifecycle.
 *
 * Implemented as an ARIA tablist so it works with a keyboard, not only a
 * pointer: arrow keys move between stages and the detail panel is the tabpanel.
 * Hover previews the stage without stealing selection on touch devices.
 */
export function Lifecycle() {
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(null)

  const { getItemProps } = useRovingIndex({
    count: lifecycleStages.length,
    selected,
    onSelect: setSelected,
  })

  const shownIndex = hovered ?? selected
  const stage = lifecycleStages[shownIndex]

  return (
    <div className="rounded-panel border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <span className="mono-label">Build lifecycle</span>
        <span className="mono-label hidden sm:inline">
          {String(shownIndex + 1).padStart(2, '0')} / {String(lifecycleStages.length).padStart(2, '0')}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Build lifecycle stages"
        aria-orientation="vertical"
        className="flex flex-col gap-1 p-3 sm:p-4 lg:flex-row lg:items-stretch lg:gap-0"
        onMouseLeave={() => setHovered(null)}
      >
        {lifecycleStages.map((item, index) => {
          const isActive = shownIndex === index
          const isSelected = selected === index

          return (
            <div key={item.id} className="flex min-w-0 flex-1 items-center lg:flex-col lg:gap-2">
              <button
                type="button"
                {...getItemProps(index)}
                id={`lifecycle-tab-${item.id}`}
                aria-controls="lifecycle-panel"
                onClick={() => setSelected(index)}
                onMouseEnter={() => setHovered(index)}
                onFocus={() => setHovered(null)}
                className={cn(
                  'group relative flex w-full min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ease-out-quint',
                  'lg:flex-col lg:items-center lg:gap-2 lg:px-2 lg:py-3 lg:text-center',
                  isActive
                    ? 'border-accent-line bg-accent-soft'
                    : 'border-transparent hover:border-line hover:bg-elevated',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
                    isActive
                      ? 'border-accent-line bg-surface text-accent'
                      : 'border-line bg-sunken text-subtle group-hover:text-fg',
                  )}
                >
                  <Icon name={item.icon} className="size-4" />
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate-safe font-display text-[0.8125rem] transition-colors duration-200',
                      isActive ? 'text-fg' : 'text-muted group-hover:text-fg',
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mono-label mt-1 hidden lg:block">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>

                {isSelected ? (
                  <motion.span
                    layoutId="lifecycle-marker"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-x-2 -bottom-px hidden h-0.5 rounded-full bg-accent lg:block"
                  />
                ) : null}
              </button>

              {/* Connector between stages */}
              {index < lifecycleStages.length - 1 ? (
                <Icon
                  name="chevronDown"
                  className="ml-1 size-3.5 shrink-0 text-line-strong lg:hidden"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Horizontal flow line, desktop only */}
      <div className="relative hidden px-4 lg:block" aria-hidden="true">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent" />
      </div>

      <div
        id="lifecycle-panel"
        role="tabpanel"
        aria-labelledby={`lifecycle-tab-${stage.id}`}
        className="min-h-[9.5rem] border-t border-line px-4 py-5 sm:px-5"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage.id}
            variants={swap}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="mono-label tnum text-accent">
                {String(shownIndex + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg text-fg">{stage.label}</h3>
              <span className="hidden text-sm text-subtle sm:inline">— {stage.summary}</span>
            </div>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted">
              {stage.detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Lifecycle
