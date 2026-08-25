import { motion } from 'framer-motion'
import { nodeKinds } from '../../data/architecture.js'
import { cn } from '../../utils/cn.js'
import { Icon } from '../ui/Icon.jsx'
import { drawPath } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Flow diagram.
 *
 * Renders a `rows: Node[][]` structure — used by the system architecture section
 * and by every project's own architecture block.
 *
 * Responsiveness was the design constraint: the layout is a CSS grid of rows, so
 * a row that fans out to three nodes on desktop becomes a single column on
 * mobile without any absolute positioning to recalculate. The connectors between
 * rows are separate elements rather than an SVG overlay, which is what lets the
 * whole thing reflow instead of scale.
 */

const toneStyles = {
  neutral: {
    border: 'border-line',
    bg: 'bg-elevated',
    icon: 'text-subtle',
    dot: 'bg-subtle',
    activeBorder: 'border-line-strong',
  },
  accent: {
    border: 'border-line',
    bg: 'bg-surface',
    icon: 'text-accent',
    dot: 'bg-accent',
    activeBorder: 'border-accent-line',
  },
  accent2: {
    border: 'border-line',
    bg: 'bg-surface',
    icon: 'text-accent2',
    dot: 'bg-accent2',
    activeBorder: 'border-accent2/45',
  },
  warn: {
    border: 'border-line',
    bg: 'bg-surface',
    icon: 'text-warn',
    dot: 'bg-warn',
    activeBorder: 'border-warn/45',
  },
}

const toneFor = (kind) => toneStyles[nodeKinds[kind]?.tone ?? 'neutral'] ?? toneStyles.neutral

/** Animated vertical connector between two rows. */
function Connector({ delay = 0, branching = false }) {
  return (
    <div className="flex justify-center py-2 sm:py-2.5" aria-hidden="true">
      {branching ? (
        <svg
          viewBox="0 0 200 34"
          preserveAspectRatio="none"
          className="h-8 w-full max-w-[min(100%,34rem)] overflow-visible"
        >
          <motion.path
            d="M100 0 V14 M20 34 V22 Q20 14 100 14 Q180 14 180 22 V34"
            fill="none"
            stroke="var(--p-line-strong)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            variants={drawPath(delay)}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          />
        </svg>
      ) : (
        <svg viewBox="0 0 2 32" preserveAspectRatio="none" className="h-8 w-px overflow-visible">
          <motion.path
            d="M1 0 V32"
            stroke="var(--p-line-strong)"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
            variants={drawPath(delay)}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          />
          <motion.circle
            cx="1"
            cy="30"
            r="1.6"
            fill="var(--p-accent)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={viewport}
            transition={{ delay: delay + 0.5, duration: 0.3 }}
          />
        </svg>
      )}
    </div>
  )
}

function Node({ node, selected, selectable, onSelect, index }) {
  const tone = toneFor(node.kind)
  const kindLabel = nodeKinds[node.kind]?.label ?? node.kind

  const inner = (
    <>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
            selected ? 'border-accent-line bg-accent-soft' : 'border-line bg-sunken',
            tone.icon,
          )}
        >
          <Icon name={node.icon} className="size-4" />
        </span>

        <span className="min-w-0 flex-1 text-left">
          <span
            className={cn(
              'block truncate-safe font-display text-[0.875rem] transition-colors duration-200',
              selected ? 'text-fg' : 'text-fg/90',
            )}
          >
            {node.label}
          </span>
          {node.sub ? (
            <span className="mt-0.5 block truncate-safe font-mono text-[0.625rem] text-subtle">
              {node.sub}
            </span>
          ) : null}
        </span>

        {selectable ? (
          <Icon
            name={selected ? 'check' : 'chevronRight'}
            className={cn(
              'size-3.5 shrink-0 transition-colors duration-200',
              selected ? 'text-accent' : 'text-line-strong',
            )}
          />
        ) : null}
      </div>

      <span
        className={cn(
          'absolute left-0 top-3 h-[calc(100%-1.5rem)] w-0.5 rounded-r-full transition-opacity duration-200',
          tone.dot,
          selected ? 'opacity-100' : 'opacity-30',
        )}
        aria-hidden="true"
      />
    </>
  )

  const classes = cn(
    'relative w-full min-w-0 overflow-hidden rounded-panel border px-3.5 py-3 transition-all duration-200 ease-out-quint',
    tone.bg,
    selected ? cn(tone.activeBorder, 'shadow-panel') : cn(tone.border),
    selectable && !selected && 'hover:border-line-strong hover:shadow-panel',
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.36, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0 flex-1"
    >
      {selectable ? (
        <button
          type="button"
          onClick={() => onSelect(node)}
          aria-pressed={selected}
          aria-label={`${node.label} — ${kindLabel} layer`}
          className={classes}
        >
          {inner}
        </button>
      ) : (
        <div className={classes}>{inner}</div>
      )}
    </motion.div>
  )
}

export function FlowDiagram({ rows = [], selectedId, onSelect, className }) {
  const selectable = typeof onSelect === 'function'

  return (
    <div className={cn('relative', className)}>
      <div className="grid-field-sm pointer-events-none absolute inset-0 rounded-panel opacity-40" aria-hidden="true" />

      <div className="relative flex flex-col p-4 sm:p-6">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            {/* Multi-node rows fan out only where there is room. */}
            <div
              className={cn(
                'flex flex-col gap-2.5',
                row.length > 1 && 'sm:flex-row sm:items-stretch sm:gap-3',
              )}
            >
              {row.map((node, nodeIndex) => (
                <Node
                  key={node.id}
                  node={node}
                  index={nodeIndex}
                  selected={selectedId === node.id}
                  selectable={selectable}
                  onSelect={onSelect}
                />
              ))}
            </div>

            {rowIndex < rows.length - 1 ? (
              <Connector
                delay={rowIndex * 0.08}
                branching={rows[rowIndex + 1].length > 1}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Legend mapping node kinds to their meaning. */
export function FlowLegend({ className }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      {Object.entries(nodeKinds).map(([kind, { label, tone }]) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn('size-1.5 rounded-full', toneStyles[tone]?.dot ?? 'bg-subtle')}
            aria-hidden="true"
          />
          <span className="mono-label">{label}</span>
        </li>
      ))}
    </ul>
  )
}

export default FlowDiagram
